import { supabase, SUPABASE_URL } from '../lib/supabase';
import { Applicant, EvaluationData, Evaluator } from '../types';

// --- MOCK DATA FOR FALLBACK ---
const MOCK_EVALUATORS: Evaluator[] = [
  { id: 'eval1', name: '송선영', password: '123', role: 'evaluator' },
  { id: 'eval2', name: '이심사', password: '123', role: 'evaluator' },
  { id: 'eval3', name: '박채용', password: '123', role: 'evaluator' },
  { id: 'admin', name: '관리자', password: 'admin', role: 'admin' },
];

const DRIVE_FILES = [
  { filename: "01. 김수진.pdf", id: "1l-bgGdBaUFq-a317XONdk0Ss_4tSFte0" },
  { filename: "02. 방민정.pdf", id: "1cwIBFAWriGHD7wC9F4_DsGkDGMC4lD9g" },
  { filename: "03. 김나경.pdf", id: "1mwb_Sm4wbK8uiq-q0vfks80tVpbH4t8M" },
  { filename: "04. 조영윤.pdf", id: "1Y93d6vA3KsRtBu3O7RmCLQYqnaXt8cR9" },
  { filename: "05. 천민정.pdf", id: "1RZymeeZoNrGXUihPXV_Cy5g_lnZqrsli" },
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
    return !!(SUPABASE_URL && SUPABASE_URL.startsWith('http') && !SUPABASE_URL.includes('fallback-mock'));
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
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.storage
          .from('applicants')
          .list('', { sortBy: { column: 'name', order: 'asc' } });

        if (error) throw error;

        if (data && data.length > 0) {
          return data
            .filter(file => file.name.toLowerCase().endsWith('.pdf'))
            .map(file => {
              const { data: urlData } = supabase.storage
                .from('applicants')
                .getPublicUrl(file.name);
              return {
                id: file.name.replace('.pdf', ''),
                name: parseNameFromFilename(file.name),
                position: '신입 공채',
                applicationDate: new Date().toISOString().split('T')[0],
                pdfUrl: urlData.publicUrl,
                originalFilename: file.name,
              };
            });
        }
      } catch (e) {
        console.warn('Supabase Storage fetch failed. Falling back to hardcoded list.', e);
      }
    }

    // Fallback: hardcoded Google Drive files
    await new Promise(resolve => setTimeout(resolve, 300));
    return DRIVE_FILES.map((file, index) => {
      const name = parseNameFromFilename(file.filename);
      return {
        id: `drive_file_${index + 1}`,
        name,
        position: '신입 공채',
        applicationDate: new Date().toISOString().split('T')[0],
        pdfUrl: `https://drive.google.com/file/d/${file.id}/preview`,
        originalFilename: file.filename,
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