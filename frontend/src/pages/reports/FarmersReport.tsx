import { useEffect, useMemo, useState } from 'react';
import { MapPin, Users, UserRound, CalendarRange } from 'lucide-react';
import GlassCard from '../../components/common/GlassCard';

import { reportsAPI } from '../../api';

interface FarmerListRow {
    FarmerId: string;
    FarmerName: string;
    Age: number;
    Gender: string;
    Contact: string;
    Location: string;
    EnrolmentDate: string;
}

interface FarmerLocationSummary {
    Location: string;
    TotalFarmers: number;
    AvgAge: number;
    Males: number;
    Females: number;
}

export default function FarmersReport() {
    const [rows, setRows] = useState<FarmerListRow[]>([]);
    const [summary, setSummary] = useState<FarmerLocationSummary[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const [listData, summaryData] = await Promise.all([
                    reportsAPI.farmersList(),
                    reportsAPI.farmersListSummary(),
                ]);
                setRows(listData as FarmerListRow[]);
                setSummary(summaryData as FarmerLocationSummary[]);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load farmers report');
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    const stats = useMemo(() => {
        const totalFarmers = rows.length;
        const totalLocations = summary.length;
        const males = summary.reduce((acc, item) => acc + (item.Males || 0), 0);
        const females = summary.reduce((acc, item) => acc + (item.Females || 0), 0);
        const weightedAgeTotal = summary.reduce((acc, item) => acc + (item.AvgAge || 0) * (item.TotalFarmers || 0), 0);
        const avgAge = totalFarmers > 0 ? weightedAgeTotal / totalFarmers : 0;

        return {
            totalFarmers,
            totalLocations,
            genderSplit: `${males}/${females}`,
            avgAge,
        };
    }, [rows, summary]);

    if (loading) {
        return <LoadingState label="Loading farmers report..." />;
    }

    if (error) {
        return <ErrorState message={error} />;
    }

    return (
        <div>
            <div className="glass-card" style={{ padding: '22px 24px', marginBottom: 18 }}>
                <h2 style={{ color: 'var(--text-bright)', fontSize: 20, fontWeight: 800, marginBottom: 4 }}>
                    Farmers Report
                </h2>
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>
                    Registered farmers grouped by location with demographic summary.
                </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 18 }}>
                <MetricCard icon={Users} label="Total Farmers" value={stats.totalFarmers.toLocaleString()} delay={0.04} />
                <MetricCard icon={MapPin} label="Locations" value={stats.totalLocations.toLocaleString()} delay={0.1} />
                <MetricCard icon={UserRound} label="Male/Female" value={stats.genderSplit} delay={0.16} />
                <MetricCard icon={CalendarRange} label="Average Age" value={stats.avgAge.toFixed(1)} delay={0.22} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 14 }}>
                <GlassCard hover={false} scrollReveal delay={0.08}>
                    <h3 style={sectionTitle}>Location Summary</h3>
                    <TableWrap>
                        <table style={tableStyle}>
                            <thead>
                                <tr>
                                    <th style={thStyle}>Location</th>
                                    <th style={thStyle}>Farmers</th>
                                    <th style={thStyle}>Avg Age</th>
                                </tr>
                            </thead>
                            <tbody>
                                {summary.map((item) => (
                                    <tr key={item.Location}>
                                        <td style={tdStyle}>{item.Location}</td>
                                        <td style={tdStyle}>{item.TotalFarmers}</td>
                                        <td style={tdStyle}>{Number(item.AvgAge || 0).toFixed(1)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </TableWrap>
                </GlassCard>

                <GlassCard hover={false} scrollReveal delay={0.16}>
                    <h3 style={sectionTitle}>Farmers List</h3>
                    <TableWrap>
                        <table style={tableStyle}>
                            <thead>
                                <tr>
                                    <th style={thStyle}>ID</th>
                                    <th style={thStyle}>Name</th>
                                    <th style={thStyle}>Gender</th>
                                    <th style={thStyle}>Age</th>
                                    <th style={thStyle}>Location</th>
                                    <th style={thStyle}>Contact</th>
                                    <th style={thStyle}>Enrolment</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.map((item) => (
                                    <tr key={item.FarmerId}>
                                        <td style={tdStyle}>{item.FarmerId}</td>
                                        <td style={tdStyle}>{item.FarmerName}</td>
                                        <td style={tdStyle}>{item.Gender}</td>
                                        <td style={tdStyle}>{item.Age}</td>
                                        <td style={tdStyle}>{item.Location}</td>
                                        <td style={tdStyle}>{item.Contact}</td>
                                        <td style={tdStyle}>{item.EnrolmentDate}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </TableWrap>
                </GlassCard>
            </div>
        </div>
    );
}

function LoadingState({ label }: { label: string }) {
    return (
        <div style={stateWrap}>
            <div style={spinner} />
            <p style={{ color: 'var(--text-muted)' }}>{label}</p>
        </div>
    );
}

function ErrorState({ message }: { message: string }) {
    return (
        <div style={stateWrap}>
            <p style={{ color: 'var(--error)' }}>{message}</p>
        </div>
    );
}

function MetricCard({
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ color: 'var(--text-muted)', fontSize: 12 }}>{label}</span>
                <Icon size={16} color="var(--primary)" />
            </div>
            <div style={{ color: 'var(--text-bright)', fontSize: 24, fontWeight: 800 }}>{value}</div>
        </GlassCard>
    );
}

function TableWrap({ children }: { children: React.ReactNode }) {
    return <div style={{ overflowX: 'auto', maxHeight: 440 }}>{children}</div>;
}

const stateWrap: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    minHeight: '52vh',
};

const spinner: React.CSSProperties = {
    width: 40,
    height: 40,
    borderRadius: '50%',
    border: '3px solid rgba(255,255,255,0.12)',
    borderTopColor: 'var(--primary)',
    animation: 'spin 0.8s linear infinite',
};

const sectionTitle: React.CSSProperties = {
    color: 'var(--text-bright)',
    fontSize: 15,
    fontWeight: 700,
    marginBottom: 14,
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
    whiteSpace: 'nowrap',
};

const tdStyle: React.CSSProperties = {
    padding: '11px 12px',
    color: 'var(--text-normal)',
    fontSize: 13,
    borderBottom: '1px solid rgba(255,255,255,0.04)',
    whiteSpace: 'nowrap',
};