import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    Users, Truck, DollarSign, Landmark,
    Activity, ArrowUpRight, ArrowRight
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
    ResponsiveContainer, AreaChart, Area,
    PieChart, Pie, Cell
} from 'recharts';
import { reportsAPI, farmersAPI } from '../api';
import GlassCard from '../components/common/GlassCard';
import StatusBadge from '../components/common/StatusBadge';
import { formatCurrency } from '../utils/formatCurrency';
import type { Farmer } from '../types';

gsap.registerPlugin(ScrollTrigger);

interface SocietySummary {
    TotalFarmers: number;
    TotalDeliveryRevenue: number;
    TotalCommissionPaid: number;
    TotalLoanCollected: number;
    TotalInputsSold: number;
    TotalDeductions: number;
    TotalDisbursed: number;
    AvgMonthlyPayment: number;
}

interface LoanPortfolio {
    TotalLoans: number;
    ActiveLoans: number;
    CompletedLoans: number;
    TotalOutstanding: number;
    TotalInterestEarned: number;
    TotalDisbursed: number;
}

interface MonthlyTrend {
    MonthDisplay: string;
    TxnMonth: string;
    TotalNetPayments: number;
    TotalDeliveries: number;
    FarmersInCredit: number;
    FarmersInDeficit: number;
}

// Custom tooltip for charts
const ChartTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    return (
        <div style={{
            background: 'rgba(13, 17, 23, 0.9)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px',
            padding: '12px 16px',
            boxShadow: '0 12px 32px rgba(0,0,0,0.5)',
        }}>
            <p style={{ color: '#8b949e', fontSize: '11px', marginBottom: '6px' }}>{label}</p>
            {payload.map((item: any, i: number) => (
                <p key={i} style={{ color: item.color, fontSize: '13px', fontWeight: 600 }}>
                    {item.name}: {typeof item.value === 'number' && item.value > 100
                        ? formatCurrency(item.value) : item.value}
                </p>
            ))}
        </div>
    );
};

