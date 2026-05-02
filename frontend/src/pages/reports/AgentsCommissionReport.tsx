import { useEffect, useMemo, useState } from 'react';
import { BarChart3, HandCoins, Users, ArrowLeftRight } from 'lucide-react';
import {
    ResponsiveContainer,
    BarChart,
    Bar,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
} from 'recharts';
import { reportsAPI } from '../../api';
import GlassCard from '../../components/common/GlassCard';
import { formatCurrency } from '../../utils/formatCurrency';

interface AgentSummary {
    AgentId: string;
    AgentName: string;
    AgentLocation: string;
    TotalTransactions: number;
    TotalSales: number;
    TotalCommission: number;
}

interface AgentTrend {
    SaleMonthDisplay: string;
    TotalSales: number;
    TotalCommission: number;
}

interface MonthlyPoint {
    month: string;
    sales: number;
    commission: number;
}

export default function AgentsCommissionReport() {
    const [summary, setSummary] = useState<AgentSummary[]>([]);
    const [trends, setTrends] = useState<AgentTrend[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const [summaryData, trendsData] = await Promise.all([
                    reportsAPI.agentsCommissionSummary(),
                    reportsAPI.agentsTrends(),
                ]);
                setSummary(summaryData as AgentSummary[]);
                setTrends(trendsData as AgentTrend[]);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load agents commission report');
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    const stats = useMemo(() => {
        const totalSales = summary.reduce((acc, item) => acc + (item.TotalSales || 0), 0);
        const totalCommission = summary.reduce((acc, item) => acc + (item.TotalCommission || 0), 0);
        const totalTransactions = summary.reduce((acc, item) => acc + (item.TotalTransactions || 0), 0);
        return {
            totalAgents: summary.length,
            totalSales,
            totalCommission,
            totalTransactions,
        };
    }, [summary]);

    const monthlyData = useMemo(() => {
        const grouped = new Map<string, MonthlyPoint>();
        trends.forEach((item) => {
            const key = item.SaleMonthDisplay;
            const current = grouped.get(key) || { month: key, sales: 0, commission: 0 };
            current.sales += item.TotalSales || 0;
            current.commission += item.TotalCommission || 0;
            grouped.set(key, current);
        });
        return Array.from(grouped.values()).slice(-12);
    }, [trends]);

    if (loading) return <ReportLoading label="Loading agents commission report..." />;
    if (error) return <ReportError message={error} />;

    return (
        <div>
            <div className="glass-card" style={{ padding: '22px 24px', marginBottom: 18 }}>
                <h2 style={titleStyle}>Agents Commission Report</h2>
                <p style={subTitleStyle}>Agent sales, commissions, and monthly performance trends.</p>
            </div>

            <div style={statsGridStyle}>
                <Metric label="Agents" value={stats.totalAgents.toLocaleString()} icon={Users} delay={0.04} />
                <Metric label="Transactions" value={stats.totalTransactions.toLocaleString()} icon={ArrowLeftRight} delay={0.1} />
                <Metric label="Total Sales" value={formatCurrency(stats.totalSales)} icon={BarChart3} delay={0.16} />
                <Metric label="Commission" value={formatCurrency(stats.totalCommission)} icon={HandCoins} delay={0.22} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: 14 }}>
                <GlassCard hover={false} scrollReveal delay={0.08}>
                    <h3 style={sectionTitleStyle}>Monthly Sales vs Commission</h3>
                    <div style={{ height: 300 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData}>
                                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `${Math.round(Number(value) / 1000)}k`} />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="sales" fill="var(--primary)" radius={[5, 5, 0, 0]} name="Sales" />
                                <Bar dataKey="commission" fill="var(--accent)" radius={[5, 5, 0, 0]} name="Commission" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                <GlassCard hover={false} scrollReveal delay={0.16}>
                    <h3 style={sectionTitleStyle}>Top Agents</h3>
                    <div style={{ maxHeight: 300, overflowY: 'auto' }}>
                        {summary.slice(0, 10).map((agent) => (
                            <div key={agent.AgentId} style={listRowStyle}>
                                <div>
                                    <p style={{ color: 'var(--text-bright)', fontSize: 13, fontWeight: 700 }}>{agent.AgentName}</p>
                                    <p style={{ color: 'var(--text-muted)', fontSize: 12 }}>{agent.AgentLocation}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ color: 'var(--secondary)', fontSize: 13, fontWeight: 700 }}>
                                        {formatCurrency(agent.TotalSales || 0)}
                                    </p>
                                    <p style={{ color: 'var(--text-faint)', fontSize: 11 }}>
                                        {agent.TotalTransactions} txns
                                    </p>
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