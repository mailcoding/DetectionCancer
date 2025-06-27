import React, { useEffect, useState } from 'react';
import { apiFetch } from '../api';
import './DashboardMedecinBoard.css';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface MedicalImage {
  id: number;
  analysis_result: {
    malignancy_score: number;
    findings: string[];
    birads?: string;
  };
  created_at: string;
  image: string;
}

const DashboardMedecinBoard: React.FC = () => {
  const [images, setImages] = useState<MedicalImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<MedicalImage[]>('/detection/images/')
      .then(setImages)
      .catch(() => setImages([]))
      .finally(() => setLoading(false));
  }, []);

  // Cas urgents = BI-RADS 4 ou 5 dans findings ou score élevé
  const urgentCases = images.filter(img => {
    const findings = img.analysis_result.findings.join(' ').toLowerCase();
    return findings.includes('bi-rads 4') || findings.includes('bi-rads 5') || (img.analysis_result.malignancy_score >= 0.8);
  }).slice(0, 3);

  // Statistiques
  const nbExamens = images.length;
  const nbUrgents = urgentCases.length;
  const precisionIA = images.length ? (images.map(i => i.analysis_result.malignancy_score).reduce((a, b) => a + b, 0) / images.length * 100).toFixed(1) : '0';

  // Préparation des données pour le graphique de charge (examens/jour)
  const examsByDay = images.reduce((acc, img) => {
    const date = new Date(img.created_at).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  const lineData = Object.entries(examsByDay).map(([date, count]) => ({ date, count }));

  // Préparation des données pour le pie chart BI-RADS
  const biradsCount: Record<string, number> = {};
  images.forEach(img => {
    const birads = (img.analysis_result.findings.find(f => f.toLowerCase().includes('bi-rads')) || 'Inconnu').toUpperCase();
    biradsCount[birads] = (biradsCount[birads] || 0) + 1;
  });
  const pieData = Object.entries(biradsCount).map(([name, value]) => ({ name, value }));
  const COLORS = ['#e91e63', '#f06292', '#ba68c8', '#64b5f6', '#ffd54f', '#81c784', '#ff8a65'];

  return (
    <div className="medecin-board-container">
      <div className="stats-bar">
        <div className="stat-box">{nbExamens} examens ce mois</div>
        <div className="stat-box urgent">{nbUrgents} urgents</div>
        <div className="stat-box">{precisionIA}% précision IA</div>
      </div>
      <div className="board-main-content">
        <div className="charts">
          <div className="chart-block">
            <h4>Courbe de charge (examens/jour)</h4>
            <ResponsiveContainer width="100%" height={180}>
              <LineChart data={lineData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#e91e63" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="chart-block">
            <h4>Répartition BI-RADS</h4>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="quick-lists">
          <div className="quick-list">
            <h4>Derniers cas urgents</h4>
            {loading ? <div>Chargement...</div> : (
            <ul>
              {urgentCases.length === 0 && <li>Aucun cas urgent</li>}
              {urgentCases.map((c, i) => (
                <li key={c.id} className="urgent-case">
                  <span className="case-name">Image {c.id}</span>
                  <span className="case-score">{c.analysis_result.findings.join(', ')}</span>
                  <span className="case-date">{new Date(c.created_at).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
            )}
          </div>
          <div className="quick-list">
            <h4>Rappels planifiés</h4>
            <ul>
              <li>À relier à un modèle de rappels</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardMedecinBoard;
