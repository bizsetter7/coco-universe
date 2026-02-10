'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { BrandConfig, BRANDS, DEFAULT_BRAND } from '@/lib/brand-config';
import { useSearchParams, usePathname } from 'next/navigation';

const BrandContext = createContext<BrandConfig>(DEFAULT_BRAND);

const BrandSync = ({ setBrand }: { setBrand: (b: BrandConfig) => void }) => {
    const searchParams = useSearchParams();
    const pathname = usePathname();

    // 0. Global Scroll to Top on Route Change
    useEffect(() => {
        if (typeof window !== 'undefined') {
            window.scrollTo({ top: 0, behavior: 'auto' });
        }
    }, [pathname]);

    useEffect(() => {
        // 1. Check search param first (for testing/development)
        const brandParam = searchParams.get('brand');
        if (brandParam && BRANDS[brandParam]) {
            setBrand(BRANDS[brandParam]);
            return;
        }

        // 2. Check hostname (for production)
        if (typeof window !== 'undefined') {
            const host = window.location.hostname;
            const foundBrand = Object.values(BRANDS).find((b) => host.includes(b.domain));
            if (foundBrand) {
                setBrand(foundBrand);
            }
        }
    }, [searchParams, setBrand]);

    return null;
};

export const BrandProvider = ({ children }: { children: React.ReactNode }) => {
    const [brand, setBrand] = useState<BrandConfig>(DEFAULT_BRAND);

    // 3. Sync Dark Mode Class to HTML/Body
    useEffect(() => {
        if (typeof document !== 'undefined') {
            const root = document.documentElement;
            if (brand.theme === 'dark') {
                root.classList.add('dark');
            } else {
                root.classList.remove('dark');
            }
        }
    }, [brand.theme]);

    return (
        <BrandContext.Provider value={brand}>
            <React.Suspense fallback={null}>
                <BrandSync setBrand={setBrand} />
            </React.Suspense>
            <style dangerouslySetInnerHTML={{
                __html: `
                :root {
                    --brand-primary: ${brand.primaryColor};
                }
            ` }} />
            {children}
        </BrandContext.Provider>
    );
};

export const useBrand = () => useContext(BrandContext);
