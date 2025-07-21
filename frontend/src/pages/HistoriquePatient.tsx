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
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'type' | 'resultat'>('date');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    apiFetch<Examen[]>('/detection/historique/')
      .then(setExamens)
      .catch(() => setExamens([]))
      .finally(() => setLoading(false));
  }, []);

  // Filtrage par type
  let filtered = examens.filter(ex => {
    if (filtre === 'Tous') return true;
    if (filtre === 'Examens') return ex.type.toLowerCase().includes('mammo') || ex.type.toLowerCase().includes('examen');
    if (filtre === 'Biopsies') return ex.type.toLowerCase().includes('biopsie');
    return true;
  });
  // Recherche texte
  if (search.trim()) {
    filtered = filtered.filter(ex =>
      ex.type.toLowerCase().includes(search.toLowerCase()) ||
      ex.resultat.toLowerCase().includes(search.toLowerCase()) ||
      ex.date.includes(search)
    );
  }
  // Tri
  filtered = filtered.sort((a, b) => {
    let vA = a[sortBy];
    let vB = b[sortBy];
    if (sortBy === 'date') {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      if (dateA < dateB) return sortDir === 'asc' ? -1 : 1;
      if (dateA > dateB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    }
    if (vA < vB) return sortDir === 'asc' ? -1 : 1;
    if (vA > vB) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div className="nouvel-examen-container">
      <div className="main-content">
        <div className="left-col">
          <div className="dicom-tools">
            <div>Filtres :</div>
            <button className={`custom-btn${filtre==='Examens'?' active':''}`} onClick={() => setFiltre('Examens')}>Examens</button>
            <button className={`custom-btn${filtre==='Biopsies'?' active':''}`} onClick={() => setFiltre('Biopsies')}>Biopsies</button>
            <button className={`custom-btn${filtre==='Tous'?' active':''}`} onClick={() => setFiltre('Tous')}>Tous</button>
            <div className="search-block">
              <input
                type="text"
                placeholder="Recherche (type, résultat, date)"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="search-input"
              />
            </div>
            <div className="sort-block">
              <label htmlFor="sortBy-select">Trier par :</label>
              <select
                id="sortBy-select"
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
              >
                <option value="date">Date</option>
                <option value="type">Type</option>
                <option value="resultat">Résultat</option>
              </select>
              <button className="custom-btn" onClick={() => setSortDir(d => d==='asc'?'desc':'asc')}>
                {sortDir === 'asc' ? '⬆️' : '⬇️'}
              </button>
            </div>
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
                {filtered.length === 0 && <li>Aucun examen trouvé.</li>}
                {filtered.map(ex => (
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
