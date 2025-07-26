export interface ExamenMedical {
  id: number;
  patient: string;
  type: string;
  date: string;
  score_ia?: number;
  findings?: string;
  advice?: string;
  interpretation?: string;
  rapport_url?: string;
}
