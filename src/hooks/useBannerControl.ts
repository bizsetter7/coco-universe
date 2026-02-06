
import { useEffect, useState } from 'react';

/**
 * Hook to detect if any modal is open (checking body classes)
 * and control banner visibility globally.
 */
export const useBannerControl = () => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Function to check body state
        const checkModalState = () => {
            const body = document.body;
            // Check for common modal classes or specific app classes
            const isModalOpen = body.classList.contains('modal-open') ||
                body.classList.contains('modal-active') ||
                body.style.overflow === 'hidden';

            setIsVisible(!isModalOpen);
        };

        // 1. Initial Check
        checkModalState();

        // 2. Mutation Observer to watch for class changes
        const observer = new MutationObserver((mutations) => {
            checkModalState();
        });

        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['class', 'style']
        });

        // 3. Listen to Custom Event (backward compatibility with my-shop page logic)
        const handleCustomToggle = (e: Event) => {
            const customEvent = e as CustomEvent;
            if (customEvent.detail && typeof customEvent.detail.visible === 'boolean') {
                // If custom event says hide, we hide. 
                // If custom event says show, we still check modal state to be safe.
                if (customEvent.detail.visible === false) {
                    setIsVisible(false);
                } else {
                    checkModalState();
                }
            }
        };
        window.addEventListener('toggle-side-banner', handleCustomToggle);

        return () => {
            observer.disconnect();
            window.removeEventListener('toggle-side-banner', handleCustomToggle);
        };
    }, []);

    return isVisible;
};
