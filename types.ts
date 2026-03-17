export interface Evaluator {
  id: string;
  name: string;
  password?: string; // In a real app, never store plain text
  role: 'evaluator' | 'admin';
}

export interface Applicant {
  id: string;
  name: string;
  position: string;
  applicationDate: string;
  pdfUrl: string; // URL to the Google Drive PDF or public PDF
  originalFilename?: string; // The parsed filename from Drive
}

export interface ScoreCategory {
  id: keyof Scores;
  label: string;
  maxScore: number;
  description: string;
}

export interface Scores {
  jobCompetency: number; // 직무능력 (20)
  motivation: number;    // 지원동기 (20)
  personality: number;   // 인성 및 품성 (20)
  socialSkills: number;  // 적극성 및 사회성 (20)
  impression: number;    // 인상 및 표현력 (20)
}

export interface EvaluationData {
  applicantId: string;
  evaluatorId: string;
  scores: Scores;
  total: number;
  comment?: string;
  submittedAt: string;
}

export const CATEGORIES: ScoreCategory[] = [
  { id: 'jobCompetency', label: '직무능력', maxScore: 20, description: '직무 수행에 필요한 지식과 기술' },
  { id: 'motivation', label: '지원동기', maxScore: 20, description: '지원 동기의 진정성과 명확성' },
  { id: 'personality', label: '인성/품성', maxScore: 20, description: '기본적인 인성과 태도' },
  { id: 'socialSkills', label: '적극성/사회성', maxScore: 20, description: '조직 융화력 및 대인관계' },
  { id: 'impression', label: '인상/표현력', maxScore: 20, description: '의사소통 능력 및 태도' },
];