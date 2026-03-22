// [Engine Stop] Layout Constants - Injected from Universal Soul Backup
export const LAYOUT = {
    MAX_WIDTH: '1400px',
    HEADER_HEIGHT: '56px',
    SIDEBAR_WIDTH: '160px',
    GRID_GAP: 'xl:gap-10',
    PADDING_TOP_MAIN: '56px',
    PADDING_TOP_ASIDE: '0px'
} as const;

// v2.0 — AD_TIER_STANDARDS 색상과 완전 동기화 (2026-03-22)
export const GRADIENTS = {
    grand:       'bg-gradient-to-br from-amber-500 to-amber-600',       // 🟡 황금
    premium:     'bg-gradient-to-br from-red-600 to-red-700',           // 🔴 레드
    deluxe:      'bg-gradient-to-br from-blue-600 to-blue-700',         // 🔵 블루
    special:     'bg-gradient-to-br from-emerald-600 to-emerald-700',   // 🟢 에메랄드
    urgent:      'bg-gradient-to-br from-rose-600 to-rose-700',         // 🌹 로즈 (긴급)
    recommended: 'bg-gradient-to-br from-orange-500 to-orange-600',     // 🟠 오렌지
    native:      'bg-gradient-to-br from-slate-600 to-slate-700',       // ⬛ 슬레이트
    common:      'bg-gradient-to-br from-stone-700 to-stone-800'        // 🪨 스톤 다크
} as const;
