'use client';

import { useEffect } from 'react';

/**
 * usePreventLeave - 페이지 이탈 방지 후크
 * @param isDirty - 경고를 띄울 조건 (true일 때만 작동)
 */
export const usePreventLeave = (isDirty: boolean) => {
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                // 표준 방식: e.preventDefault() 호출 및 returnValue 설정
                e.preventDefault();
                e.returnValue = '작성 중인 내용이 유실될 수 있습니다. 정말 나가시겠습니까?';
                return e.returnValue;
            }
        };

        // 현대 브라우저에서는 사용자가 페이지와 상호작용(클릭 등)을 한 번이라도 해야만 beforeunload 팝업이 뜹니다.
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [isDirty]);
};
