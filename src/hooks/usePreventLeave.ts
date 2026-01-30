'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * usePreventLeave - 페이지 이탈 방지 후크 (강화판)
 * @param isDirty - 경고를 띄울 조건 (true일 때만 작동)
 */
export const usePreventLeave = (isDirty: boolean) => {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // 1. 새로고침 및 탭 닫기 방지 (beforeunload)
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
                e.returnValue = '작성 중인 내용이 유실될 수 있습니다. 정말 나가시겠습니까?';
                return e.returnValue;
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [isDirty]);

    // 2. 뒤로가기 방지 (Push State Hack)
    useEffect(() => {
        if (!isDirty) return;

        // 현재 상태를 히스토리에 추가하여 "뒤로가기"를 눌렀을 때 이 상태가 pop되도록 함
        const pushStateHack = () => {
            window.history.pushState(null, '', window.location.href);
        };

        pushStateHack();

        const handlePopState = () => {
            if (window.confirm('작성 중인 내용이 저장되지 않았습니다. 정말 나가시겠습니까?')) {
                // 사용자가 확인을 누르면 뒤로가기 허용 (다시 back() 호출 X, 그냥 이동하게 둠? 이미 popstate가 일어남)
                // 하지만 pushStateHack으로 인해 현재 페이지임. 
                // 따라서 실제로 뒤로 가려면 history.back()을 다시 호출해야 하는데, 무한루프 위험.
                // 보통은 `history.back()`을 한 번 더 해주거나, 그냥 플래그 해제.

                // 여기서는 간단히 isDirty가 false가 아닌 이상 막아야 한다면, 
                // 확인을 눌렀을 때 (나가겠다) -> 뒤로가기 진행 (이미 pop됨)
                // 취소를 눌렀을 때 (안나가겠다) -> 다시 pushState 해줘야 함.
            } else {
                // 사용자가 취소를 누르면 (머무르겠다) -> 다시 상태를 push하여 제자리 유지
                pushStateHack();
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => {
            window.removeEventListener('popstate', handlePopState);
            // Cleanup: 필요하다면 불필요한 history entries 정리 가능하지만 복잡함.
        };
    }, [isDirty]);
};
