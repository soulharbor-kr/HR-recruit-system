import { createClient } from '@supabase/supabase-js';

// ==============================================================================
// [환경변수 설정 안내]
// Railway(또는 로컬) 환경변수에 아래 두 값을 설정하세요.
//   VITE_SUPABASE_URL      : Supabase 프로젝트 URL
//   VITE_SUPABASE_ANON_KEY : Supabase Anon (public) Key
//
// 값이 없으면 자동으로 '테스트 모드(Mock Data / localStorage)'로 동작합니다.
// ==============================================================================

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

const getClient = () => {
    try {
        const url = SUPABASE_URL ? SUPABASE_URL.trim() : '';
        const key = SUPABASE_ANON_KEY ? SUPABASE_ANON_KEY.trim() : '';

        // URL 유효성 검사: 비어있거나 기본값(Placeholder)인 경우 에러 발생 -> Mock 모드 전환
        if (!url || !url.startsWith('http')) {
            console.log('Supabase 설정이 감지되지 않았습니다. (테스트 모드 실행)');
            throw new Error('Supabase URL not configured');
        }

        return createClient(url, key);
    } catch (e) {
        // 설정이 없거나 오류 발생 시 가짜(Mock) 클라이언트 반환하여 앱 충돌 방지
        return createClient('https://fallback-mock.supabase.co', 'mock-key');
    }
}

export const supabase = getClient();