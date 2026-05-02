import type { ReactNode } from 'react';

interface FormFieldProps {
    label: string;
    children: ReactNode;
    error?: string;
}

export default function FormField({ label, children, error }: FormFieldProps) {
    return (
        <div style={S.field}>
            <label style={S.label}>{label}</label>
            {children}
            {error && <span style={S.error}>{error}</span>}
        </div>
    );
}

// Reusable input style
export const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '11px 14px',
    fontSize: '14px',
    fontFamily: 'Plus Jakarta Sans, sans-serif',
    color: '#e6edf3',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    outline: 'none',
    transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
};

export const selectStyle: React.CSSProperties = {
    ...inputStyle,
    appearance: 'none' as const,
    cursor: 'pointer',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%238b949e' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 12px center',
    paddingRight: '36px',
};

const S: Record<string, React.CSSProperties> = {
    field: {
        marginBottom: '18px',
    },
    label: {
        display: 'block',
        fontSize: '12px',
        fontWeight: 600,
        color: '#8b949e',
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
        marginBottom: '6px',
    },
    error: {
        fontSize: '12px',
        color: '#ef4444',
        marginTop: '4px',
        display: 'block',
    },
};