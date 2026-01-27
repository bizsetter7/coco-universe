'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { BrandConfig, BRANDS, DEFAULT_BRAND } from '@/lib/brand-config';
import { useSearchParams, usePathname } from 'next/navigation';

const BrandContext = createContext<BrandConfig>(DEFAULT_BRAND);

export const BrandProvider = ({ children }: { children: React.ReactNode }) => {
    const [brand, setBrand] = useState<BrandConfig>(DEFAULT_BRAND);
    const pathname = usePathname();
    const searchParams = useSearchParams();

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
    }, [searchParams]);

    return (
        <BrandContext.Provider value={brand}>
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
