import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import './NouvelExamen.css';

interface Examen {
  id: number;
  date: string;
  type: string;
  resultat: string;
}

const HistoriquePatient: React.FC = () => {
  const [examens, setExamens] = useState<Examen[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtre, setFiltre] = useState<'Tous' | 'Examens' | 'Biopsies'>('Tous');

  useEffect(() => {
    apiFetch<Examen[]>('/detection/historique/')
      .then(setExamens)
      .catch(() => setExamens([]))
      .finally(() => setLoading(false));
  }, []);

  const examensFiltres = examens.filter(ex => {
    if (filtre === 'Tous') return true;
    if (filtre === 'Examens') return ex.type.toLowerCase().includes('mammo') || ex.type.toLowerCase().includes('examen');
    if (filtre === 'Biopsies') return ex.type.toLowerCase().includes('biopsie');
    return true;
  });

  return (
    <div className="nouvel-examen-container">
      <div className="main-content">
        <div className="left-col">
          <div className="dicom-tools">
            <div>Filtres :</div>
            <button className="custom-btn" onClick={() => setFiltre('Examens')}>Examens</button>
            <button className="custom-btn" onClick={() => setFiltre('Biopsies')}>Biopsies</button>
            <button className="custom-btn" onClick={() => setFiltre('Tous')}>Tous</button>
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
          <div className="historique-list">
            <h4>Liste des examens précédents</h4>
            {loading ? <div>Chargement...</div> : (
              <ul>
                {examensFiltres.map(ex => (
                  <li key={ex.id}>{ex.date} - {ex.type} - Résultat : {ex.resultat}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HistoriquePatient;
