import React from 'react';
import { ExamenMedical } from './types';

const ExamDetails: React.FC<{ exam: ExamenMedical }> = ({ exam }) => (
  <div className="exam-details" style={{background: '#f7f7fa', borderRadius: 8, padding: 16, boxShadow: '0 2px 8px #eee'}}>
    <h4>Détail de l'examen</h4>
    <ul>
      <li><b>Date :</b> {exam.date}</li>
      <li><b>Type :</b> {exam.type}</li>
      <li><b>Score IA :</b> {exam.score_ia ?? 'N/A'}</li>
      <li><b>Findings :</b> {exam.findings ?? 'N/A'}</li>
      <li><b>Advice :</b> {exam.advice ?? 'N/A'}</li>
      <li><b>Interpretation :</b> {exam.interpretation ?? 'N/A'}</li>
      {exam.rapport_url && (
        <li><a href={exam.rapport_url} target="_blank" rel="noopener noreferrer">Télécharger le rapport</a></li>
      )}
    </ul>
  </div>
);

export default ExamDetails;
