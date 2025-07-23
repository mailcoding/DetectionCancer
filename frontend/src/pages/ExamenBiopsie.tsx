import React, { useEffect, useState, useRef, DragEvent } from 'react';
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
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);
  const [patientInfo, setPatientInfo] = useState<{biopsies: Biopsie[]; lastDate?: string} | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadStatus, setUploadStatus] = useState<{[name: string]: 'pending'|'success'|'error'}>({});
  const [dragActive, setDragActive] = useState(false);
  const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

  useEffect(() => {
    apiFetch<Biopsie>('/detection/biopsie/')
      .then(setBiopsie)
      .catch(() => setBiopsie(null))
      .finally(() => setLoading(false));
    apiFetch<Biopsie[]>('/detection/biopsies/')
      .then(data => setBiopsies(data))
      .catch(() => setBiopsies([]));
    apiFetch<string[]>('/detection/biopsie/patients/')
      .then(data => setPatients(data))
      .catch(() => setPatients([]));
  }, []);

  // Met à jour les infos patient quand sélectionné
  useEffect(() => {
    if (selectedPatient && biopsies.length > 0) {
      const biopsiesPatient = biopsies.filter(b => b.patient === selectedPatient);
      const lastDate = biopsiesPatient.length > 0 ? biopsiesPatient[0].date : undefined;
      setPatientInfo({ biopsies: biopsiesPatient, lastDate });
    } else {
      setPatientInfo(null);
    }
  }, [selectedPatient, biopsies]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (selectedFiles.length === 0) {
      setError('Veuillez sélectionner au moins un fichier PDF, PNG ou JPEG.');
      return;
    }
    const token = localStorage.getItem('token');
    const formData = new FormData();
    selectedFiles.forEach(f => formData.append('files', f));
    setUploadStatus(Object.fromEntries(selectedFiles.map(f => [f.name, 'pending'])));
    const res = await fetch(`${API_URL}/detection/biopsies/upload/`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) {
      setError('Erreur lors de l’upload.');
      setUploadStatus(Object.fromEntries(selectedFiles.map(f => [f.name, 'error'])));
    } else {
      setError('Upload réussi !');
      setUploadStatus(Object.fromEntries(selectedFiles.map(f => [f.name, 'success'])));
      setSelectedFiles([]);
      if (fileInput.current) fileInput.current.value = '';
      apiFetch<Biopsie[]>('/detection/biopsies/').then(setBiopsies);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const files = Array.from(e.target.files).filter(f => ['application/pdf', 'image/png', 'image/jpeg'].includes(f.type));
    setSelectedFiles(files);
    setError(files.length === 0 ? 'Aucun fichier valide sélectionné.' : null);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files).filter(f => ['application/pdf', 'image/png', 'image/jpeg'].includes(f.type));
    setSelectedFiles(files);
    setError(files.length === 0 ? 'Aucun fichier valide sélectionné.' : null);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
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
                Sélectionner ou glisser-déposer un ou plusieurs fichiers PDF, PNG ou JPEG :
              </label>
              <div
                className={`dropzone${dragActive ? ' drag-active' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                style={{
                  border: dragActive ? '2px solid #1976d2' : '2px dashed #aaa',
                  borderRadius: 8,
                  padding: 24,
                  textAlign: 'center',
                  background: dragActive ? '#e3f2fd' : '#fafbfc',
                  marginBottom: 12,
                  cursor: 'pointer',
                  transition: 'background 0.2s, border 0.2s',
                }}
                onClick={() => fileInput.current?.click()}
              >
                {selectedFiles.length === 0 ? (
                  <span>Glissez-déposez ici ou cliquez pour sélectionner des fichiers</span>
                ) : (
                  <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
                    {selectedFiles.map(f => (
                      <li key={f.name} style={{marginBottom: 6, display: 'flex', alignItems: 'center'}}>
                        <span style={{marginRight: 8}}>{f.type.startsWith('image') ? '🖼️' : '📄'}</span>
                        <span style={{fontWeight: 500}}>{f.name}</span>
                        <span style={{marginLeft: 8, color: '#888', fontSize: 13}}>{(f.size/1024).toFixed(1)} Ko</span>
                        {uploadStatus[f.name] === 'success' && <span style={{color: 'green', marginLeft: 8}}>✔️</span>}
                        {uploadStatus[f.name] === 'error' && <span style={{color: 'red', marginLeft: 8}}>❌</span>}
                        {f.type.startsWith('image') && (
                          <img src={URL.createObjectURL(f)} alt="preview" style={{height: 32, marginLeft: 8, borderRadius: 4, boxShadow: '0 1px 4px #ccc'}} />
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                <input
                  id="biopsie-pdf-upload"
                  type="file"
                  accept="application/pdf,image/png,image/jpeg"
                  ref={fileInput}
                  title="Sélectionner un ou plusieurs fichiers PDF, PNG ou JPEG"
                  multiple
                  style={{display: 'none'}}
                  onChange={handleFileChange}
                />
              </div>
              <button className="custom-btn" type="submit" style={{marginTop: 12}}>{loading ? <span className="loader"></span> : 'Analyser'}</button>
            </form>
            {error && <div className="biopsie-error">{error}</div>}
            {biopsie?.rapport_url && (
              <a className="custom-btn" href={biopsie.rapport_url} target="_blank" rel="noopener noreferrer">Télécharger rapport</a>
            )}
            {/* Plus de preview ici, tout est dans la dropzone */}
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
            <div style={{marginBottom: 12}}>
              <label htmlFor="select-patient">Sélectionner un patient : </label>
              <select
                id="select-patient"
                value={selectedPatient || ''}
                onChange={e => setSelectedPatient(e.target.value || null)}
                style={{marginLeft: 8, padding: 4, borderRadius: 4}}
              >
                <option value="">-- Choisir --</option>
                {patients.map(p => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            {selectedPatient && patientInfo ? (
              <ul>
                <li><b>Nom patient :</b> {selectedPatient}</li>
                <li><b>Nombre de biopsies :</b> {patientInfo.biopsies.length}</li>
                <li><b>Dernière date :</b> {patientInfo.lastDate || 'N/A'}</li>
                <li><b>Résultats récents :</b>
                  <ul style={{marginLeft: 12}}>
                    {patientInfo.biopsies.slice(0,3).map(b => (
                      <li key={b.id}>Résultat : {b.resultat} ({b.date})</li>
                    ))}
                  </ul>
                </li>
              </ul>
            ) : (
              <div style={{color: '#888'}}>Sélectionnez un patient pour voir le détail.</div>
            )}
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
