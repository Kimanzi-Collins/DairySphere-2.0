import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: LucideIcon;
    color: string;
    delay?: number;
}

export default function StatCard({ title, value, subtitle, icon: Icon, color, delay = 0 }: StatCardProps) {
    const ref = useRef<HTMLDivElement>(null);
    const valRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
    if (!ref.current) return;
    // Set initial state immediately so card is never invisible
    gsap.set(ref.current, { opacity: 1, y: 0 });
    
    const ctx = gsap.context(() => {
        gsap.from(ref.current, {
            y: 30, opacity: 0,
            duration: 0.6,
            delay: Math.min(delay, 0.3), // Cap max delay to 0.3s
            ease: 'expo.out'
        });
        gsap.from(valRef.current, {
            scale: 0.8, opacity: 0,
            duration: 0.4,
            delay: Math.min(delay, 0.3) + 0.15,
            ease: 'back.out(1.5)'
        });
    });
    return () => ctx.revert();
}, [delay]);

    return (
        <div ref={ref} style={S.card}
            onMouseEnter={(e) => {
                gsap.to(e.currentTarget, {
                    y: -4, duration: 0.3, ease: 'power2.out',
                    boxShadow: '0 16px 32px rgba(0,0,0,0.3)'
                });
            }}
            onMouseLeave={(e) => {
                gsap.to(e.currentTarget, {
                    y: 0, duration: 0.3, ease: 'power2.out',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
                });
            }}
        >
            <div style={S.iconRow}>
                <div style={{
                    width: 42, height: 42,
                    borderRadius: 12,
                    background: `${color}14`,
                    border: `1px solid ${color}25`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <Icon size={20} color={color} />
                </div>
            </div>
            <div style={S.title}>{title}</div>
            <div ref={valRef} style={S.value}>{value}</div>
            {subtitle && <div style={S.sub}>{subtitle}</div>}
            <div style={{
                position: 'absolute',
                bottom: 0, left: 0, right: 0,
                height: '2px',
                background: `linear-gradient(90deg, ${color}, transparent)`,
            }} />
        </div>
    );
}

const S: Record<string, React.CSSProperties> = {
    card: {
        background: 'var(--glass-bg-card)',
        backdropFilter: 'blur(12px) saturate(160%)',
        border: '1px solid var(--glass-border)',
        borderRadius: '16px',
        padding: '22px 24px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '155px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        transition: 'all 0.35s cubic-bezier(0.23, 1, 0.32, 1)',
    },
    iconRow: {
        marginBottom: '14px',
    },
    title: {
        fontSize: '11px',
        fontWeight: 700,
        color: 'var(--text-muted)',
        textTransform: 'uppercase' as const,
        letterSpacing: '0.8px',
        marginBottom: '6px',
    },
    value: {
        fontSize: '26px',
        fontWeight: 800,
        color: 'var(--text-bright)',
        lineHeight: 1.1,
    },
    sub: {
        fontSize: '12px',
        color: 'var(--text-faint)',
        marginTop: '6px',
    },
};