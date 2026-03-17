import { createClient } from '@supabase/supabase-js';

export const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string || '').trim();
export const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string || '').trim();

const getClient = () => {
    if (!SUPABASE_URL || !SUPABASE_URL.startsWith('http')) {
        console.log('Supabase 설정이 감지되지 않았습니다. (테스트 모드 실행)');
        return createClient('https://fallback-mock.supabase.co', 'mock-key');
    }
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

export const supabase = getClient();
