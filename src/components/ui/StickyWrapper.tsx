'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useMobile } from '@/hooks/useMobile';

interface StickyWrapperProps {
    children: React.ReactNode;
    offsetTop?: number;
    className?: string;
    isInternal?: boolean; // New prop for dual-sticky behavior
}

/**
 * High-End Smooth Follower Wrapper (v4 - Dual Sticky Edition)
 * - Simple mode: Follows top (for side banners)
 * - Internal mode: Smartly follows bottom on scroll down, top on scroll up
 */
export const StickyWrapper = ({
    children,
    offsetTop = 56,
    className = "",
    isInternal = false
}: StickyWrapperProps) => {
    const isMobile = useMobile();
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [yOffset, setYOffset] = useState(0);
    const prevScrollY = useRef(0);

    useEffect(() => {
        if (isMobile) return;

        const handleScroll = () => {
            if (!wrapperRef.current) return;

            const scrollY = window.scrollY;
            const viewportHeight = window.innerHeight;
            const isScrollingDown = scrollY > prevScrollY.current;
            const footer = document.querySelector('footer');
            const footerTop = footer ? footer.offsetTop : document.body.scrollHeight;

            const parentRect = wrapperRef.current.parentElement?.getBoundingClientRect();
            const parentTop = parentRect ? parentRect.top + scrollY : 0;
            const wrapperHeight = wrapperRef.current.offsetHeight;

            let targetY = yOffset;

            // Scenario A: Wrapper is shorter than viewport -> Simple sticky top
            if (wrapperHeight + offsetTop < viewportHeight || !isInternal) {
                targetY = Math.max(0, scrollY + offsetTop - parentTop);
            }
            // Scenario B: Wrapper is taller than viewport -> Dual Sticky
            else {
                if (isScrollingDown) {
                    // When scrolling down, follow when bottom hits viewport bottom
                    const bottomLimit = scrollY + viewportHeight - wrapperHeight - parentTop - 20;
                    targetY = Math.max(yOffset, bottomLimit);
                } else {
                    // When scrolling up, follow when top hits viewport top (offsetTop)
                    const topLimit = scrollY + offsetTop - parentTop;
                    targetY = Math.min(yOffset, topLimit);
                }
            }

            // Global Boundary: Don't push into footer
            if (parentTop + targetY + wrapperHeight + 20 > footerTop) {
                targetY = footerTop - 20 - wrapperHeight - parentTop;
            }

            // Ensure we don't jump above parent starting point
            targetY = Math.max(0, targetY);

            setYOffset(targetY);
            prevScrollY.current = scrollY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });

        // [New] ResizeObserver to handle dynamic height changes (e.g. image loads)
        const resizeObserver = new ResizeObserver(() => {
            handleScroll();
        });

        if (wrapperRef.current) {
            resizeObserver.observe(wrapperRef.current);
        }

        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            resizeObserver.disconnect();
        };
    }, [isMobile, offsetTop, isInternal, yOffset]);

    // Apply smooth transition style
    const followerStyle: React.CSSProperties = isMobile ? {} : {
        transform: `translateY(${yOffset}px)`,
        transition: 'transform 1.0s cubic-bezier(0.15, 0.3, 0.15, 1)', // Adjusted to ~1s delay with smoother entry
        willChange: 'transform',
        zIndex: 50
    };

    return (
        <div
            ref={wrapperRef}
            className={`relative w-full ${className}`}
            style={followerStyle}
        >
            {children}
        </div>
    );
};
