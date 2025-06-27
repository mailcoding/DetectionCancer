import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import './NouvelExamen.css';

interface Biopsie {
  id: number;
  date: string;
  resultat: string;
  rapport_url?: string;
}

const ExamenBiopsie: React.FC = () => {
  const [biopsie, setBiopsie] = useState<Biopsie | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<Biopsie>('/detection/biopsie/')
      .then(setBiopsie)
      .catch(() => setBiopsie(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="nouvel-examen-container">
      <div className="main-content">
        <div className="left-col">
          <div className="dicom-tools">
            <div>Outils biopsie :</div>
            <button className="custom-btn">Ajouter résultat</button>
            {biopsie?.rapport_url && (
              <a className="custom-btn" href={biopsie.rapport_url} target="_blank" rel="noopener noreferrer">Télécharger rapport</a>
            )}
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
