import { useEffect, useMemo, useState } from 'react';
import { FileText, Users, Wallet, BadgeMinus } from 'lucide-react';
import {
    ResponsiveContainer,
    AreaChart,
    Area,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
} from 'recharts';
import GlassCard from '../../components/common/GlassCard';
import { reportsAPI } from '../../api';
import { formatCurrency } from '../../utils/formatCurrency';

interface SocietySummary {
    TotalFarmers: number;
    TotalDeliveryRevenue: number;
    TotalDeductions: number;
    TotalDisbursed: number;
}

interface StatementTrend {
    MonthDisplay: string;
    TotalDeliveries: number;
    TotalAllDeductions: number;
    TotalNetPayments: number;
}

interface FarmerStatement {
    FarmerId: string;
    FarmerName: string;
    MonthDisplay: string;
    DeliveryAmount: number;
    TotalDeductions: number;
    NetPayment: number;
    PaymentStatus: string;
}

export default function StatementsReport() {
    const [summary, setSummary] = useState<SocietySummary | null>(null);
    const [trends, setTrends] = useState<StatementTrend[]>([]);
    const [statements, setStatements] = useState<FarmerStatement[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const [summaryData, trendsData, statementsData] = await Promise.all([
                    reportsAPI.statementSociety(),
                    reportsAPI.statementTrends(),
                    reportsAPI.statements(),
                ]);
                setSummary(summaryData as SocietySummary);
                setTrends(trendsData as StatementTrend[]);
                setStatements(statementsData as FarmerStatement[]);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load statements report');
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    const recentStatements = useMemo(() => statements.slice(-120).reverse(), [statements]);

    if (loading) return <ReportLoading label="Loading statements report..." />;
    if (error) return <ReportError message={error} />;

    return (
        <div>
            <div className="glass-card" style={{ padding: '22px 24px', marginBottom: 18 }}>
                <h2 style={titleStyle}>Farmer Statements Report</h2>
                <p style={subTitleStyle}>Monthly payment statements across all farmers with deductions overview.</p>
            </div>

            <div style={statsGridStyle}>
                <Metric icon={Users} label="Farmers" value={(summary?.TotalFarmers || 0).toLocaleString()} delay={0.04} />
                <Metric icon={Wallet} label="Delivery Revenue" value={formatCurrency(summary?.TotalDeliveryRevenue || 0)} delay={0.1} />
                <Metric icon={BadgeMinus} label="Deductions" value={formatCurrency(summary?.TotalDeductions || 0)} delay={0.16} />
                <Metric icon={FileText} label="Disbursed" value={formatCurrency(summary?.TotalDisbursed || 0)} delay={0.22} />
            </div>

            <GlassCard hover={false} scrollReveal delay={0.08} style={{ marginBottom: 14 }}>
                <h3 style={sectionTitleStyle}>Monthly Financial Trend</h3>
                <div style={{ height: 290 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={trends.slice(-12)}>
                            <defs>
                                <linearGradient id="delivGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--secondary)" stopOpacity={0.35} />
                                    <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.35} />
                                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis dataKey="MonthDisplay" axisLine={false} tickLine={false} />
                            <YAxis axisLine={false} tickLine={false} />
                            <Tooltip />
                            <Legend />
                            <Area type="monotone" dataKey="TotalDeliveries" stroke="var(--secondary)" fill="url(#delivGrad)" name="Deliveries" />
                            <Area type="monotone" dataKey="TotalNetPayments" stroke="var(--primary)" fill="url(#netGrad)" name="Net Payments" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </GlassCard>

            <GlassCard hover={false} scrollReveal delay={0.16}>
                <h3 style={sectionTitleStyle}>Latest Monthly Statements</h3>
                <div style={{ overflowX: 'auto', maxHeight: 350 }}>
                    <table style={tableStyle}>
                        <thead>
                            <tr>
                                <th style={thStyle}>Farmer</th>
                                <th style={thStyle}>Month</th>
                                <th style={thStyle}>Deliveries</th>
                                <th style={thStyle}>Deductions</th>
                                <th style={thStyle}>Net Payment</th>
                                <th style={thStyle}>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentStatements.map((row, idx) => (
                                <tr key={`${row.FarmerId}-${row.MonthDisplay}-${idx}`}>
                                    <td style={tdStyle}>{row.FarmerName}</td>
                                    <td style={tdStyle}>{row.MonthDisplay}</td>
                                    <td style={tdStyle}>{formatCurrency(row.DeliveryAmount || 0)}</td>
                                    <td style={{ ...tdStyle, color: 'var(--warning)' }}>{formatCurrency(row.TotalDeductions || 0)}</td>
                                    <td style={{ ...tdStyle, color: (row.NetPayment || 0) >= 0 ? 'var(--secondary)' : 'var(--error)' }}>
                                        {formatCurrency(row.NetPayment || 0)}
                                    </td>
                                    <td style={tdStyle}>{row.PaymentStatus}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </div>
    );
}

function ReportLoading({ label }: { label: string }) {
    return (
        <div style={stateStyle}>
            <div style={spinnerStyle} />
            <p style={{ color: 'var(--text-muted)' }}>{label}</p>
        </div>
    );
}

function ReportError({ message }: { message: string }) {
    return (
        <div style={stateStyle}>
            <p style={{ color: 'var(--error)' }}>{message}</p>
        </div>
    );
}

function Metric({
    icon: Icon,
    label,
    value,
    delay = 0,
}: {
    icon: React.ComponentType<{ size?: number; color?: string }>;
    label: string;
    value: string;
    delay?: number;
}) {
    return (
        <GlassCard hover={false} scrollReveal delay={delay} style={{ padding: '16px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{label}</span>
                <Icon size={16} color="var(--primary)" />
            </div>
            <p style={{ color: 'var(--text-bright)', fontSize: 23, fontWeight: 800 }}>{value}</p>
        </GlassCard>
    );
}

const titleStyle: React.CSSProperties = {
    color: 'var(--text-bright)',
    fontSize: 20,
    fontWeight: 800,
    marginBottom: 4,
};

const subTitleStyle: React.CSSProperties = {
    color: 'var(--text-muted)',
    fontSize: 13,
};

const statsGridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 14,
    marginBottom: 18,
};

const sectionTitleStyle: React.CSSProperties = {
    color: 'var(--text-bright)',
    fontSize: 15,
    fontWeight: 700,
    marginBottom: 12,
};

const tableStyle: React.CSSProperties = {
    width: '100%',
    borderCollapse: 'collapse',
};

const thStyle: React.CSSProperties = {
    textAlign: 'left',
    padding: '10px 12px',
    color: 'var(--text-faint)',
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: 0.5,
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    textTransform: 'uppercase',
};

const tdStyle: React.CSSProperties = {
    padding: '11px 12px',
    color: 'var(--text-normal)',
    fontSize: 13,
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    whiteSpace: 'nowrap',
};

const stateStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '52vh',
    gap: 14,
};

const spinnerStyle: React.CSSProperties = {
    width: 40,
    height: 40,
    borderRadius: '50%',
    border: '3px solid rgba(255,255,255,0.12)',
    borderTopColor: 'var(--primary)',
    animation: 'spin 0.8s linear infinite',
};