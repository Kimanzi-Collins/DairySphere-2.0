import { useEffect, useState } from 'react';
import { ShoppingCart, Users, Boxes, CircleDollarSign } from 'lucide-react';
import {
    ResponsiveContainer,
    LineChart,
    Line,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
} from 'recharts';
import GlassCard from '../../components/common/GlassCard';
import { reportsAPI } from '../../api';
import { formatCurrency } from '../../utils/formatCurrency';

interface PurchasesPortfolio {
    TotalTransactions: number;
    TotalBuyers: number;
    UniqueInputs: number;
    TotalRevenue: number;
}

interface MonthlyPurchase {
    PurchaseMonthDisplay: string;
    TotalTransactions: number;
    TotalSpent: number;
}

interface PopularInput {
    InputId: string;
    InputName: string;
    TimesPurchased: number;
    TotalRevenue: number;
    UniqueBuyers: number;
}

export default function PurchasesReport() {
    const [portfolio, setPortfolio] = useState<PurchasesPortfolio | null>(null);
    const [monthly, setMonthly] = useState<MonthlyPurchase[]>([]);
    const [popular, setPopular] = useState<PopularInput[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const [portfolioData, monthlyData, popularData] = await Promise.all([
                    reportsAPI.purchasesPortfolio(),
                    reportsAPI.purchasesMonthly(),
                    reportsAPI.purchasesPopular(),
                ]);
                setPortfolio(portfolioData as PurchasesPortfolio);
                setMonthly(monthlyData as MonthlyPurchase[]);
                setPopular(popularData as PopularInput[]);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load purchases report');
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    if (loading) return <ReportLoading label="Loading purchases report..." />;
    if (error) return <ReportError message={error} />;

    return (
        <div>
            <div className="glass-card" style={{ padding: '22px 24px', marginBottom: 18 }}>
                <h2 style={titleStyle}>Purchases Report</h2>
                <p style={subTitleStyle}>Input sales performance, monthly spend, and top-selling products.</p>
            </div>

            <div style={statsGridStyle}>
                <Metric icon={ShoppingCart} label="Transactions" value={(portfolio?.TotalTransactions || 0).toLocaleString()} delay={0.04} />
                <Metric icon={Users} label="Buyers" value={(portfolio?.TotalBuyers || 0).toLocaleString()} delay={0.1} />
                <Metric icon={Boxes} label="Unique Inputs" value={(portfolio?.UniqueInputs || 0).toLocaleString()} delay={0.16} />
                <Metric icon={CircleDollarSign} label="Revenue" value={formatCurrency(portfolio?.TotalRevenue || 0)} delay={0.22} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 14 }}>
                <GlassCard hover={false} scrollReveal delay={0.08}>
                    <h3 style={sectionTitleStyle}>Monthly Purchases</h3>
                    <div style={{ height: 290 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthly.slice(-12)}>
                                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="PurchaseMonthDisplay" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="TotalSpent" stroke="var(--primary)" strokeWidth={2.2} name="Spent" dot={false} />
                                <Line type="monotone" dataKey="TotalTransactions" stroke="var(--accent)" strokeWidth={2.2} name="Transactions" dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                <GlassCard hover={false} scrollReveal delay={0.16}>
                    <h3 style={sectionTitleStyle}>Popular Inputs</h3>
                    <div style={{ maxHeight: 290, overflowY: 'auto' }}>
                        {popular.slice(0, 10).map((item) => (
                            <div key={item.InputId} style={listRowStyle}>
                                <div>
                                    <p style={{ color: 'var(--text-bright)', fontWeight: 700, fontSize: 13 }}>{item.InputName}</p>
                                    <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>{item.UniqueBuyers} buyers</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ color: 'var(--secondary)', fontWeight: 700, fontSize: 13 }}>
                                        {formatCurrency(item.TotalRevenue || 0)}
                                    </p>
                                    <p style={{ color: 'var(--text-faint)', fontSize: 11 }}>{item.TimesPurchased} purchases</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>
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

const listRowStyle: React.CSSProperties = {
    padding: '12px 2px',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 14,
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