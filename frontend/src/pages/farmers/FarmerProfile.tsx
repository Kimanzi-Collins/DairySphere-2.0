import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    ArrowLeft, MapPin, Phone, Mail, Calendar,
    Truck, Landmark, ShoppingCart, DollarSign, TrendingUp
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip,
    ResponsiveContainer, CartesianGrid
} from 'recharts';
import { reportsAPI } from '../../api';
import GlassCard from '../../components/common/GlassCard';
import StatusBadge from '../../components/common/StatusBadge';
import { formatCurrency } from '../../utils/formatCurrency';

gsap.registerPlugin(ScrollTrigger);

interface Profile {
    FarmerId: string;
    FarmerName: string;
    FarmerLocation: string;
    FarmerContact: string;
    FarmerEmail: string | null;
    ProfilePicUrl: string | null;
    Age: number;
    Gender: string;
    EnrolmentDate: string;
    ActiveMonths: number;
    LifetimeDeliveries: number;
    LifetimeLitres: number;
    LifetimeDeliveryAmount: number;
    LifetimeCommission: number;
    LifetimeLoanDeductions: number;
    LifetimeInputsPurchased: number;
    LifetimeTotalDeductions: number;
    LifetimeNetEarnings: number;
    AvgMonthlyNetPayment: number;
    BestMonthEarning: number;
    WorstMonthEarning: number;
    MonthsInCredit: number;
    MonthsInDeficit: number;
}

interface Monthly {
    MonthDisplay: string;
    DeliveryAmount: number;
    CommissionDeduction: number;
    LoanDeduction: number;
    InputsDeduction: number;
    TotalDeductions: number;
    NetPayment: number;
    PaymentStatus: string;
    TotalLitres: number;
    DeliveryCount: number;
}

const API_BASE = 'http://localhost:3001';

const ChartTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    return (
        <div style={{
            background: 'var(--base-200)',
            backdropFilter: 'blur(16px)',
            border: '1px solid var(--glass-border)',
            borderRadius: 12, padding: '12px 16px',
        }}>
            <p style={{ color: 'var(--text-muted)', fontSize: 11, marginBottom: 6 }}>{label}</p>
            {payload.map((p: any, i: number) => (
                <p key={i} style={{ color: p.color, fontSize: 13, fontWeight: 600 }}>
                    {p.name}: {formatCurrency(p.value)}
                </p>
            ))}
        </div>
    );
};

