'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { JobDetailContent } from '@/components/jobs/JobDetailModal';
import { anyAdToShop } from '@/lib/adUtils';

/**
 * my-shop 전용 광고 상세 모달
 * JobDetailContent를 래핑하여 데이터 정규화를 수행합니다.
 */
export const AdDetailModal = ({ ad, onClose }: { ad: any; onClose: () => void }) => {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !ad) return null;

    const shop = anyAdToShop(ad);

    return createPortal(
        <div 
            className="modal-overlay fixed inset-0 z-[20000] flex items-end md:items-center justify-center bg-black/80 backdrop-blur-sm touch-none overscroll-contain animate-in fade-in duration-300"
            onClick={onClose}
        >
            <div 
                className="relative w-full max-w-lg md:max-w-xl max-h-[92vh] overflow-hidden rounded-t-[32px] md:rounded-[32px] bg-white z-10 animate-in slide-in-from-bottom duration-300"
                onClick={e => e.stopPropagation()}
            >
                <JobDetailContent shop={shop} onClose={onClose} />
            </div>
        </div>,
        document.body
    );
};

export default AdDetailModal;
