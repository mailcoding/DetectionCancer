import React, { useState } from 'react';
import logo from '../images/logo.png';
import './DashboardMedecin.css';
import NouvelExamen from './NouvelExamen';
import DashboardMedecinBoard from './DashboardMedecinBoard';

import DossiersPatients from './DossiersPatients';
import BibliothequeMedecin from './BibliothequeMedecin';

const notifications = [
  { id: 1, message: 'Nouveau BI-RADS 4 détecté pour Mme Diop.' },
  { id: 2, message: 'Résultat de biopsie urgent pour M. Fall.' },
];

const patients = [
  { id: 'P001', name: 'Awa Diop' },
  { id: 'P002', name: 'Mamadou Fall' },
  { id: 'P003', name: 'Fatou Ndiaye' },
  // ...
];

const DashboardMedecin: React.FC = () => {
  const [search, setSearch] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<{id: string, name: string} | null>(null);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [showBiblio, setShowBiblio] = useState(false);
  const [biblioFilter, setBiblioFilter] = useState('Tous');

  // Récupération du nom et rôle utilisateur depuis le localStorage
  const username = localStorage.getItem('username') || 'Utilisateur';
  const role = localStorage.getItem('role') || 'medecin';
  // Avatar dynamique selon le rôle
  const avatar = role === 'medecin' ? '👨‍⚕️' : role === 'infirmier' ? '🧑‍⚕️' : '👤';

  const filteredPatients = search.length > 0
    ? patients.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.id.toLowerCase().includes(search.toLowerCase()))
    : [];

  return (
    <div className="dashboard-medecin">
      <aside className="med-sidebar">
        <div className="sidebar-profile-top">
          <div className="sidebar-avatar">{avatar}</div>
          <div className="sidebar-username">{username}</div>
        </div>
        <ul>
          <li className={activeMenu === 'dashboard' ? 'active' : ''} onClick={() => setActiveMenu('dashboard')}>
            <span className="sidebar-icon">📊</span> Tableau de bord
          </li>
          <li className={activeMenu === 'nouvel' ? 'active' : ''} onClick={() => setActiveMenu('nouvel')}>
            <span className="sidebar-icon">➕</span> Nouvel examen
          </li>
          <li className={activeMenu === 'biblio' ? 'active' : ''}>
            <div className="sidebar-biblio-toggle" onClick={() => setShowBiblio(!showBiblio)}>
              <span className="sidebar-icon">📁</span> Bibliothèque
              <span className="sidebar-arrow">{showBiblio ? '▲' : '▼'}</span>
            </div>
            {showBiblio && (
              <ul className="sidebar-submenu">
                {['Tous', 'En attente', 'Urgents'].map(f => (
                  <li
                    key={f}
                    className={biblioFilter === f ? 'active' : ''}
                    onClick={() => setBiblioFilter(f)}
                  >
                    {f}
                  </li>
                ))}
              </ul>
            )}
          </li>
          <li className={activeMenu === 'dossiers' ? 'active' : ''} onClick={() => setActiveMenu('dossiers')}>
            <span className="sidebar-icon">📋</span> Dossiers patients
          </li>
          <li className={activeMenu === 'param' ? 'active' : ''} onClick={() => setActiveMenu('param')}>
            <span className="sidebar-icon">⚙️</span> Paramètres
          </li>
        </ul>
        <div className="sidebar-bottom">
          <button className="custom-btn" onClick={() => {
            localStorage.clear();
            window.location.href = '/';
          }}>
            Se déconnecter
          </button>
        </div>
      </aside>
      <div className="med-main-wrapper">
        <header className="med-header">
          <div className="med-logo">
            <img src={logo} alt="Ifar Logo" style={{height: 40}} />
          </div>
          <div className="med-search">
            <input
              type="text"
              placeholder="Recherche patient (nom ou ID)"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setShowDropdown(true)}
              onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
            />
            {showDropdown && filteredPatients.length > 0 && (
              <ul className="typeahead-list">
                {filteredPatients.map(p => (
                  <li key={p.id} onClick={() => { setSelectedPatient(p); setSearch(''); }}>
                    {p.name} <span className="typeahead-id">({p.id})</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="med-actions">
            <div className="notif-icon" onClick={() => setShowNotif(!showNotif)}>
              🔔
              {notifications.length > 0 && <span className="notif-badge">{notifications.length}</span>}
              {showNotif && (
                <div className="notif-dropdown">
                  {notifications.map(n => (
                    <div key={n.id} className="notif-item">{n.message}</div>
                  ))}
                  {notifications.length === 0 && <div className="notif-item">Aucune notification</div>}
                </div>
              )}
            </div>
            
          </div>
        </header>
        <main className="med-main">
          {activeMenu === 'nouvel' ? <NouvelExamen /> : null}
          {activeMenu === 'dashboard' ? <DashboardMedecinBoard /> : null}
          {activeMenu === 'biblio' ? <BibliothequeMedecin filter={biblioFilter} /> : null}
          {activeMenu === 'dossiers' ? <DossiersPatients /> : null}
          {selectedPatient ? (
            <div className="patient-info">
              <h2>Fiche patient : {selectedPatient.name} ({selectedPatient.id})</h2>
              <p>Accès rapide à la fiche et à l’historique médical du patient.</p>
            </div>
          ) : (
            <div className="welcome-block">
              <h2>Bienvenue Dr. Ndiaye</h2>
              <p>Sélectionnez un patient ou consultez vos notifications.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default DashboardMedecin;
