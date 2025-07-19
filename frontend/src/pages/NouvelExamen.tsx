import React, { useState } from 'react';
import './NouvelExamen.css';
import axios from 'axios';
import ExamenBiopsie from './ExamenBiopsie';
import HistoriquePatient from './HistoriquePatient';
import DicomViewer from '../components/DicomViewer';

const NouvelExamen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'mammographie' | 'biopsie' | 'historique'>('mammographie');
  const [heatmapOn, setHeatmapOn] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [sliderValue, setSliderValue] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [iaResult, setIaResult] = useState<any>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    setIaResult(null);
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => setPreviewUrl(reader.result as string);
      reader.readAsDataURL(selectedFile);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsLoading(true);
    const formData = new FormData();
    formData.append('image', file);
    try {
      const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
      const response = await axios.post(`${apiUrl}/detection/analyze/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setIaResult((response.data as { result: any }).result);
      setFile(null);
      setPreviewUrl(null);
    } catch (err) {
      setIaResult({ error: "Erreur lors de l'analyse IA." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="nouvel-examen-container">
      <div className="tabs">
        <div className={`tab ${activeTab === 'mammographie' ? 'active' : ''}`} onClick={() => setActiveTab('mammographie')}>📷 Mammographie</div>
        <div className={`tab ${activeTab === 'biopsie' ? 'active' : ''}`} onClick={() => setActiveTab('biopsie')}>🔬 Biopsie</div>
        <div className={`tab ${activeTab === 'historique' ? 'active' : ''}`} onClick={() => setActiveTab('historique')}>📊 Historique patient</div>
      </div>
      {activeTab === 'biopsie' && <ExamenBiopsie />}
      {activeTab === 'historique' && <HistoriquePatient />}
      {activeTab === 'mammographie' && (
        <>
          <div className="upload-zone">
            <div className="drag-drop">
              <span>Glissez-déposez un fichier DICOM, JPEG ou PDF ici</span>
              <label htmlFor="file-upload" className="visually-hidden">Choisir un fichier à télécharger</label>
              <input
                id="file-upload"
                type="file"
                accept=".dcm,image/jpeg,application/pdf"
                title="Choisir un fichier à télécharger"
                onChange={handleFileChange}
                disabled={isLoading}
              />
              {previewUrl && (
                <div className="file-preview">
                  <img src={previewUrl} alt="Aperçu" />
                </div>
              )}
              <button className="custom-btn" onClick={handleUpload} disabled={isLoading || !file}>
                {isLoading ? <span className="loader"></span> : 'Analyser'}
              </button>
            </div>
          </div>
          <DicomViewer imageUrl={previewUrl || ''} />
          <div className="main-content">
            <div className="left-col">
              <div className="dicom-tools">
                <div>Outils DICOM :</div>
                <button className="custom-btn">Zoom 🖱️</button>
                <button className="custom-btn">Contraste ☀️</button>
                <button className="custom-btn">Mesures 📏</button>
              </div>
              <div className="heatmap-toggle">
                <label>
                  <input type="checkbox" checked={heatmapOn} onChange={() => setHeatmapOn(!heatmapOn)} />
                  Heatmap IA superposée
                </label>
              </div>
              <div className="legend">
                <span>Score de malignité :</span>
                <b>BI-RADS 3 - 67% confiance</b>
              </div>
            </div>
            <div className="right-col">
              <div className="patient-meta">
                <h4>Résumé patient</h4>
                <ul>
                  <li>Âge : 52 ans</li>
                  <li>Sexe : Féminin</li>
                  <li>Antécédents familiaux : Oui</li>
                </ul>
              </div>
              <div className="ia-prediction">
                <h4>Prédiction IA</h4>
                {iaResult ? (
                  iaResult.error ? (
                    <p style={{color:'#e91e63'}}>{iaResult.error}</p>
                  ) : (
                    <div className="ia-result-block">
                      <p>
                        <b>{iaResult.malignancy_score >= 0.5 ? '⚠️ Présence de cancer du sein détectée' : '✅ Aucun signe de cancer détecté'}</b>
                      </p>
                      <p>
                        Type : <b>{iaResult.findings?.some((f:string) => f.toLowerCase().includes('malin')) ? 'Maligne' : iaResult.findings?.some((f:string) => f.toLowerCase().includes('benin')) ? 'Bénigne' : 'Indéterminé'}</b>
                      </p>
                      <div className="malignancy-bar">
                        <span>Score de malignité :</span>
                        <div className="bar-bg">
                          <div className="bar-fill" style={{width: `${(iaResult.malignancy_score*100).toFixed(1)}%`, background: iaResult.malignancy_score >= 0.5 ? '#e91e63' : '#4caf50'}}></div>
                        </div>
                        <span className="bar-value">{(iaResult.malignancy_score * 100).toFixed(1)}%</span>
                      </div>
                      <ul className="ia-findings">
                        {iaResult.findings?.map((f:string, i:number) => <li key={i}>{f}</li>)}
                      </ul>
                    </div>
                  )
                ) : (
                  <p className="ia-placeholder">Aucun résultat IA pour l’instant.</p>
                )}
                <button className="custom-btn" onClick={() => setShowModal(true)} disabled={!iaResult}>
                  🔍 Voir explications IA
                </button>
              </div>
              <div className="actions">
                <button className="custom-btn">🖊️ Annoter</button>
                <button className="custom-btn">📤 Exporter PDF</button>
                <button className="custom-btn">🗣️ Demander un avis</button>
              </div>
            </div>
          </div>
        </>
      )}
      {showModal && (
        <div className="modal-bg" onClick={() => setShowModal(false)}>
          <div className="modal ia-modal" onClick={e => e.stopPropagation()}>
            <h3>Analyse du modèle - Cas #4567</h3>
            <div className="ia-section">
              <h4>Features clés</h4>
              <ul className="ia-features">
                <li>Microcalcifications groupées</li>
                <li>Contour spiculé</li>
              </ul>
              <div className="similarity-matrix">
                <span>Matrice de similarité avec cas connus :</span>
                <div className="matrix-placeholder">[Matrice visuelle]</div>
              </div>
            </div>
            <div className="ia-section">
              <h4>Comparaison</h4>
              <div className="slider-block">
                <label htmlFor="case-compare-slider">Comparer avec un cas archivé :</label>
                <input
                  id="case-compare-slider"
                  type="range"
                  min={0}
                  max={100}
                  value={sliderValue}
                  onChange={e => setSliderValue(Number(e.target.value))}
                  title="Comparer avec un cas archivé"
                />
                <div className="slider-value">Cas #{4567 + sliderValue}</div>
              </div>
              <button className="custom-btn add-ref-btn">Ajouter à ma bibliothèque de référence</button>
            </div>
            <button className="custom-btn close-modal" onClick={() => setShowModal(false)}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NouvelExamen;
