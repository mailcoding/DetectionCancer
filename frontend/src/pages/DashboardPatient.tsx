import React from 'react';

const DashboardPatient: React.FC = () => {
  return (
    <div className="dashboard-container">
      <h1>Tableau de bord Patient</h1>
      <ul>
        <li>Voir mes mammographies et résultats de biopsie</li>
        <li>Recevoir des notifications et rappels</li>
        <li>Accéder à mes rapports médicaux</li>
      </ul>
    </div>
  );
};

export default DashboardPatient;
