import React from 'react';
import PatientTimeline from '../components/PatientTimeline';

const ComparaisonIA: React.FC = () => {
  return (
    <div className="comparaison-ia-container" style={{maxWidth: 900, margin: '0 auto', padding: 32}}>
      <h2>Comparaison temporelle IA</h2>
      <PatientTimeline />
    </div>
  );
};

export default ComparaisonIA;
