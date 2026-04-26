import { useRef } from 'react';
import QRCode from 'react-qr-code';
import { toast } from 'react-toastify';
import type { ShareResponse } from '../types/ShareResponse';
import Button from '../../ui/components/Button';
import Modal from '../../ui/components/Modal';


interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    result: ShareResponse;
    planId: string;
}

export default function ShareModal({ isOpen, onClose, result }: ShareModalProps) {
    const qrRef = useRef<HTMLDivElement>(null);

    const shareUrl = `${import.meta.env.VITE_FRONTEND_URL}/shared/${result.token}`;

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(shareUrl);
            toast.info('Link copied to clipboard!');
        } catch {
            toast.error('Failed to copy link');
        }
    };

    const handleDownloadQR = () => {
        const svg = qrRef.current?.querySelector('svg');
        if (!svg) return;

        const canvas = document.createElement('canvas');
        const scale = 3;
        canvas.width = 180 * scale;
        canvas.height = 180 * scale;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // White background
        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const svgData = new XMLSerializer().serializeToString(svg);
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            const a = document.createElement('a');
            a.download = `share-qr-${result.token.slice(0, 8)}.png`;
            a.href = canvas.toDataURL('image/png');
            a.click();
        };
        img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Share Your Plan" size="md">
            {/* Access type badge */}
            <div className="flex items-center gap-2 mb-6">
                <span className={`px-3 py-1 rounded-full text-xs font-medium font-body ${result.accessType === 'EDIT'
                    ? 'bg-teal-500/20 text-teal-400'
                    : 'bg-slate-700/50 text-slate-400'
                    }`}>
                    {result.accessType === 'EDIT' ? '✏️ Edit Access' : '👁️ View Only'}
                </span>
            </div>

            {/* URL */}
            <div className="mb-6">
                <label className="text-xs font-medium text-slate-300 uppercase tracking-wider block mb-2">
                    Shareable Link
                </label>
                <div className="flex gap-2">
                    <div className="flex-1 bg-navy-800 border border-navy-700 rounded-lg px-3 py-2.5 overflow-hidden">
                        <p className="text-teal-400 text-xs font-mono truncate">{shareUrl}</p>
                    </div>
                    <Button variant="secondary" size="sm" onClick={handleCopy} className="flex-shrink-0">
                        Copy
                    </Button>
                </div>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center gap-4">
                <label className="text-xs font-medium text-slate-300 uppercase tracking-wider self-start">
                    QR Code
                </label>
                <div
                    ref={qrRef}
                    className="p-4 bg-navy-950 rounded-2xl border border-navy-800"
                >
                    <QRCode
                        value={shareUrl}
                        size={180}
                        bgColor="#020817"
                        fgColor="#2dd4bf"
                        level="M"
                    />
                </div>
                <Button variant="secondary" size="sm" onClick={handleDownloadQR}>
                    ↓ Download QR Code
                </Button>
            </div>
        </Modal>
    );
}