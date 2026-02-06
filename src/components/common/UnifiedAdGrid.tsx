'use client';

import React from 'react';
import { Crown, Trophy, Sparkles, Flame, Star } from 'lucide-react';
import { Shop } from '@/types/shop';
import { AdSection } from './AdSection';
import { AdSectionSkeleton } from './AdSectionSkeleton';

interface UnifiedAdGridProps {
    shops: Shop[] | null; // Allow null for loading
    isLoading?: boolean;
    onAdRegister: (tier: string) => void;
    onSelectShop: (shop: Shop) => void;
    columns?: 3 | 4; // Propagate column setting
}

export const UnifiedAdGrid = ({ shops, isLoading, onAdRegister, onSelectShop, columns = 4 }: UnifiedAdGridProps) => {

    if (isLoading || !shops) {
        return (
            <div className="w-full">
                <AdSectionSkeleton title="그랜드 채용" rowCountPC={2} />
                <AdSectionSkeleton title="프리미엄 채용" rowCountPC={2} />
                <AdSectionSkeleton title="디럭스 채용" rowCountPC={2} />
            </div>
        );
    }

    // Slice based on columns to maintain consistent row appearance
    const itemsPerSection = columns * 2; // e.g., 3 cols * 2 rows = 6 items, 4 cols * 2 rows = 8 items

    // Actually, we need to map the global slice logic.
    // The original data was flat shops array.
    // If we change column count, we might display fewer items if we strictly follow "2 rows".
    // 4 cols * 2 rows = 8 items.
    // 3 cols * 2 rows = 6 items.
    // If we just use the same slice indices (0-12, 12-24, etc), we might have extra items or wrap weirdly.
    // Original slices: Grand 0-12 (12 items), Premium 12-24 (12 items)...
    // 12 items / 4 cols = 3 rows.
    // 12 items / 3 cols = 4 rows.
    // If the user wants to keep "Look Same", they probably mean card size.
    // So 3 cols is correct for smaller width.
    // The slice logic in HomeClient was static. Let's keep using it but just display what fits?
    // Or should we adjust the slice?
    // AdSection now uses `shops.slice(0, totalPC)` where `totalPC = columns * rowCountPC`.
    // We pass `rowCountPC={2}` previously.
    // If cols=4, totalPC=8. (Wait, HomeClient passed rowCountPC=2, so 8 items shown?)
    // Actually HomeClient slice was 0-12 (12 items).
    // Let's re-read AdSection: `shops.slice(0, totalPC)`.
    // If we pass rowCountPC=3 for Grand, totalPC=12.
    // So for 3 cols, we probably want rowCountPC=4 to show 12 items? (3*4=12).
    // Let's just pass the sliced arrays as is. AdSection handles the display limit.

    const grandShops = shops.slice(0, 12);
    const premiumShops = shops.slice(12, 24);
    const deluxeShops = shops.slice(24, 36);
    const specialShops = shops.slice(36, 48);
    const urgentShops = shops.slice(48, 60);

    return (
        <div className="w-full">
            {/* 1. Grand */}
            <AdSection
                title="그랜드 채용"
                icon={<Crown className="text-amber-500" fill="currentColor" />}
                shops={grandShops}
                tierId="grand"
                rowCountPC={3} // Showing more rows for Grand usually?
                // HomeClient had `rowCountPC={2}` for all except maybe Grand? 
                // Let's look at previous HomeClient... it was `rowCountPC={2}` for Grand too.
                // But slice was 12. 4*2 = 8. So 4 items were hidden?
                // Let's stick to passing `columns` prop.
                onAdRegister={onAdRegister}
                onSelectShop={onSelectShop}
                columns={columns}
            />

            {/* 2. Premium */}
            <AdSection
                title="프리미엄 채용"
                icon={<Trophy className="text-slate-500" fill="currentColor" />}
                shops={premiumShops}
                tierId="premium"
                rowCountPC={3} // Increase row count to show more items if we reduce columns?
                // If we want to show ALL items in the slice (12), 
                // 4 cols -> 3 rows.
                // 3 cols -> 4 rows.
                // Let's just set rowCountPC high enough to cover the slice if we want to show all.
                // Or stick to 2 rows (8 or 6 items).
                // User said "Make it look the same".
                // Layout-wise, 3 columns will look less squashed.
                onAdRegister={onAdRegister}
                onSelectShop={onSelectShop}
                columns={columns}
            />

            {/* 3. Deluxe */}
            <AdSection
                title="디럭스 채용"
                icon={<Sparkles className="text-blue-500" fill="currentColor" />}
                shops={deluxeShops}
                tierId="deluxe"
                rowCountPC={2}
                onAdRegister={onAdRegister}
                onSelectShop={onSelectShop}
                columns={columns}
            />

            {/* 4. Special */}
            <AdSection
                title="스페셜 채용"
                icon={<Star className="text-pink-500" fill="currentColor" />}
                shops={specialShops}
                tierId="special"
                rowCountPC={2}
                onAdRegister={onAdRegister}
                onSelectShop={onSelectShop}
                columns={columns}
            />

            {/* 5. Urgent */}
            <AdSection
                title="긴급 구인"
                icon={<Flame className="text-red-500" fill="currentColor" />}
                shops={urgentShops}
                tierId="urgent"
                rowCountPC={2}
                onAdRegister={onAdRegister}
                onSelectShop={onSelectShop}
                columns={columns}
            />
        </div>
    );
};
