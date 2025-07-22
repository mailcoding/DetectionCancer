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
          <div className="dicom-tools historique-tools">
            <div className="hist-filtres-label">Filtres</div>
            <div className="hist-filtres-btns">
              <button className={`custom-btn${filtre==='Examens'?' active':''}`} onClick={() => setFiltre('Examens')} aria-pressed={filtre === 'Examens'}>Examens</button>
              <button className={`custom-btn${filtre==='Biopsies'?' active':''}`} onClick={() => setFiltre('Biopsies')} aria-pressed={filtre==='Biopsies'}>Biopsies</button>
              <button className={`custom-btn${filtre==='Tous'?' active':''}`} onClick={() => setFiltre('Tous')} aria-pressed={filtre==='Tous'}>Tous</button>
            </div>
            <div className="search-block hist-search-block">
              <input
                type="text"
                placeholder="Recherche (type, résultat, date)"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="search-input hist-search-input"
                aria-label="Recherche dans les examens"
              />
            </div>
            <div className="sort-block hist-sort-block">
              <label htmlFor="sortBy-select" className="hist-sort-label">Trier par</label>
              <select
                id="sortBy-select"
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="hist-sort-select"
                aria-label="Trier les examens"
              >
                <option value="date">Date</option>
                <option value="type">Type</option>
                <option value="resultat">Résultat</option>
              </select>
              <button
                className="custom-btn hist-sort-btn"
                onClick={() => setSortDir(d => d==='asc'?'desc':'asc')}
                aria-label={sortDir === 'asc' ? 'Tri croissant' : 'Tri décroissant'}
                title={sortDir === 'asc' ? 'Tri croissant' : 'Tri décroissant'}
              >
                {sortDir === 'asc' ? '⬆️' : '⬇️'}
              </button>
            </div>
          </div>
        </div>
        <div className="right-col">
          <div className="patient-meta hist-patient-meta">
            <h4 className="hist-patient-title">Résumé patient</h4>
            {/* À remplacer par des données dynamiques si besoin */}
            <ul className="hist-patient-list">
              <li>Âge : 52 ans</li>
              <li>Sexe : Féminin</li>
              <li>Antécédents familiaux : Oui</li>
            </ul>
          </div>
          <div className="historique-list">
            <h4 className="hist-list-title">Liste des examens précédents</h4>
            {loading ? <div>Chargement...</div> : (
              <ul className="hist-exam-list">
                {filtered.length === 0 && <li className="hist-exam-empty">Aucun examen trouvé.</li>}
                {filtered.map(ex => (
                  <li key={ex.id} className="hist-exam-item">
                    <span className="hist-exam-type">{ex.type}</span>
                    <span className="hist-exam-date">Date : {ex.date}</span>
                    <span className={`hist-exam-resultat${ex.resultat.toLowerCase().includes('positif') ? ' positif' : ' negatif'}`}>
                      Résultat : {ex.resultat}
                    </span>
                  </li>
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
