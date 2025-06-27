import React from 'react';
import DashboardMedecin from './DashboardMedecin';
import DashboardInfirmier from './DashboardInfirmier';
import DashboardPatient from './DashboardPatient';
import DashboardDirecteur from './DashboardDirecteur';
import DashboardChefPoste from './DashboardChefPoste';

const Dashboard: React.FC = () => {
  // Récupérer le rôle de l'utilisateur (à stocker lors de l'authentification)
  const role = localStorage.getItem('role');
  const username = localStorage.getItem('username');

  let dashboardContent;
  switch (role) {
    case 'medecin':
      dashboardContent = <DashboardMedecin />;
      break;
    case 'infirmier':
      dashboardContent = <DashboardInfirmier />;
      break;
    case 'patient':
      dashboardContent = <DashboardPatient />;
      break;
    case 'directeur':
      dashboardContent = <DashboardDirecteur />;
      break;
    case 'chef_poste':
      dashboardContent = <DashboardChefPoste />;
      break;
    default:
      dashboardContent = (
        <div className="dashboard-container">
          <h1>Bienvenue sur le Dashboard</h1>
          <p>Bonjour, <b>{username}</b> !</p>
          <p>Votre tableau de bord personnalisé apparaîtra ici selon votre rôle.</p>
        </div>
      );
  }

  return dashboardContent;
};

export default Dashboard;
