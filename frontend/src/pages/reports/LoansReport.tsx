import { useEffect, useState } from 'react';
import { Landmark, Wallet, BadgeDollarSign, CircleDollarSign } from 'lucide-react';
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

interface LoanPortfolio {
    TotalLoans: number;
    ActiveLoans: number;
    TotalDisbursed: number;
    TotalOutstanding: number;
}

interface MonthlyLoan {
    BorrowedMonthDisplay: string;
    TotalPrincipal: number;
    TotalOutstanding: number;
    ActiveLoans: number;
}

interface ActiveLoan {
    LoanId: string;
    FarmerName: string;
    LoanAmount: number;
    TotalRepayable: number;
    OutstandingBalance: number;
    DueDateDisplay: string;
}

export default function LoansReport() {
    const [portfolio, setPortfolio] = useState<LoanPortfolio | null>(null);
    const [monthly, setMonthly] = useState<MonthlyLoan[]>([]);
    const [activeLoans, setActiveLoans] = useState<ActiveLoan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const [portfolioData, monthlyData, activeData] = await Promise.all([
                    reportsAPI.loansPortfolio(),
                    reportsAPI.loansMonthly(),
                    reportsAPI.loansActive(),
                ]);
                setPortfolio(portfolioData as LoanPortfolio);
                setMonthly(monthlyData as MonthlyLoan[]);
                setActiveLoans(activeData as ActiveLoan[]);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load loans report');
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    if (loading) return <ReportLoading label="Loading loans report..." />;
    if (error) return <ReportError message={error} />;

    return (
        <div>
            <div className="glass-card" style={{ padding: '22px 24px', marginBottom: 18 }}>
                <h2 style={titleStyle}>Loans Report</h2>
                <p style={subTitleStyle}>Loan portfolio exposure, active balances, and disbursement trends.</p>
            </div>

            <div style={statsGridStyle}>
                <Metric icon={Landmark} label="Total Loans" value={(portfolio?.TotalLoans || 0).toLocaleString()} delay={0.04} />
                <Metric icon={Wallet} label="Active Loans" value={(portfolio?.ActiveLoans || 0).toLocaleString()} delay={0.1} />
                <Metric icon={BadgeDollarSign} label="Disbursed" value={formatCurrency(portfolio?.TotalDisbursed || 0)} delay={0.16} />
                <Metric icon={CircleDollarSign} label="Outstanding" value={formatCurrency(portfolio?.TotalOutstanding || 0)} delay={0.22} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1.3fr 1fr', gap: 14 }}>
                <GlassCard hover={false} scrollReveal delay={0.08}>
                    <h3 style={sectionTitleStyle}>Monthly Principal vs Outstanding</h3>
                    <div style={{ height: 290 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={monthly.slice(-12)}>
                                <defs>
                                    <linearGradient id="loanPrincipal" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.35} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="loanOutstanding" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.35} />
                                        <stop offset="95%" stopColor="var(--accent)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.05)" />
                                <XAxis dataKey="BorrowedMonthDisplay" axisLine={false} tickLine={false} />
                                <YAxis axisLine={false} tickLine={false} />
                                <Tooltip />
                                <Legend />
                                <Area type="monotone" dataKey="TotalPrincipal" stroke="var(--primary)" fill="url(#loanPrincipal)" name="Principal" />
                                <Area type="monotone" dataKey="TotalOutstanding" stroke="var(--accent)" fill="url(#loanOutstanding)" name="Outstanding" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                <GlassCard hover={false} scrollReveal delay={0.16}>
                    <h3 style={sectionTitleStyle}>Highest Outstanding</h3>
                    <div style={{ maxHeight: 290, overflowY: 'auto' }}>
                        {activeLoans.slice(0, 10).map((loan) => (
                            <div key={loan.LoanId} style={listRowStyle}>
                                <div>
                                    <p style={{ color: 'var(--text-bright)', fontWeight: 700, fontSize: 13 }}>{loan.FarmerName}</p>
                                    <p style={{ color: 'var(--text-muted)', fontSize: 11 }}>Due: {loan.DueDateDisplay}</p>
                                </div>
                                <div style={{ textAlign: 'right' }}>
                                    <p style={{ color: 'var(--warning)', fontWeight: 700, fontSize: 13 }}>
                                        {formatCurrency(loan.OutstandingBalance || 0)}
                                    </p>
                                    <p style={{ color: 'var(--text-faint)', fontSize: 11 }}>
                                        {formatCurrency(loan.LoanAmount || 0)} borrowed
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