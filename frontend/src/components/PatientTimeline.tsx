import React, { useEffect, useState } from 'react';
import './PatientTimeline.css';
import ExamChart from './ExamChart';
import ExamDetails from './ExamDetails';
import { apiFetch } from '../api';
import { ExamenMedical } from './types';

// ...interface déplacée dans types.ts

const PatientTimeline: React.FC = () => {
  const [patients, setPatients] = useState<string[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<string>('');
  const [examens, setExamens] = useState<ExamenMedical[]>([]);
  const [selectedType, setSelectedType] = useState<string>('');
  const [selectedExam, setSelectedExam] = useState<ExamenMedical | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    apiFetch<string[]>('/detection/biopsie/patients/').then(setPatients);
  }, []);

  useEffect(() => {
    if (selectedPatient) {
      setLoading(true);
      apiFetch<ExamenMedical[]>(`/detection/examens/patient/${selectedPatient}/?type=${selectedType}`)
        .then(setExamens)
        .finally(() => setLoading(false));
    } else {
      setExamens([]);
    }
  }, [selectedPatient, selectedType]);

  return (
    <div className="timeline-container">
      <div className="timeline-controls">
        <label htmlFor="patient-select">Patient : </label>
        <select id="patient-select" title="Sélectionner un patient" value={selectedPatient} onChange={e => setSelectedPatient(e.target.value)}>
          <option value="">-- Choisir --</option>
          {patients.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
        <label htmlFor="type-select" className="timeline-type-label">Type : </label>
        <select id="type-select" title="Sélectionner le type d'examen" value={selectedType} onChange={e => setSelectedType(e.target.value)}>
          <option value="">Tous</option>
          <option value="mammographie">Mammographie</option>
          <option value="biopsie">Biopsie</option>
        </select>
      </div>
      <div className="timeline-chart-block">
        {loading ? <div>Chargement...</div> : (
          <ExamChart examens={examens} onSelectExam={setSelectedExam} />
        )}
      </div>
      <div className="timeline-details-block">
        {selectedExam && <ExamDetails exam={selectedExam} />}
      </div>
    </div>
  );
};

export default PatientTimeline;
