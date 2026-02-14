import { useEffect } from 'react';

declare global {
    interface Window {
        __scrollLockCount?: number;
    }
}

/**
 * Hook to lock body scroll when a modal is open.
 * Uses a global counter to handle nested modals correctly.
 */
export const useBodyScrollLock = (isOpen: boolean) => {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        if (isOpen) {
            // Increment global lock count
            window.__scrollLockCount = (window.__scrollLockCount || 0) + 1;

            const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

            // Only apply initial lock style if it's the first one
            if (window.__scrollLockCount === 1) {
                document.body.style.overflow = 'hidden';
                if (scrollBarWidth > 0 && window.innerWidth >= 768) {
                    document.body.style.paddingRight = `${scrollBarWidth}px`;
                }
                document.body.classList.add('modal-open');
            }
        } else {
            // On close, decrement
            if (window.__scrollLockCount && window.__scrollLockCount > 0) {
                window.__scrollLockCount--;

                // Only release if no more locks are active
                if (window.__scrollLockCount === 0) {
                    document.body.style.overflow = '';
                    document.body.style.paddingRight = '';
                    document.body.classList.remove('modal-open');
                }
            }
        }

        return () => {
            // Cleanup on unmount - Only decrement if it was actually locked by THIS instance
            if (isOpen) {
                if (window.__scrollLockCount && window.__scrollLockCount > 0) {
                    window.__scrollLockCount--;
                    if (window.__scrollLockCount === 0) {
                        document.body.style.overflow = '';
                        document.body.style.paddingRight = '';
                        document.body.classList.remove('modal-open');
                    }
                }
            }
        };
    }, [isOpen]);
};
