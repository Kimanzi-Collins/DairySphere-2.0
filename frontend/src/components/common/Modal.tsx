import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import gsap from 'gsap';
import { X } from 'lucide-react';
import { createPortal } from 'react-dom';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    width?: string;
}

export default function Modal({ isOpen, onClose, title, children, width = '520px' }: ModalProps) {
    const backdropRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!isOpen) return;

        document.body.style.overflow = 'hidden';

        // Animate backdrop
        gsap.fromTo(backdropRef.current,
            { opacity: 0 },
            { opacity: 1, duration: 0.3, ease: 'power2.out' }
        );

        // Animate panel
        gsap.fromTo(panelRef.current,
            { opacity: 0, y: 50, scale: 0.92 },
            { opacity: 1, y: 0, scale: 1, duration: 0.5, ease: 'expo.out', delay: 0.1 }
        );

        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const handleClose = () => {
        gsap.to(panelRef.current, {
            opacity: 0, y: 30, scale: 0.95,
            duration: 0.25, ease: 'power2.in',
        });
        gsap.to(backdropRef.current, {
            opacity: 0, duration: 0.3, ease: 'power2.in',
            onComplete: onClose,
        });
    };

    if (!isOpen) return null;

    // Portal renders directly into document.body — escapes any parent stacking context
    return createPortal(
        <>
            {/* Layer 1: Backdrop (with blur) */}
            <div
                ref={backdropRef}
                onClick={handleClose}
                style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0, 0, 0, 0.65)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    zIndex: 9998,
                }}
            />

            {/* Layer 2: Panel (above backdrop, NO blur applied to it) */}
            <div
                style={{
                    position: 'fixed',
                    top: 0, left: 0, right: 0, bottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 9999,
                    pointerEvents: 'none',
                    padding: '20px',
                }}
            >
                <div
                    ref={panelRef}
                    onClick={(e) => e.stopPropagation()}
                    style={{
                        width: '100%',
                        maxWidth: width,
                        background: '#161b22',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        borderRadius: '20px',
                        overflow: 'hidden',
                        boxShadow: '0 32px 80px rgba(0, 0, 0, 0.7), 0 0 0 1px rgba(255,255,255,0.04) inset',
                        pointerEvents: 'auto',
                    }}
                >
                    {/* Header */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '20px 24px',
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                        background: 'rgba(255,255,255,0.02)',
                    }}>
                        <h2 style={{
                            fontSize: '17px',
                            fontWeight: 700,
                            color: '#e6edf3',
                            margin: 0,
                        }}>{title}</h2>

                        <div
                            onClick={handleClose}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(239,68,68,0.1)';
                                e.currentTarget.style.color = '#ef4444';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                                e.currentTarget.style.color = '#8b949e';
                            }}
                            style={{
                                width: '34px', height: '34px',
                                borderRadius: '10px',
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                color: '#8b949e',
                                transition: 'all 0.2s ease',
                            }}
                        >
                            <X size={18} />
                        </div>
                    </div>

                    {/* Body */}
                    <div style={{
                        padding: '24px',
                        maxHeight: '70vh',
                        overflowY: 'auto',
                    }}>
                        {children}
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
}