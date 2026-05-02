import { useEffect, useMemo, useState } from 'react';
import { Truck, Milk, DollarSign, Users } from 'lucide-react';
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
import { reportsAPI } from '../../api';
import GlassCard from '../../components/common/GlassCard';
import { formatCurrency } from '../../utils/formatCurrency';

interface DeliveryOverview {
    FarmerId: string;
    FarmerName: string;
    FarmerLocation: string;
    TotalDeliveries: number;
    TotalLitres: number;
    TotalRevenue: number;
}

interface MonthlyDelivery {
    DeliveryMonthDisplay: string;
    ActiveFarmers: number;
    TotalDeliveries: number;
    TotalLitres: number;
    TotalRevenue: number;
}

export default function DeliveriesReport() {
    const [overview, setOverview] = useState<DeliveryOverview[]>([]);
    const [monthly, setMonthly] = useState<MonthlyDelivery[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const [overviewData, monthlyData] = await Promise.all([
                    reportsAPI.deliveriesOverview(),
                    reportsAPI.deliveriesMonthly(),
                ]);
                setOverview(overviewData as DeliveryOverview[]);
                setMonthly(monthlyData as MonthlyDelivery[]);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load deliveries report');
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    const stats = useMemo(() => {
        const totalLitres = overview.reduce((acc, row) => acc + (row.TotalLitres || 0), 0);
        const totalRevenue = overview.reduce((acc, row) => acc + (row.TotalRevenue || 0), 0);
        const totalDeliveries = overview.reduce((acc, row) => acc + (row.TotalDeliveries || 0), 0);
        const activeFarmers = new Set(overview.map((row) => row.FarmerId)).size;

        return { totalLitres, totalRevenue, totalDeliveries, activeFarmers };
    }, [overview]);

    if (loading) return <ReportLoading label="Loading deliveries report..." />;
    if (error) return <ReportError message={error} />;

    return (
        <div>
            <div className="glass-card" style={{ padding: '22px 24px', marginBottom: 18 }}>
                <h2 style={titleStyle}>Deliveries Report</h2>
                <p style={subTitleStyle}>Milk volume, revenue trends, and farmer delivery performance.</p>
            </div>

            <div style={statsGridStyle}>
                <Metric icon={Truck} label="Deliveries" value={stats.totalDeliveries.toLocaleString()} delay={0.04} />
                <Metric icon={Milk} label="Total Litres" value={stats.totalLitres.toLocaleString()} delay={0.1} />
                <Metric icon={DollarSign} label="Revenue" value={formatCurrency(stats.totalRevenue)} delay={0.16} />
                <Metric icon={Users} label="Active Farmers" value={stats.activeFarmers.toLocaleString()} delay={0.22} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.35fr 1fr', gap: 14 }}>
                <GlassCard hover={false} scrollReveal delay={0.08}>
                    <h3 style={sectionTitleStyle}>Monthly Delivery Trend</h3>
                    <div style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthly.slice(-12)}>
                                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="DeliveryMonthDisplay" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Legend />
                                <Line type="monotone" dataKey="TotalRevenue" stroke="var(--primary)" strokeWidth={2.2} name="Revenue" dot={false} />
                                <Line type="monotone" dataKey="TotalLitres" stroke="var(--accent)" strokeWidth={2.2} name="Litres" dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                <GlassCard hover={false} scrollReveal delay={0.16}>
                    <h3 style={sectionTitleStyle}>Top Farmers by Revenue</h3>
                    <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                        {overview.slice(0, 10).map((row) => (
                            <div key={row.FarmerId} style={listRowStyle}>
                                <div>
                                    <p style={{ color: 'var(--text-bright)', fontWeight: 700, fontSize: 13 }}>{row.FarmerName}</p>
                                    <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>{row.FarmerLocation}</p>
                                </div>
                                <p style={{ color: 'var(--secondary)', fontWeight: 700, fontSize: 13 }}>
                                    {formatCurrency(row.TotalRevenue || 0)}
                                </p>
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