export default function FarmerProfile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const pageRef = useRef<HTMLDivElement>(null);
    const [profile, setProfile] = useState<Profile | null>(null);
    const [monthly, setMonthly] = useState<Monthly[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) loadProfile();
    }, [id]);

    const loadProfile = async () => {
        try {
            const data = await reportsAPI.statementProfile(id!) as {
                profile: Profile;
                monthlyStatements: Monthly[];
            };
            setProfile(data.profile);
            setMonthly(data.monthlyStatements);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!loading && pageRef.current) {
            gsap.from('.p-section', {
                y: 50, opacity: 0,
                duration: 0.7, stagger: 0.1,
                ease: 'expo.out',
            });
        }
    }, [loading]);

    if (loading) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}>
                <div style={{ width: 40, height: 40, border: '3px solid var(--base-300)', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <p style={{ color: 'var(--text-muted)' }}>Loading profile...</p>
            </div>
        );
    }

    if (!profile) {
        return <p style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: 60 }}>Farmer not found or has no transactions</p>;
    }

    const pic = profile.ProfilePicUrl
        ? `${API_BASE}${profile.ProfilePicUrl}`
        : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.FarmerName)}&background=8b7cf6&color=fff&size=200&font-size=0.4&bold=true`;

    const chartData = monthly.map(m => ({
        month: (m.MonthDisplay || '').split(' ')[0]?.substring(0, 3),
        earnings: m.DeliveryAmount,
        deductions: m.TotalDeductions,
        net: m.NetPayment,
    }));

    return (
        <div ref={pageRef}>
            {/* Back */}
            <div className="p-section"
                onClick={() => navigate('/farmers')}
                style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    cursor: 'pointer', marginBottom: 20,
                    color: 'var(--text-muted)', fontSize: 14, fontWeight: 500,
                    transition: 'color 0.2s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
            >
                <ArrowLeft size={18} /> Back to Farmers
            </div>

            {/* ===== PROMINENT PROFILE HEADER ===== */}
            <div className="p-section" style={S.profileHeader}>
                {/* Background gradient accent */}
                <div style={S.headerBgAccent} />

                {/* Profile pic + Name row */}
                <div style={S.profileTop}>
                    <div style={S.avatarWrap}>
                        <img src={pic} alt={profile.FarmerName} style={S.avatar} />
                        <div style={{
                            ...S.onlineDot,
                            background: profile.LifetimeNetEarnings >= 0 ? 'var(--secondary)' : 'var(--error)',
                        }} />
                    </div>

                    <div style={S.profileInfo}>
                        <div style={S.profileIdRow}>
                            <span style={S.profileId}>{profile.FarmerId}</span>
                            <StatusBadge status={profile.Gender} />
                            <StatusBadge status={`Age ${profile.Age}`} />
                        </div>
                        <h1 style={S.profileName}>{profile.FarmerName}</h1>
                        <div style={S.profileMeta}>
                            <span style={S.metaItem}>
                                <MapPin size={14} color="var(--primary)" /> {profile.FarmerLocation}
                            </span>
                            <span style={S.metaItem}>
                                <Phone size={14} color="var(--primary)" /> {profile.FarmerContact}
                            </span>
                            <span style={S.metaItem}>
                                <Mail size={14} color="var(--primary)" /> {profile.FarmerEmail || 'N/A'}
                            </span>
                            <span style={S.metaItem}>
                                <Calendar size={14} color="var(--primary)" /> Member since {profile.EnrolmentDate}
                            </span>
                        </div>
                    </div>

                    {/* Lifetime Earnings Badge */}
                    <div style={S.earningsBox}>
                        <div style={S.earningsLabel}>LIFETIME EARNINGS</div>
                        <div style={{
                            ...S.earningsValue,
                            color: profile.LifetimeNetEarnings >= 0 ? 'var(--secondary)' : 'var(--error)',
                        }}>
                            {formatCurrency(profile.LifetimeNetEarnings)}
                        </div>
                        <div style={S.earningsSub}>
                            {profile.ActiveMonths} months active • {profile.LifetimeDeliveries} deliveries
                        </div>
                    </div>
                </div>
            </div>

            {/* ===== STAT CARDS ===== */}
            <div className="p-section" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20 }}>
                {[
                    { icon: Truck, color: '#8b7cf6', label: 'Delivery Revenue', value: formatCurrency(profile.LifetimeDeliveryAmount) },
                    { icon: DollarSign, color: '#ef4444', label: 'Commission Paid', value: formatCurrency(profile.LifetimeCommission) },
                    { icon: Landmark, color: '#eab308', label: 'Loan Deductions', value: formatCurrency(profile.LifetimeLoanDeductions) },
                    { icon: ShoppingCart, color: '#2dd4bf', label: 'Inputs Purchased', value: formatCurrency(profile.LifetimeInputsPurchased) },
                ].map((s, i) => (
                    <GlassCard key={s.label} delay={0.1 + i * 0.08} scrollReveal>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                            <s.icon size={18} color={s.color} />
                            <span style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5, fontWeight: 700 }}>{s.label}</span>
                        </div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-bright)' }}>{s.value}</div>
                    </GlassCard>
                ))}
            </div>

            {/* ===== CHARTS ===== */}
            <div className="p-section" style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                {/* Bar Chart */}
                <GlassCard scrollReveal delay={0.2} style={{ flex: 2 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-bright)', marginBottom: 2 }}>Monthly Breakdown</h3>
                    <p style={{ fontSize: 12, color: 'var(--text-faint)', marginBottom: 16 }}>Earnings vs deductions over time</p>
                    <div style={{ height: 250 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid vertical={false} stroke="var(--glass-border)" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false}
                                    tick={{ fill: 'var(--text-muted)', fontSize: 11 }} dy={8} />
                                <YAxis axisLine={false} tickLine={false}
                                    tick={{ fill: 'var(--text-faint)', fontSize: 10 }} width={55}
                                    tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                                <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(16, 32, 51, 0.04)' }} />
                                <Bar dataKey="earnings" name="Earnings" fill="#8b7cf6" radius={[4, 4, 0, 0]} maxBarSize={28} />
                                <Bar dataKey="deductions" name="Deductions" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={28} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                {/* Performance */}
                <GlassCard scrollReveal delay={0.3} style={{ flex: 1 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-bright)', marginBottom: 2 }}>Performance</h3>
                    <p style={{ fontSize: 12, color: 'var(--text-faint)', marginBottom: 16 }}>Key indicators</p>
                    {[
                        { label: 'Best Month', value: formatCurrency(profile.BestMonthEarning), color: 'var(--secondary)' },
                        { label: 'Worst Month', value: formatCurrency(profile.WorstMonthEarning), color: 'var(--error)' },
                        { label: 'Avg Monthly', value: formatCurrency(profile.AvgMonthlyNetPayment), color: 'var(--primary)' },
                        { label: 'Months in Credit', value: String(profile.MonthsInCredit), color: 'var(--secondary)' },
                        { label: 'Months in Deficit', value: String(profile.MonthsInDeficit), color: 'var(--error)' },
                        { label: 'Total Litres', value: `${profile.LifetimeLitres?.toLocaleString() || 0} L`, color: 'var(--accent)' },
                    ].map(item => (
                        <div key={item.label} style={{
                            display: 'flex', justifyContent: 'space-between',
                            padding: '10px 0',
                            borderBottom: '1px solid var(--glass-border)',
                        }}>
                            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.label}</span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: item.color }}>{item.value}</span>
                        </div>
                    ))}
                </GlassCard>
            </div>

            {/* ===== MONTHLY STATEMENT TABLE ===== */}
            <GlassCard scrollReveal delay={0.3} className="p-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <div>
                        <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-bright)', marginBottom: 2 }}>Monthly Statements</h3>
                        <p style={{ fontSize: 12, color: 'var(--text-faint)' }}>Complete financial breakdown</p>
                    </div>
                    <TrendingUp size={18} color="var(--primary)" />
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr>
                                {['Month', 'Deliveries', 'Commission', 'Loan', 'Inputs', 'Deductions', 'Net Payment', 'Status'].map(h => (
                                    <th key={h} style={{
                                        textAlign: 'left', padding: '10px 12px',
                                        fontSize: 10, fontWeight: 700, color: 'var(--text-faint)',
                                        textTransform: 'uppercase', letterSpacing: 1,
                                        borderBottom: '1px solid var(--glass-border)',
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {monthly.map((m, i) => (
                                <tr key={i}
                                    style={{ borderBottom: '1px solid var(--glass-border)', transition: 'background 0.2s' }}
                                    onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(16, 32, 51, 0.04)')}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <td style={td}><span style={{ fontWeight: 600 }}>{m.MonthDisplay}</span></td>
                                    <td style={{ ...td, color: 'var(--secondary)' }}>{formatCurrency(m.DeliveryAmount)}</td>
                                    <td style={{ ...td, color: '#ef4444' }}>{formatCurrency(m.CommissionDeduction)}</td>
                                    <td style={{ ...td, color: '#eab308' }}>{formatCurrency(m.LoanDeduction)}</td>
                                    <td style={{ ...td, color: 'var(--accent)' }}>{formatCurrency(m.InputsDeduction)}</td>
                                    <td style={{ ...td, color: '#ef4444' }}>{formatCurrency(m.TotalDeductions)}</td>
                                    <td style={{
                                        ...td, fontWeight: 700,
                                        color: m.NetPayment >= 0 ? 'var(--secondary)' : '#ef4444',
                                    }}>{formatCurrency(m.NetPayment)}</td>
                                    <td style={td}><StatusBadge status={m.PaymentStatus} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </GlassCard>
        </div>
    );
}

const td: React.CSSProperties = {
    padding: '12px',
    fontSize: '13px',
    color: 'var(--text-normal)',
};

const S: Record<string, React.CSSProperties> = {
    profileHeader: {
        background: 'var(--glass-bg-card)',
        backdropFilter: 'blur(16px) saturate(160%)',
        border: '1px solid var(--glass-border)',
        borderRadius: '16px',
        padding: '32px',
        marginBottom: 20,
        position: 'relative',
        overflow: 'hidden',
    },
    headerBgAccent: {
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '4px',
        background: 'linear-gradient(90deg, var(--primary), var(--accent), var(--secondary))',
    },
    profileTop: {
        display: 'flex',
        alignItems: 'center',
        gap: '28px',
    },
    avatarWrap: {
        position: 'relative',
        flexShrink: 0,
    },
    avatar: {
        width: '110px', height: '110px',
        borderRadius: '50%',
        objectFit: 'cover',
        border: '3px solid rgba(139, 124, 246, 0.25)',
        boxShadow: '0 8px 24px rgba(139, 124, 246, 0.15)',
    },
    onlineDot: {
        position: 'absolute',
        bottom: '6px', right: '6px',
        width: '16px', height: '16px',
        borderRadius: '50%',
        border: '3px solid var(--base-200)',
    },
    profileInfo: {
        flex: 1,
    },
    profileIdRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        marginBottom: '6px',
    },
    profileId: {
        fontSize: '12px',
        fontWeight: 700,
        color: 'var(--primary)',
        background: 'rgba(139, 124, 246, 0.1)',
        border: '1px solid rgba(139, 124, 246, 0.2)',
        padding: '3px 10px',
        borderRadius: '6px',
    },
    profileName: {
        fontSize: '26px',
        fontWeight: 800,
        color: 'var(--text-bright)',
        marginBottom: '10px',
        letterSpacing: '-0.3px',
    },
    profileMeta: {
        display: 'flex',
        gap: '20px',
        flexWrap: 'wrap',
    },
    metaItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        fontSize: '13px',
        color: 'var(--text-muted)',
    },
    earningsBox: {
        textAlign: 'right',
        flexShrink: 0,
        background: 'var(--base-200)',
        border: '1px solid var(--glass-border)',
        borderRadius: '14px',
        padding: '20px 24px',
    },
    earningsLabel: {
        fontSize: '10px',
        fontWeight: 700,
        color: 'var(--text-faint)',
        letterSpacing: '1.5px',
        marginBottom: '8px',
    },
    earningsValue: {
        fontSize: '30px',
        fontWeight: 800,
        lineHeight: 1.1,
        marginBottom: '6px',
    },
    earningsSub: {
        fontSize: '11px',
        color: 'var(--text-faint)',
    },
};