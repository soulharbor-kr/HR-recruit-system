import { supabase } from '../lib/supabase';
import { Applicant, EvaluationData, Evaluator } from '../types';

// --- MOCK DATA FOR FALLBACK ---
const MOCK_EVALUATORS: Evaluator[] = [
  { id: 'eval1', name: '송선영', password: '123', role: 'evaluator' },
  { id: 'eval2', name: '이심사', password: '123', role: 'evaluator' },
  { id: 'eval3', name: '박채용', password: '123', role: 'evaluator' },
  { id: 'admin', name: '관리자', password: 'admin', role: 'admin' },
];

const DRIVE_FILES = [
  { filename: "01. 김철수.pdf", id: "1A79zCGrFTC9Xt1niLVv8oYgSVfDNppvX" },
  { filename: "02. 이영희.pdf", id: "12mBcEtHf45HFCJsrNgeGtobOA25pM2Yi" },
  { filename: "03. 박민수.pdf", id: "1F5MZkGk7V5MyMRqArRAnGcpQ1PBM2Hd2" },
  { filename: "04. 정지원.pdf", id: "1vE5onh8X0bH1pULGXKBXkD8UUhloUbHD" },
  { filename: "05. 최성실.pdf", id: "1zky3v8uFgX9ucm3XZCDnenVRgqlRknSZ" }
];

const STORAGE_KEY = 'hr_eval_system_data_fallback';

const parseNameFromFilename = (filename: string): string => {
  try {
    const namePart = filename.replace('.pdf', '');
    const parts = namePart.split('.');
    if (parts.length >= 2) {
      return parts[1].trim();
    }
    return namePart;
  } catch (e) {
    return filename;
  }
};

const isSupabaseConfigured = () => {
    // Check if the URL is the placeholder from the template or our fallback
    // @ts-ignore
    const url = (supabase as any).supabaseUrl || '';
    if (!url || url.includes('YOUR_SUPABASE_URL') || url.includes('fallback-mock')) {
        return false;
    }
    return true;
};

export const apiService = {
  isServerConnected: (): boolean => {
    return isSupabaseConfigured();
  },

  login: async (id: string, pw: string): Promise<Evaluator | null> => {
    // 1. Try Supabase if configured
    if (isSupabaseConfigured()) {
        try {
          const { data, error } = await supabase
            .from('evaluators')
            .select('*')
            .eq('id', id)
            .eq('password', pw)
            .maybeSingle();
    
          if (error) {
            console.error('Supabase Login Error:', error);
            throw error;
          }
          if (data) return data as Evaluator;
        } catch (e) {
          console.warn('Supabase login failed. Falling back to mock data.', e);
        }
    } else {
        console.log('Supabase not configured. Using Mock Data.');
    }

    // 2. Fallback to Mock Data
    await new Promise(resolve => setTimeout(resolve, 500));
    const user = MOCK_EVALUATORS.find(u => u.id === id && u.password === pw);
    return user || null;
  },

  getEvaluators: async (): Promise<Evaluator[]> => {
    if (isSupabaseConfigured()) {
        try {
            const { data, error } = await supabase
                .from('evaluators')
                .select('*')
                .eq('role', 'evaluator');
            
            if (error) throw error;
            return data as Evaluator[];
        } catch (e) {
            console.warn('Supabase getEvaluators failed.', e);
        }
    }

    return MOCK_EVALUATORS.filter(u => u.role === 'evaluator');
  },

  getApplicants: async (): Promise<Applicant[]> => {
    // Drive Files are currently hardcoded. 
    // If you want to fetch from Supabase, you would need an 'applicants' table.
    // For now, we simulate API delay.
    await new Promise(resolve => setTimeout(resolve, 300));

    return DRIVE_FILES.map((file, index) => {
      const name = parseNameFromFilename(file.filename);
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
    if (isSupabaseConfigured()) {
        try {
            const { data, error } = await supabase
              .from('evaluations')
              .select('*');
        
            if (error) {
                console.error('Supabase getEvaluations Error:', error);
                throw error;
            }
        
            if (data) {
                return data.map((item: any) => ({
                    applicantId: item.applicant_id,
                    evaluatorId: item.evaluator_id,
                    scores: item.scores,
                    total: item.total,
                    submittedAt: item.submitted_at,
                    comment: item.comment
                }));
            }
        } catch (e) {
            console.warn('Using Local Storage for Evaluations due to error or config.', e);
        }
    }
    
    // Fallback: Local Storage
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  saveEvaluation: async (data: EvaluationData): Promise<{success: boolean, mode: 'server'|'local'}> => {
    let savedToSupabase = false;

    if (isSupabaseConfigured()) {
        try {
            const dbPayload = {
              applicant_id: data.applicantId,
              evaluator_id: data.evaluatorId,
              scores: data.scores,
              total: data.total,
              submitted_at: data.submittedAt,
              comment: data.comment
            };
        
            // Note: DB table must have Primary Key (applicant_id, evaluator_id) for upsert to work properly
            const { error } = await supabase
              .from('evaluations')
              .upsert(dbPayload, { onConflict: 'applicant_id, evaluator_id' });
        
            if (error) {
                console.error('Supabase Save Error:', error);
                throw error;
            }
            savedToSupabase = true;
        } catch (e) {
            console.warn('Failed to save to Supabase. Falling back to local.', e);
        }
    }

    if (!savedToSupabase) {
        // Fallback: Local Storage
        await new Promise(resolve => setTimeout(resolve, 300));
        const stored = localStorage.getItem(STORAGE_KEY);
        let evaluations: EvaluationData[] = stored ? JSON.parse(stored) : [];
        
        evaluations = evaluations.filter(
          e => !(e.applicantId === data.applicantId && e.evaluatorId === data.evaluatorId)
        );
        
        evaluations.push(data);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(evaluations));
        return { success: true, mode: 'local' };
    }

    return { success: true, mode: 'server' };
  },
  
  calculateTotal: (scores: any): number => {
    return Object.values(scores).reduce((a: any, b: any) => a + b, 0) as number;
  }
};