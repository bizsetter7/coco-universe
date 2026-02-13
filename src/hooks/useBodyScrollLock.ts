import { useEffect } from 'react';

/**
 * Hook to lock body scroll when a modal is open.
 * Prevents "jumpy" behavior and layout shifts.
 */
export const useBodyScrollLock = (isOpen: boolean) => {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const originalStyle = window.getComputedStyle(document.body).overflow;
        const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;

        if (isOpen) {
            // Prevent scrolling
            document.body.style.overflow = 'hidden';
            // Prevent layout shift (jump) by adding padding equal to scrollbar width
            // [Fix] Do NOT add padding on mobile devices where scrollbar is overlay (width 0 or purely visual)
            if (scrollBarWidth > 0 && window.innerWidth >= 768) {
                document.body.style.paddingRight = `${scrollBarWidth}px`;
            }
            document.body.classList.add('modal-open');
        } else {
            document.body.style.overflow = '';
            document.body.style.paddingRight = '';
            document.body.classList.remove('modal-open');
        }

        return () => {
            document.body.style.overflow = originalStyle;
            document.body.style.paddingRight = '';
            document.body.classList.remove('modal-open');
        };
    }, [isOpen]);
};
