import React from 'react';
import { ExamenMedical } from './types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface ExamChartProps {
  examens: ExamenMedical[];
  onSelectExam: (exam: ExamenMedical) => void;
}

const ExamChart: React.FC<ExamChartProps> = ({ examens, onSelectExam }) => {
  const data = examens.map(e => ({
    id: e.id,
    date: e.date,
    score_ia: e.score_ia,
    type: e.type,
    findings: e.findings,
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data} margin={{ top: 24, right: 24, left: 0, bottom: 24 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis domain={[0, 1]} tickFormatter={v => v.toFixed(2)} />
        <Tooltip formatter={(value, name, props) => [`Score IA: ${value}`, `Date: ${props.payload.date}`]} />
        <Line
          type="monotone"
          dataKey="score_ia"
          stroke="#1976d2"
          activeDot={{ r: 8 }}
          dot={(props: any) => (
            <circle
              {...props}
              r={props.active ? 8 : 4}
              className="exam-chart-dot"
              onClick={() => {
                const exam = examens.find(e => e.id === props.payload?.id);
                if (exam) onSelectExam(exam);
              }}
            />
          )}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default ExamChart;
