import React, { useEffect, useState, useRef } from 'react';
import { apiFetch } from '../api';
import './NouvelExamen.css';

interface Biopsie {
  id: number;
  date: string;
  resultat: string;
  rapport_url?: string;
  patient?: string;
}

const ExamenBiopsie: React.FC = () => {
  const [biopsie, setBiopsie] = useState<Biopsie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [biopsies, setBiopsies] = useState<Biopsie[]>([]);
  const [patients, setPatients] = useState<string[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => {
    apiFetch<Biopsie>('/detection/biopsie/')
      .then(setBiopsie)
      .catch(() => setBiopsie(null))
      .finally(() => setLoading(false));
    // Liste de tous les PDF uploadés
    apiFetch<Biopsie[]>('/detection/biopsies/')
      .then(data => setBiopsies(data))
      .catch(() => setBiopsies([]));
    // Liste des patients en biopsie (supposé endpoint /detection/biopsie/patients/)
    apiFetch<string[]>('/detection/biopsie/patients/')
      .then(data => setPatients(data))
      .catch(() => setPatients([]));
  }, []);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const file = fileInput.current?.files?.[0];
    if (!file || !['application/pdf', 'image/png', 'image/jpeg'].includes(file.type)) {
      setError('Veuillez sélectionner un fichier PDF, PNG ou JPEG.');
      return;
    }
    const formData = new FormData();
    formData.append('file', file);
    const token = localStorage.getItem('token');
    const res = await fetch(`${API_URL}/detection/biopsies/upload/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) {
      setError('Erreur lors de l’upload.');
    } else {
      setError('Upload réussi !');
      // Recharger la liste après upload
      apiFetch<Biopsie[]>('/detection/biopsies/').then(setBiopsies);
    }
  };

  return (
    <div className="nouvel-examen-container">
      {/* <div className="tabs">
        <div className="tab active">🔬 Biopsie</div>
      </div> */}
      <div className="main-content">
        <div className="left-col">
          <div className="dicom-tools">
            <div>Outils biopsie :</div>
            <form onSubmit={handleUpload} className="biopsie-upload-form">
              <label htmlFor="biopsie-pdf-upload" className="biopsie-pdf-label">
                Sélectionner le fichier PDF du résultat :
              </label>
              <input
                id="biopsie-pdf-upload"
                type="file"
                accept="application/pdf,image/png,image/jpeg"
                ref={fileInput}
                title="Sélectionner un fichier PDF, PNG ou JPEG"
              />
              <button className="custom-btn" type="submit">{loading ? <span className="loader"></span> : 'Analyser'}</button>
            </form>
            {error && <div className="biopsie-error">{error}</div>}
            {biopsie?.rapport_url && (
              <a className="custom-btn" href={biopsie.rapport_url} target="_blank" rel="noopener noreferrer">Télécharger rapport</a>
            )}
            {/* Preview fichier uploadé */}
            {fileInput.current?.files?.[0] && (
              <div className="pdf-preview">
                {fileInput.current.files[0].type === 'application/pdf' ? (
                  <p>Fichier PDF chargé : {fileInput.current.files[0].name}</p>
                ) : (
                  <div>
                    <p>Image chargée : {fileInput.current.files[0].name}</p>
                    <img
                      src={URL.createObjectURL(fileInput.current.files[0])}
                      alt="Prévisualisation de la biopsie"
                      style={{maxWidth: '220px', maxHeight: '220px', borderRadius: '8px', marginTop: '8px', boxShadow: '0 2px 8px #ccc'}}
                    />
                  </div>
                )}
              </div>
            )}
            <div className="biopsie-list-block">
              <h4>PDF de biopsie uploadés</h4>
              <ul>
                {biopsies.length === 0 && <li>Aucun PDF disponible</li>}
                {biopsies.map(b => (
                  <li key={b.id}>
                    <a href={b.rapport_url} target="_blank" rel="noopener noreferrer">PDF #{b.id} - {b.date}</a>
                    {b.patient && <span> (Patient : {b.patient})</span>}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="right-col">
          <div className="patient-meta">
            <h4>Résumé patient</h4>
            <ul>
              <li>Âge : 52 ans</li>
              <li>Sexe : Féminin</li>
              <li>Antécédents familiaux : Oui</li>
            </ul>
          </div>
          <div className="ia-prediction">
            <h4>Résultat IA/biopsie</h4>
            {loading ? <div>Chargement...</div> : (
              biopsie ? (
                <div className="ia-result-block">
                  <div className="ia-header">
                    <span className="ia-format">{biopsie.rapport_url ? '📄' : '❓'}</span>
                    <span className="ia-score">{biopsie.resultat}</span>
                  </div>
                  <div className="ia-findings">{biopsie.patient && `Patient : ${biopsie.patient}`}</div>
                </div>
              ) : (
                <p>Pas de résultat disponible pour l’instant.</p>
              )
            )}
            <button className="custom-btn" disabled>🔍 Voir explications IA</button>
          </div>
          <div className="actions">
            <button className="custom-btn">🖊️ Annoter</button>
            <button className="custom-btn">📤 Exporter PDF</button>
            <button className="custom-btn">🗣️ Demander un avis</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamenBiopsie;
