'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { BrandConfig, BRANDS, DEFAULT_BRAND } from '@/lib/brand-config';
import { useSearchParams } from 'next/navigation';

const BrandContext = createContext<BrandConfig>(DEFAULT_BRAND);

export const BrandProvider = ({ children }: { children: React.ReactNode }) => {
    const [brand, setBrand] = useState<BrandConfig>(DEFAULT_BRAND);
    const searchParams = useSearchParams();

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
                .dark-theme {
                    background-color: #111827;
                    color: white;
                }
            ` }} />
            <div className={brand.theme === 'dark' ? 'dark-theme min-h-screen' : 'min-h-screen'}>
                {children}
            </div>
        </BrandContext.Provider>
    );
};

export const useBrand = () => useContext(BrandContext);
