'use client';

import { useEffect } from 'react';

/**
 * usePreventLeave - 페이지 이탈 방지 후크 (강화판)
 * @param isDirty - 경고를 띄울 조건 (true일 때만 작동)
 */
export const usePreventLeave = (isDirty: boolean) => {

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

        const pushStateHack = () => {
            // 히스토리에 현재 페이지를 하나 더 쌓아서 '뒤로가기'를 한 번 방어함
            window.history.pushState({ prevLeaveGuarded: true }, '', window.location.href);
        };

        pushStateHack();

        const handlePopState = (e: PopStateEvent) => {
            // 브라우저 뒤로가기 버튼을 누르면 이미 URL은 한 칸 뒤로 이동함

            // [Fix] 만약 뒤로 갔는데도 여전히 '보호 구역(prevLeaveGuarded)' 내부에 있다면, 
            // 이는 모달이 닫히는 등의 내부 이동이므로 경고창을 띄우지 않음.
            if (e.state && e.state.prevLeaveGuarded) {
                return;
            }

            if (window.confirm('작성 중인 내용이 저장되지 않았습니다. 정말 나가시겠습니까?')) {
                // 확인 시: 추가적인 back() 없이 앱 내부에 '이탈 확정' 알림만 보냄
                window.dispatchEvent(new CustomEvent('navigation-confirmed'));
            } else {
                // 취소 시: 다시 스택을 쌓아서 현재 자리를 지킴
                pushStateHack();
            }
        };

        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [isDirty]);
};
