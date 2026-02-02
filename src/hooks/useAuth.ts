import { useState, useEffect } from 'react';

// Simple event-based auth hook for client-side demo
export function useAuth() {
    const [isLoggedIn, setIsLoggedInState] = useState(false);

    useEffect(() => {
        // Init
        const stored = localStorage.getItem('demo_isLoggedIn');
        if (stored === 'true') setIsLoggedInState(true);

        // Listen for storage changes (cross-tab) or custom events
        const handleStorage = () => {
            const current = localStorage.getItem('demo_isLoggedIn') === 'true';
            setIsLoggedInState(current);
        };

        window.addEventListener('storage', handleStorage);
        window.addEventListener('auth-change', handleStorage);

        return () => {
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('auth-change', handleStorage);
        };
    }, []);

    const login = () => {
        localStorage.setItem('demo_isLoggedIn', 'true');
        window.dispatchEvent(new Event('auth-change'));
        setIsLoggedInState(true);
    };

    const logout = () => {
        localStorage.setItem('demo_isLoggedIn', 'false');
        window.dispatchEvent(new Event('auth-change'));
        setIsLoggedInState(false);
    };

    const toggle = () => {
        if (isLoggedIn) logout();
        else login();
    };

    return { isLoggedIn, login, logout, toggle };
}
