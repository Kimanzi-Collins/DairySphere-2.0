import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import gsap from 'gsap';

interface DarkCardProps {
    children: ReactNode;
    delay?: number;
    className?: string;
    style?: React.CSSProperties;
    hover?: boolean;
}

export default function DarkCard({ children, delay = 0, style, hover = true }: DarkCardProps) {
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        gsap.from(cardRef.current, {
            y: 30, opacity: 0, scale: 0.97,
            duration: 0.6, delay,
            ease: 'power3.out'
        });
    }, [delay]);

    return (
        <div
            ref={cardRef}
            style={{
                background: '#111827',
                borderRadius: '16px',
                border: '1px solid rgba(255,255,255,0.06)',
                padding: '24px',
                transition: hover ? 'transform 0.3s ease, box-shadow 0.3s ease' : 'none',
                cursor: hover ? 'default' : 'auto',
                ...style,
            }}
            onMouseEnter={(e) => {
                if (hover) {
                    gsap.to(e.currentTarget, {
                        y: -4, duration: 0.3, ease: 'power2.out',
                        boxShadow: '0 12px 32px rgba(0,0,0,0.3)'
                    });
                }
            }}
            onMouseLeave={(e) => {
                if (hover) {
                    gsap.to(e.currentTarget, {
                        y: 0, duration: 0.3, ease: 'power2.out',
                        boxShadow: 'none'
                    });
                }
            }}
        >
            {children}
        </div>
    );
}