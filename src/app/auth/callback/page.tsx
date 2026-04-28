'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

/**
 * OAuth 콜백 핸들러 (Google 등)
 * Supabase가 code → session 교환을 자동 처리하는 페이지
 * /auth/* 경로는 성인게이트 면제 (LayoutWrapper 규칙)
 */
export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const url = new URL(window.location.href);
      const code = url.searchParams.get('code');

      if (code) {
        try {
          await supabase.auth.exchangeCodeForSession(code);
        } catch {
          // 교환 실패해도 세션이 이미 있을 수 있음 — 계속 진행
        }
      }

      // 세션 확인 후 리다이렉트
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        window.location.href = '/';
      } else {
        router.replace('/');
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-white">
      <div className="w-10 h-10 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-gray-500 text-sm font-medium">구글 로그인 처리 중...</p>
    </div>
  );
}
