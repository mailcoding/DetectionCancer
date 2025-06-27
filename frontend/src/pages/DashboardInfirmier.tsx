import React from 'react';

const DashboardInfirmier: React.FC = () => {
  return (
    <div className="dashboard-container">
      <h1>Tableau de bord Infirmier</h1>
      <ul>
        <li>Suivi des patients</li>
        <li>Accès aux résultats de mammographie et biopsie</li>
        <li>Gestion des rendez-vous</li>
      </ul>
    </div>
  );
};

export default DashboardInfirmier;