export default function Dashboard() {
    const pageRef = useRef<HTMLDivElement>(null);
    const [society, setSociety] = useState<SocietySummary | null>(null);
    const [loans, setLoans] = useState<LoanPortfolio | null>(null);
    const [trends, setTrends] = useState<MonthlyTrend[]>([]);
    const [farmers, setFarmers] = useState<Farmer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [s, l, t, f] = await Promise.all([
                reportsAPI.statementSociety(),
                reportsAPI.loansPortfolio(),
                reportsAPI.statementTrends(),
                farmersAPI.getAll(),
            ]);
            setSociety(s as SocietySummary);
            setLoans(l as LoanPortfolio);
            setTrends(t as MonthlyTrend[]);
            setFarmers(f as Farmer[]);
            setLoading(false);
        } catch (err) {
            console.error('Dashboard load failed:', err);
            setLoading(false);
        }
    };

    // Hero text animation after load
    useEffect(() => {
        if (!loading && pageRef.current) {
            gsap.from('.hero-el', {
                y: 40, opacity: 0,
                duration: 0.9,
                stagger: 0.1,
                ease: 'expo.out',
            });
        }
    }, [loading]);

    const barData = trends.map(t => ({
        month: (t.MonthDisplay || '').split(' ')[0]?.substring(0, 3) || t.TxnMonth,
        amount: Math.round(t.TotalNetPayments || 0),
    }));

    const areaData = trends.map(t => ({
        month: (t.MonthDisplay || '').split(' ')[0]?.substring(0, 3) || t.TxnMonth,
        credit: t.FarmersInCredit || 0,
        deficit: t.FarmersInDeficit || 0,
    }));

    const pieData = loans ? [
        { name: 'Active', value: loans.ActiveLoans || 0, color: 'var(--primary)' },
        { name: 'Completed', value: loans.CompletedLoans || 0, color: 'var(--secondary)' },
    ] : [];

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}>
                <div style={{ width: 40, height: 40, border: '3px solid var(--base-300)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <p style={{ color: 'var(--text-muted)' }}>Loading dashboard...</p>
            </div>
        );
    }

    return (
        <div ref={pageRef}>
            {/* ===== HERO ===== */}
            <div className="glass-card" style={{ padding: '32px 36px', marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <p className="hero-el" style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
                        Welcome back to
                    </p>
                    <h1 className="hero-el" style={{ fontSize: 28, fontWeight: 800, color: 'var(--text-bright)', marginBottom: 6 }}>
                        DairySphere Society 🐄
                    </h1>
                    <p className="hero-el" style={{ fontSize: 13, color: 'var(--text-faint)' }}>
                        Your cooperative at a glance — real-time insights
                    </p>
                </div>
                <div className="hero-el" style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    background: 'rgba(139, 124, 246, 0.08)',
                    border: '1px solid rgba(139, 124, 246, 0.15)',
                    borderRadius: 12, padding: '10px 18px',
                }}>
                    <Activity size={16} color="var(--primary)" />
                    <span style={{ color: 'var(--primary)', fontSize: 13, fontWeight: 600 }}>Live</span>
                    <div style={{
                        width: 8, height: 8, borderRadius: '50%',
                        background: 'var(--primary)',
                        animation: 'pulse-glow 2s ease-in-out infinite',
                    }} />
                </div>
            </div>

            {/* ===== STAT CARDS ===== */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
                {[
                    { icon: Users, color: 'var(--primary)', label: 'Total Farmers', value: String(society?.TotalFarmers || 0), trend: 'Active' },
                    { icon: Truck, color: 'var(--secondary)', label: 'Delivery Revenue', value: society ? formatCurrency(society.TotalDeliveryRevenue) : '—', trend: '+12%' },
                    { icon: Landmark, color: 'var(--warning)', label: 'Outstanding Loans', value: loans ? formatCurrency(loans.TotalOutstanding) : '—', trend: `${loans?.ActiveLoans || 0} active` },
                    { icon: DollarSign, color: 'var(--accent)', label: 'Total Disbursed', value: society ? formatCurrency(society.TotalDisbursed) : '—', trend: 'This period' },
                ].map((stat, i) => (
                    <GlassCard key={stat.label} delay={0.1 + i * 0.1}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14 }}>
                            <stat.icon size={20} color={stat.color} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                <ArrowUpRight size={13} color={stat.color} />
                                <span style={{ fontSize: 11, color: stat.color, fontWeight: 600 }}>{stat.trend}</span>
                            </div>
                        </div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-bright)', marginBottom: 4 }}>
                            {stat.value}
                        </div>
                        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{stat.label}</div>
                    </GlassCard>
                ))}
            </div>

            {/* ===== CHARTS ROW ===== */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                {/* Bar Chart */}
                <GlassCard delay={0.5} scrollReveal style={{ flex: 2 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div>
                            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-bright)', marginBottom: 2 }}>
                                Monthly Payments
                            </h3>
                            <p style={{ fontSize: 12, color: 'var(--text-faint)' }}>
                                Net disbursement to farmers
                            </p>
                        </div>
                        <div style={{ display: 'flex', gap: 0, background: 'rgba(255,255,255,0.04)', borderRadius: 8, overflow: 'hidden' }}>
                            <span style={{ padding: '5px 14px', fontSize: 11, fontWeight: 600, color: 'var(--text-bright)', background: 'rgba(139,124,246,0.12)' }}>Chart</span>
                            <span style={{ padding: '5px 14px', fontSize: 11, color: 'var(--text-faint)', cursor: 'pointer' }}>Table</span>
                        </div>
                    </div>
                    <div style={{ height: 240, marginTop: 12 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={barData}>
                                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.03)" />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#8b949e', fontSize: 11 }}
                                    dy={8}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#484f58', fontSize: 10 }}
                                    width={60}
                                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                                />
                                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                                <Bar
                                    dataKey="amount"
                                    name="Payment"
                                    fill="#8b7cf6"
                                    radius={[6, 6, 0, 0]}
                                    maxBarSize={36}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                {/* Pie Chart */}
                <GlassCard delay={0.6} scrollReveal style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-bright)', marginBottom: 2 }}>
                        Loan Portfolio
                    </h3>
                    <p style={{ fontSize: 12, color: 'var(--text-faint)', marginBottom: 4 }}>
                        Active vs Completed
                    </p>
                    <div style={{ height: 180 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%" cy="50%"
                                    innerRadius={50} outerRadius={72}
                                    dataKey="value"
                                    strokeWidth={0}
                                    paddingAngle={4}
                                >
                                    {pieData.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<ChartTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginTop: 8 }}>
                        {pieData.map(item => (
                            <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
                                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.name}: {item.value}</span>
                            </div>
                        ))}
                    </div>
                </GlassCard>
            </div>

            {/* ===== BOTTOM ROW ===== */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                {/* Area Chart */}
                <GlassCard delay={0.2} scrollReveal style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-bright)', marginBottom: 2 }}>
                        Farmer Health
                    </h3>
                    <p style={{ fontSize: 12, color: 'var(--text-faint)' }}>
                        Monthly credit vs deficit
                    </p>
                    <div style={{ height: 200, marginTop: 12 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={areaData}>
                                <defs>
                                    <linearGradient id="gCredit" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#4ade80" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#4ade80" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="gDeficit" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.25} />
                                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.03)" />
                                <XAxis
                                    dataKey="month" axisLine={false} tickLine={false}
                                    tick={{ fill: '#8b949e', fontSize: 11 }} dy={8}
                                />
                                <YAxis axisLine={false} tickLine={false}
                                    tick={{ fill: '#484f58', fontSize: 10 }} width={30}
                                />
                                <Tooltip content={<ChartTooltip />} />
                                <Area type="monotone" dataKey="credit" name="Credit"
                                    stroke="#4ade80" fill="url(#gCredit)" strokeWidth={2} />
                                <Area type="monotone" dataKey="deficit" name="Deficit"
                                    stroke="#ef4444" fill="url(#gDeficit)" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                {/* Recent Farmers */}
                <GlassCard delay={0.3} scrollReveal style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div>
                            <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-bright)', marginBottom: 2 }}>
                                Recent Farmers
                            </h3>
                            <p style={{ fontSize: 12, color: 'var(--text-faint)' }}>Latest members</p>
                        </div>
                        <ArrowRight size={16} color="var(--text-faint)" style={{ cursor: 'pointer' }} />
                    </div>

                    {farmers.slice(0, 5).map((f, i) => (
                        <div key={f.FarmerId} style={{
                            display: 'flex', alignItems: 'center', gap: 12,
                            padding: '10px 0',
                            borderBottom: i < 4 ? '1px solid rgba(255,255,255,0.04)' : 'none',
                        }}>
                            <img
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(f.FarmerName)}&background=8b7cf6&color=fff&size=40&font-size=0.45&bold=true`}
                                alt={f.FarmerName}
                                style={{ width: 36, height: 36, borderRadius: 10, objectFit: 'cover' }}
                            />
                            <div style={{ flex: 1 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-bright)' }}>{f.FarmerName}</div>
                                <div style={{ fontSize: 11, color: 'var(--text-faint)' }}>{f.Location}</div>
                            </div>
                            <StatusBadge status={f.Gender === 'Male' ? 'Active' : 'Completed'} />
                        </div>
                    ))}
                </GlassCard>
            </div>

            {/* ===== QUICK STATS ===== */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                {[
                    { label: 'Avg Monthly Payment', value: society ? formatCurrency(society.AvgMonthlyPayment) : '—' },
                    { label: 'Commission Paid', value: society ? formatCurrency(society.TotalCommissionPaid) : '—' },
                    { label: 'Inputs Sold', value: society ? formatCurrency(society.TotalInputsSold) : '—' },
                    { label: 'Interest Earned', value: loans ? formatCurrency(loans.TotalInterestEarned) : '—' },
                ].map((item, i) => (
                    <GlassCard key={item.label} delay={0.1 + i * 0.08} scrollReveal
                        style={{ textAlign: 'center', padding: '20px' }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-faint)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                            {item.label}
                        </div>
                        <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)' }}>
                            {item.value}
                        </div>
                    </GlassCard>
                ))}
            </div>
        </div>
    );
}