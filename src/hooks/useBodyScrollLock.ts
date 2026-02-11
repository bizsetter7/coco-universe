import { useEffect } from 'react';

/**
 * Hook to lock body scroll when a modal is open.
 * @param isOpen - Boolean state indicating if the modal is visible.
 */
export const useBodyScrollLock = (isOpen: boolean) => {
    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('modal-active');
            document.body.classList.add('modal-open');
            // Simplified: Just lock overflow to prevent jump
            document.body.style.overflow = 'hidden';
        } else {
            document.body.classList.remove('modal-active');
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
        }

        return () => {
            document.body.classList.remove('modal-active');
            document.body.classList.remove('modal-open');
            document.body.style.overflow = '';
        };
    }, [isOpen]);
};
