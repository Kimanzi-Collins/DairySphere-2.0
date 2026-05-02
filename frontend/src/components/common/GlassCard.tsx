import { useLayoutEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

interface GlassCardProps {
    children: ReactNode;
    delay?: number;
    style?: React.CSSProperties;
    hover?: boolean;
    scrollReveal?: boolean;
    className?: string;
}

export default function GlassCard({
    children, delay = 0, style,
    hover = true, scrollReveal = false, className
}: GlassCardProps) {
    const ref = useRef<HTMLDivElement>(null);

    useLayoutEffect(() => {
        if (!ref.current) return;

        const ctx = gsap.context(() => {
            const element = ref.current;
            if (!element) return;

            if (scrollReveal) {
                gsap.fromTo(
                    element,
                    { y: 42, autoAlpha: 0, scale: 0.975 },
                    {
                        y: 0,
                        autoAlpha: 1,
                        scale: 1,
                        duration: 0.95,
                        delay,
                        ease: 'power4.out',
                        overwrite: 'auto',
                        scrollTrigger: {
                            trigger: element,
                            start: 'top 88%',
                            once: true,
                            invalidateOnRefresh: true,
                        },
                    }
                );
            } else {
                gsap.fromTo(
                    element,
                    { y: 40, autoAlpha: 0, scale: 0.96 },
                    {
                        y: 0,
                        autoAlpha: 1,
                        scale: 1,
                        duration: 0.8,
                        delay,
                        ease: 'power4.out',
                        overwrite: 'auto',
                        immediateRender: false,
                    }
                );
            }
        }, ref);

        return () => ctx.revert();
    }, [delay, scrollReveal]);

    return (
        <div
            ref={ref}
            className={className ? `glass-card ${className}` : 'glass-card'}
            style={{ padding: '24px', ...style }}
            onMouseEnter={(e) => {
                if (!hover) return;
                gsap.to(e.currentTarget, {
                    y: -6,
                    scale: 1.006,
                    duration: 0.42,
                    ease: 'power3.out',
                    overwrite: 'auto',
                });
            }}
            onMouseLeave={(e) => {
                if (!hover) return;
                gsap.to(e.currentTarget, {
                    y: 0,
                    scale: 1,
                    duration: 0.42,
                    ease: 'power3.out',
                    overwrite: 'auto',
                });
            }}
        >
            {children}
        </div>
    );
}