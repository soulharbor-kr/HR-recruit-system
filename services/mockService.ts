import { Applicant, EvaluationData, Evaluator } from '../types';

// Mock Data for Demo Purposes
const MOCK_EVALUATORS: Evaluator[] = [
  { id: 'eval1', name: '송선영', password: '123', role: 'evaluator' },
  { id: 'eval2', name: '이심사', password: '123', role: 'evaluator' },
  { id: 'eval3', name: '박채용', password: '123', role: 'evaluator' },
  { id: 'admin', name: '관리자', password: 'admin', role: 'admin' },
];

// Map of filenames to the specific Google Drive IDs provided
// These IDs were extracted from the user's links
const DRIVE_FILES = [
  { filename: "01. 김철수.pdf", id: "1A79zCGrFTC9Xt1niLVv8oYgSVfDNppvX" },
  { filename: "02. 이영희.pdf", id: "12mBcEtHf45HFCJsrNgeGtobOA25pM2Yi" },
  { filename: "03. 박민수.pdf", id: "1F5MZkGk7V5MyMRqArRAnGcpQ1PBM2Hd2" },
  { filename: "04. 정지원.pdf", id: "1vE5onh8X0bH1pULGXKBXkD8UUhloUbHD" },
  { filename: "05. 최성실.pdf", id: "1zky3v8uFgX9ucm3XZCDnenVRgqlRknSZ" }
];

// Google Drive Folder ID (Reference only, individual files are linked directly below)
const TARGET_FOLDER_ID = "1oA_Re2WeJ-HXt-MVLoTP2QRwoiGn75nH";

const STORAGE_KEY = 'hr_eval_system_data';

// Helper to parse "01. Name.pdf" -> "Name"
const parseNameFromFilename = (filename: string): string => {
  try {
    // Remove extension
    const namePart = filename.replace('.pdf', '');
    // Split by dot or space to get the name after number
    // "01. Name" -> ["01", " Name"]
    const parts = namePart.split('.');
    if (parts.length >= 2) {
      return parts[1].trim();
    }
    return namePart;
  } catch (e) {
    return filename;
  }
};

export const mockService = {
  login: async (id: string, pw: string): Promise<Evaluator | null> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = MOCK_EVALUATORS.find(u => u.id === id && u.password === pw);
    return user || null;
  },

  getEvaluators: async (): Promise<Evaluator[]> => {
    return MOCK_EVALUATORS.filter(u => u.role === 'evaluator');
  },

  getApplicants: async (): Promise<Applicant[]> => {
    // Simulate fetching from Google Drive API
    await new Promise(resolve => setTimeout(resolve, 800));

    return DRIVE_FILES.map((file, index) => {
      const name = parseNameFromFilename(file.filename);
      // Construct the Google Drive Preview URL
      const previewUrl = `https://drive.google.com/file/d/${file.id}/preview`;

      return {
        id: `drive_file_${index + 1}`,
        name: name,
        position: '신입 공채', 
        applicationDate: new Date().toISOString().split('T')[0],
        pdfUrl: previewUrl,
        originalFilename: file.filename
      };
    });
  },

  getEvaluations: async (): Promise<EvaluationData[]> => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  saveEvaluation: async (data: EvaluationData): Promise<void> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const stored = localStorage.getItem(STORAGE_KEY);
    let evaluations: EvaluationData[] = stored ? JSON.parse(stored) : [];
    
    evaluations = evaluations.filter(
      e => !(e.applicantId === data.applicantId && e.evaluatorId === data.evaluatorId)
    );
    
    evaluations.push(data);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(evaluations));
  },
  
  calculateTotal: (scores: any): number => {
    return Object.values(scores).reduce((a: any, b: any) => a + b, 0) as number;
  }
};