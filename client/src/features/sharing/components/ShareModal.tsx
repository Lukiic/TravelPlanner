import { useRef, useState } from "react";
import QRCodeComponent from 'react-qr-code';
import { toast } from "react-toastify";
import Button from "../../ui/components/Button";
import Modal from "../../ui/components/Modal";
import type { ShareResponse } from "../types/ShareResponse";

interface ShareModalProps {
    isOpen: boolean;
    onClose: () => void;
    result: ShareResponse;
    planId: string;
}

export default function ShareModal({ isOpen, onClose, result }: ShareModalProps) {
    const qrRef = useRef<HTMLDivElement>(null);
    const [showLink, setShowLink] = useState(false);
    const QRCode = (QRCodeComponent as any).QRCode || QRCodeComponent;

    const shareUrl = `${import.meta.env.VITE_FRONTEND_URL ?? window.location.origin}/shared/${result.token}`;

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
        if (!svg)
            return;

        const scale = 4;
        const size = 200;
        const canvas = document.createElement('canvas');
        canvas.width = size * scale;
        canvas.height = size * scale;
        const ctx = canvas.getContext('2d');
        if (!ctx)
            return;

        ctx.fillStyle = '#0f172a';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const svgData = new XMLSerializer().serializeToString(svg);
        const blob = new Blob([svgData], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const img = new Image();
        img.onload = () => {
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            URL.revokeObjectURL(url);
            const a = document.createElement('a');
            a.download = `travel-plan-qr-${result.token.slice(0, 8)}.png`;
            a.href = canvas.toDataURL('image/png');
            a.click();
        };
        img.src = url;
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Share This Plan" size="sm">
            {/* Access badge */}
            <div className="flex justify-center mb-5">
                <span className={`px-4 py-1.5 rounded-full text-xs font-semibold ${result.accessType === 'EDIT'
                    ? 'bg-teal-500/20 text-teal-400 border border-teal-500/30'
                    : 'bg-slate-700/50 text-slate-400 border border-slate-600/30'
                    }`}>
                    {result.accessType === 'EDIT' ? '✏️  Edit access' : '👁️  View only'}
                </span>
            </div>

            {/* QR Code */}
            <div className="flex flex-col items-center gap-4 mb-6">
                <p className="text-xs text-slate-500 uppercase tracking-wider">Scan or download to share</p>
                <div
                    ref={qrRef}
                    className="p-5 bg-white rounded-2xl shadow-card"  /* white bg for QR readability */
                >
                    <QRCode
                        value={shareUrl}
                        size={200}
                        bgColor="#ffffff"
                        fgColor="#0f172a"
                        level="M"
                    />
                </div>

                {/* Download button */}
                <Button onClick={handleDownloadQR} className="w-full justify-center">
                    ↓ Download QR Code as PNG
                </Button>
            </div>

            {/* Collapsible link section */}
            <div className="border-t border-navy-700 pt-4">
                <button
                    onClick={() => setShowLink(v => !v)}
                    className="text-xs text-slate-500 hover:text-slate-300 transition-colors flex items-center gap-2 w-full"
                >
                    <span>{showLink ? '▴' : '▾'}</span>
                    {showLink ? 'Hide shareable link' : 'Show shareable link'}
                </button>

                {showLink && (
                    <div className="mt-3 flex gap-2">
                        <div className="flex-1 bg-navy-800 border border-navy-700 rounded-lg px-3 py-2 overflow-hidden">
                            <p className="text-teal-400 text-xs font-mono truncate">{shareUrl}</p>
                        </div>
                        <Button variant="secondary" size="sm" onClick={handleCopy}>
                            Copy
                        </Button>
                    </div>
                )}
            </div>
        </Modal>
    );
}