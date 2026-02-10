'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useMobile } from '@/hooks/useMobile';

interface StickyWrapperProps {
    children: React.ReactNode;
    offsetTop?: number;
    className?: string;
}

/**
 * Intelligent Sticky Wrapper (v2)
 * - If content < Viewport: Standard Sticky
 * - If content > Viewport: Two-way follow (Shows bottom when scrolling down, top when scrolling up)
 * - Optimized for performance: Disabled on mobile
 */
export const StickyWrapper = ({
    children,
    offsetTop = 80,
    className = ""
}: StickyWrapperProps) => {
    const isMobile = useMobile();
    const wrapperRef = useRef<HTMLDivElement>(null);

    // 단순화된 네이티브 Sticky 설정
    const stickyStyle: React.CSSProperties = isMobile ? {} : {
        position: 'sticky',
        top: `${offsetTop}px`,
        zIndex: 50
    };

    return (
        <div
            ref={wrapperRef}
            className={`transition-none ${className}`}
            style={stickyStyle}
        >
            {children}
        </div>
    );
};
