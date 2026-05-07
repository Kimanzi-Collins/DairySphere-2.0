import React from 'react';

type Props = { size?: number };

export default function AnimatedLogo({ size = 44 }: Props) {
    const s = size;
    const styles = `
    .ds-logo-wrap { width: ${s}px; height: ${s}px; display: inline-block; }
    .ds-svg { width: 100%; height: 100%; display: block; }
    .logo-ring { transform-origin: 50% 50%; animation: ds-rotate 6s linear infinite; opacity: 0.9; }
    .logo-drop { stroke-dasharray: 200; stroke-dashoffset: 200; animation: ds-draw 1.6s ease-out forwards 0.2s; }
    .logo-fill { animation: ds-bob 3s ease-in-out infinite; transform-origin: 50% 50%; }

    @keyframes ds-rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
    @keyframes ds-draw { to { stroke-dashoffset: 0; } }
    @keyframes ds-bob { 0% { transform: translateY(0); } 50% { transform: translateY(-3px); } 100% { transform: translateY(0); } }
    `;

    return (
        <div className="ds-logo-wrap" aria-hidden>
            <style>{styles}</style>
            <svg className="ds-svg" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" role="img">
                <defs>
                    <linearGradient id="dsGrad" x1="0" x2="1">
                        <stop offset="0%" stopColor="#6d5ce7" />
                        <stop offset="100%" stopColor="#00d4ff" />
                    </linearGradient>
                    <linearGradient id="dropGrad" x1="0" x2="1">
                        <stop offset="0%" stopColor="#fff" stopOpacity="0.95" />
                        <stop offset="100%" stopColor="#d6efff" stopOpacity="0.85" />
                    </linearGradient>
                </defs>

                <g className="logo-ring" transform="translate(24 24)">
                    <g>
                        <circle cx="0" cy="0" r="16" stroke="url(#dsGrad)" strokeWidth="2.2" fill="none" opacity="0.14" />
                        <circle cx="0" cy="0" r="11.5" stroke="url(#dsGrad)" strokeWidth="1.2" fill="none" opacity="0.08" />
                    </g>
                </g>

                <g transform="translate(0 0)" className="logo-fill">
                    <path
                        className="logo-drop"
                        d="M24 12c-3.8 5.2-8 9.1-8 14.5 0 6.6 5.4 9.5 8 11 2.6-1.5 8-4.4 8-11 0-5.4-4.2-9.3-8-14.5z"
                        fill="url(#dropGrad)"
                        stroke="#ffffff33"
                        strokeWidth="0.8"
                        transform="translate(0 0)"
                    />
                    <circle cx="24" cy="22" r="1.7" fill="#ffffff" opacity="0.9" />
                </g>
            </svg>
        </div>
    );
}
