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

  // Pop-up patient
  const [showPopup, setShowPopup] = useState(false);
  const [popupPos, setPopupPos] = useState<{x: number, y: number}>({x: 0, y: 0});

  // Données fictives pour le résumé et prochain RDV
  const patientResume = {
    nom: 'Mme Dupont',
    age: 52,
    sexe: 'Féminin',
    antecedents: 'Oui',
    prochainRDV: '2025-08-10',
  };

  // Affichage du pop-up au survol du nom
  const handleMouseOver = (e: React.MouseEvent) => {
    setShowPopup(true);
    setPopupPos({ x: e.clientX + 10, y: e.clientY + 10 });
  };
  const handleMouseOut = () => setShowPopup(false);

  return (
    <div className="nouvel-examen-container">
      <div className="main-content hist-flex-col">
        {/* Barre de recherche */}
        <div className="search-block hist-search-block hist-search-top">
          <input
            type="text"
            placeholder="Recherche (type, résultat, date)"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-input hist-search-input"
            aria-label="Recherche dans les examens"
          />
        </div>
        {/* Filtres et tri */}
        <div className="hist-filtres-tri-row">
          <div className="hist-filtres-label">Filtres</div>
          <div className="hist-filtres-btns">
            <button className={`custom-btn${filtre==='Examens'?' active':''}`} onClick={() => setFiltre('Examens')} aria-pressed={filtre === 'Examens' ? 'true' : 'false'}>Examens</button>
            <button className={`custom-btn${filtre==='Biopsies'?' active':''}`} onClick={() => setFiltre('Biopsies')} aria-pressed={filtre === 'Biopsies' ? 'true' : 'false'}>Biopsies</button>
            <button className={`custom-btn${filtre==='Tous'?' active':''}`} onClick={() => setFiltre('Tous')} aria-pressed={filtre === 'Tous' ? 'true' : 'false'}>Tous</button>
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
        {/* Affichage historique */}
        <div className="historique-list hist-list-top">
          <h4 className="hist-list-title">Liste des examens précédents</h4>
          {loading ? <div>Chargement...</div> : (
            <ul className="hist-exam-list">
              {filtered.length === 0 && <li className="hist-exam-empty">Aucun examen trouvé.</li>}
              {filtered.map(ex => (
                <li key={ex.id} className="hist-exam-item">
                  <span
                    className="hist-exam-type hist-patient-hover"
                    onMouseOver={handleMouseOver}
                    onMouseOut={handleMouseOut}
                  >{patientResume.nom}</span>
                  <span className="hist-exam-date">Date : {ex.date}</span>
                  <span className={`hist-exam-resultat${ex.resultat.toLowerCase().includes('positif') ? ' positif' : ' negatif'}`}>
                    Résultat : {ex.resultat}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {/* Pop-up patient */}
        {showPopup && (
          <div
            className="hist-patient-popup"
            style={{position: 'fixed', left: popupPos.x, top: popupPos.y, zIndex: 1000}}
          >
            <div style={{fontWeight: 600, marginBottom: 6}}>{patientResume.nom}</div>
            <div>Âge : {patientResume.age}</div>
            <div>Sexe : {patientResume.sexe}</div>
            <div>Antécédents familiaux : {patientResume.antecedents}</div>
            <div style={{marginTop: 8, fontWeight: 500}}>Examens précédents :</div>
            <ul style={{margin: 0, paddingLeft: 16}}>
              {examens.slice(0,3).map(ex => (
                <li key={ex.id}>{ex.date} - {ex.type} - {ex.resultat}</li>
              ))}
            </ul>
            <div style={{marginTop: 8, color: '#228b22'}}>Prochain RDV : {patientResume.prochainRDV}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoriquePatient;
