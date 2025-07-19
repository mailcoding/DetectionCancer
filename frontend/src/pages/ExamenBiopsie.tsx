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
    if (!file || file.type !== 'application/pdf') {
      setError('Veuillez sélectionner un fichier PDF.');
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
                accept="application/pdf"
                ref={fileInput}
                title="Sélectionner un fichier PDF"
              />
              <button className="custom-btn" type="submit">Ajouter résultat (PDF)</button>
            </form>
            {error && <div className="biopsie-error">{error}</div>}
            {biopsie?.rapport_url && (
              <a className="custom-btn" href={biopsie.rapport_url} target="_blank" rel="noopener noreferrer">Télécharger rapport</a>
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
        <div className="center-col">
          <div className="biopsie-patients-block">
            <h4>Patients en cours de biopsie</h4>
            <ul>
              {patients.length === 0 && <li>Aucun patient en cours</li>}
              {patients.map((p, i) => (
                <li key={i}>{p}</li>
              ))}
            </ul>
          </div>
        </div>
        <div className="right-col">
          <div className="patient-meta">
            <h4>Résumé patient</h4>
            {/* À remplacer par des données dynamiques si besoin */}
            <ul>
              <li>Âge : 52 ans</li>
              <li>Sexe : Féminin</li>
              <li>Antécédents familiaux : Oui</li>
            </ul>
          </div>
          <div className="biopsie-result">
            <h4>Résultat de la biopsie</h4>
            {loading ? <div>Chargement...</div> : (
              <p>{biopsie ? biopsie.resultat : 'Pas de résultat disponible pour l’instant.'}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamenBiopsie;
