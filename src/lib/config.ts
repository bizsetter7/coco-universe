// src/lib/config.ts
export const isPreRelease = process.env.NEXT_PUBLIC_SERVICE_PHASE === 'PRE_RELEASE' || !process.env.NEXT_PUBLIC_SERVICE_PHASE;

export const SERVICE_INFO = {
  TITLE: isPreRelease ? '코코알바 B2B | 맞춤형 인재 매칭 솔루션' : '코코알바 | 여성전문 고소득 알바 No.1',
  DESCRIPTION: isPreRelease 
    ? '기업 성공을 위한 최적의 인재 매칭 B2B 솔루션입니다. 검증된 파트너 네트워크를 제공합니다.' 
    : '지역 기반 100% 실명 인증, 가장 확실하고 안전한 고소득 알바 매칭 플랫폼.',
};
