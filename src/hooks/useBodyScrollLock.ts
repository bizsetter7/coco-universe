import { useEffect } from 'react';

/**
 * Hook to lock body scroll when a modal is open.
 * @param isOpen - Boolean state indicating if the modal is visible.
 */
export const useBodyScrollLock = (isOpen: boolean) => {
    useEffect(() => {
        if (isOpen) {
            document.body.classList.add('modal-active');
        } else {
            document.body.classList.remove('modal-active');
        }

        // Cleanup function to ensure scroll is restored if component unmounts while modal is "open"
        return () => {
            document.body.classList.remove('modal-active');
        };
    }, [isOpen]);
};
