import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import './DossiersPatients.css';

interface Patient {
  id: number;
  username: string;
  nom: string;
  prenom: string;
  urgence: number;
  medecin: number | null;
}

const DossiersPatients: React.FC = () => {
  const [mesPatients, setMesPatients] = useState<Patient[]>([]);
  const [orphelins, setOrphelins] = useState<Patient[]>([]);
  const [tab, setTab] = useState<'mes' | 'orphelins'>('mes');
  const userId = Number(localStorage.getItem('user_id'));

  useEffect(() => {
    // Récupérer les patients du médecin
    apiFetch<Patient[]>(`/detection/patients/?medecin_id=${userId}`)
      .then(setMesPatients);
    // Récupérer les patients sans médecin, triés par urgence
    apiFetch<Patient[]>(`/detection/patients/?medecin_id=null&ordering=-urgence`)
      .then(setOrphelins);
  }, [userId]);

  const handlePrendreEnCharge = async (patientId: number) => {
    await apiFetch('/detection/patients/transfer/', {
      method: 'POST',
      body: JSON.stringify({ patient_id: patientId, medecin_cible_id: userId, motif: 'Prise en charge' }),
      headers: { 'Content-Type': 'application/json' },
    });
    // Refresh lists
    apiFetch<Patient[]>(`/detection/patients/?medecin_id=${userId}`)
      .then(setMesPatients);
    apiFetch<Patient[]>(`/detection/patients/?medecin_id=null&ordering=-urgence`)
      .then(setOrphelins);
  };

  return (
    <div className="dossiers-patients-container">
      <div className="dossiers-tabs">
        <button className={tab==='mes' ? 'active' : ''} onClick={() => setTab('mes')}>Mes patients</button>
        <button className={tab==='orphelins' ? 'active' : ''} onClick={() => setTab('orphelins')}>À prendre en charge</button>
      </div>
      {tab === 'mes' && (
        <div className="dossiers-list">
          {mesPatients.length === 0 ? <div>Aucun patient suivi.</div> : (
            <ul>
              {mesPatients.map(p => (
                <li key={p.id} className="dossier-item">
                  <span>{p.prenom} {p.nom} ({p.username})</span>
                  <span className="urgence-badge">Urgence : {p.urgence}</span>
                  {/* Lien vers la fiche patient, historique, etc. */}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {tab === 'orphelins' && (
        <div className="dossiers-list">
          {orphelins.length === 0 ? <div>Aucun patient à prendre en charge.</div> : (
            <ul>
              {orphelins.map(p => (
                <li key={p.id} className="dossier-item">
                  <span>{p.prenom} {p.nom} ({p.username})</span>
                  <span className="urgence-badge">Urgence : {p.urgence}</span>
                  <button className="custom-btn" onClick={() => handlePrendreEnCharge(p.id)}>
                    Prendre en charge
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default DossiersPatients;
