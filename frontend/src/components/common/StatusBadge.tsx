interface StatusBadgeProps {
    status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
    const map: Record<string, { bg: string; color: string }> = {
        Credit:    { bg: 'rgba(74, 222, 128, 0.12)', color: '#4ade80' },
        Active:    { bg: 'rgba(139, 124, 246, 0.12)', color: '#8b7cf6' },
        Completed: { bg: 'rgba(45, 212, 191, 0.12)', color: '#2dd4bf' },
        Deficit:   { bg: 'rgba(239, 68, 68, 0.12)',  color: '#ef4444' },
        Zero:      { bg: 'rgba(234, 179, 8, 0.12)',  color: '#eab308' },
        Pending:   { bg: 'rgba(234, 179, 8, 0.12)',  color: '#eab308' },
    };

    const c = map[status] || map['Pending'];

    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '3px 10px',
            borderRadius: '8px',
            fontSize: '10px',
            fontWeight: 700,
            background: c.bg,
            color: c.color,
            letterSpacing: '0.3px',
            border: `1px solid ${c.color}20`,
        }}>
            {status}
        </span>
    );
}