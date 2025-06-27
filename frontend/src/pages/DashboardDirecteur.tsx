import React from 'react';

const DashboardDirecteur: React.FC = () => {
  return (
    <div className="dashboard-container">
      <h1>Tableau de bord Directeur d’hôpital</h1>
      <ul>
        <li>Statistiques globales</li>
        <li>Gestion des utilisateurs et des accès</li>
        <li>Rapports d’activité</li>
      </ul>
    </div>
  );
};

export default DashboardDirecteur;
