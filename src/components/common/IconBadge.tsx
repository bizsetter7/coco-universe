import React from 'react';
import { getIconById } from '@/utils/shopUtils';

interface IconBadgeProps {
    iconId?: number | string | null;
    className?: string; // 추가적인 클래스 (크기 조절 등)
    showName?: boolean;  // 아이콘 이름도 같이 보여줄지 여부 (상세 모달용)
    textOnly?: boolean;  // 텍스트만 배지형으로 표시 (모바일 카드용)
}

/**
 * 🎨 IconBadge
 * 공고 제목 좌측 또는 상세 모달에서 사용되는 표준 아이콘 렌더링 컴포넌트
 */
export const IconBadge: React.FC<IconBadgeProps> = ({ iconId, className = "text-[12px]", showName = false, textOnly = false }) => {
    const iconObj = getIconById(iconId);
    if (!iconObj) return null;

    if (textOnly) {
        return (
            <span className="inline-flex items-center justify-center px-1.5 py-0.5 bg-pink-50 text-pink-600 rounded-[4px] border border-pink-100 text-[10px] font-black tracking-tighter shrink-0 align-middle mr-1 h-[18px]">
                {iconObj.name}
            </span>
        );
    }

    if (showName) {
        return (
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-pink-50 text-pink-600 rounded-xl border border-pink-100 shadow-sm shrink-0">
                <span className="text-lg">{iconObj.icon}</span>
                <span className="text-[10px] font-black uppercase tracking-tight">{iconObj.name}</span>
            </div>
        );
    }

    return (
        <span className={`${className} shrink-0 align-middle`}>
            {iconObj.icon}
        </span>
    );
};
