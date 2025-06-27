import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import './DashboardMedecin.css';

interface MedicalImage {
  id: number;
  analysis_result: {
    malignancy_score: number;
    findings: string[];
    birads?: string;
  };
  created_at: string;
  image: string;
}

const BibliothequeMedecin: React.FC<{ filter: string }>= ({ filter }) => {
  const [images, setImages] = useState<MedicalImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<MedicalImage[]>('/detection/images/')
      .then(setImages)
      .catch(() => setImages([]))
      .finally(() => setLoading(false));
  }, []);

  // Filtrage selon l'onglet sélectionné
  const filtered = images.filter(img => {
    if (filter === 'Urgents') {
      const findings = img.analysis_result.findings.join(' ').toLowerCase();
      return findings.includes('bi-rads 4') || findings.includes('bi-rads 5') || (img.analysis_result.malignancy_score >= 0.8);
    }
    if (filter === 'En attente') {
      return img.analysis_result.findings.length === 0;
    }
    return true;
  });

  return (
    <div className="biblio-container">
      <h2>Bibliothèque d'examens</h2>
      {loading ? <div>Chargement...</div> : (
        <table className="biblio-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Date</th>
              <th>Résultat</th>
              <th>Score</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(img => (
              <tr key={img.id}>
                <td>{img.id}</td>
                <td>{new Date(img.created_at).toLocaleDateString()}</td>
                <td>{img.analysis_result.findings.join(', ')}</td>
                <td>{(img.analysis_result.malignancy_score * 100).toFixed(1)}%</td>
                <td>
                  <button className="custom-btn">Voir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default BibliothequeMedecin;
