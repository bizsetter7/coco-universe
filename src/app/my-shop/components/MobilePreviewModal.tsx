import React from 'react';
import { createPortal } from 'react-dom';
import { X, MapPin, Store, MessageCircle, Phone, Info } from 'lucide-react';
import { formatKoreanMoney } from '@/utils/formatMoney';
import { cleanShopTitle } from '@/utils/shopUtils';
import { IconBadge } from '@/components/common/IconBadge';
import { getHighlighterStyle } from '@/utils/highlighter';
import { MobilePreviewContent } from './MobilePreviewContent';

interface PreviewModalProps {
    brand: any;
    onClose: () => void;
    formData: any;
}

export const MobilePreviewModal: React.FC<PreviewModalProps> = ({ brand, onClose, formData }) => {
    if (typeof document === 'undefined') return null;

    return createPortal(
        <div className="fixed inset-0 z-[20000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
            <div
                className={`bg-white rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]`}
                style={{ width: '100%', maxWidth: '600px' }}
            >
                {/* Close Button Overlay */}
                <div className="relative h-0 z-50">
                    <button onClick={onClose} className="absolute top-5 right-6 p-2 bg-black/20 hover:bg-black/40 text-white rounded-full transition backdrop-blur-md">
                        <X size={20} />
                    </button>
                </div>

                <MobilePreviewContent formData={formData} brand={brand} />
            </div>
        </div>,
        document.body
    );
};
