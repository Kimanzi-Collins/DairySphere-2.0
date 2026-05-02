import { useState, useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Users, UserPlus, MapPin, Search } from 'lucide-react';
import type { Farmer } from '../../types';
import { farmersAPI } from '../../api';
import FarmerCard from '../../components/common/FarmerCard';
import StatCard from '../../components/common/StatCard';
import FarmerForm from '../../components/forms/FarmerForm';


gsap.registerPlugin(ScrollTrigger);

export default function FarmersList() {
    const [farmers, setFarmers] = useState<Farmer[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [formOpen, setFormOpen] = useState(false);
    const [editFarmer, setEditFarmer] = useState<Farmer | null>(null);
    const [uploadFarmer, setUploadFarmer] = useState<Farmer | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => { load(); }, []);

    const load = async () => {
        try {
            const data = await farmersAPI.getAll() as Farmer[];
            setFarmers(data);
            setLoading(false);
            setTimeout(() => ScrollTrigger.refresh(), 200);
        } catch { setLoading(false); }
    };

    const handleEditProfilePic = (farmer: Farmer) => {
        setUploadFarmer(farmer);
        fileInputRef.current?.click();
    };

    const handleProfilePicSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file || !uploadFarmer) return;

        try {
            await farmersAPI.uploadProfilePic(uploadFarmer.FarmerId, file);
            await load();
            setTimeout(() => ScrollTrigger.refresh(), 250);
        } catch (err) {
            console.error('Profile pic upload failed', err);
        } finally {
            event.target.value = '';
            setUploadFarmer(null);
        }
    };

    const filtered = farmers.filter(f =>
        f.FarmerName.toLowerCase().includes(search.toLowerCase()) ||
        f.FarmerId.toLowerCase().includes(search.toLowerCase()) ||
        f.Location.toLowerCase().includes(search.toLowerCase())
    );

    const grouped = filtered.reduce((acc, f) => {
        if (!acc[f.Location]) acc[f.Location] = [];
        acc[f.Location].push(f);
        return acc;
    }, {} as Record<string, Farmer[]>);

    const locations = Object.keys(grouped).sort();
    const males = farmers.filter(f => f.Gender === 'Male').length;
    const females = farmers.filter(f => f.Gender === 'Female').length;
    const avgAge = farmers.length
        ? Math.round(farmers.reduce((a, f) => a + f.Age, 0) / farmers.length) : 0;

    if (loading) {
        return (
            <div style={S.loading}>
                <div style={S.spinner} />
                <p style={{ color: 'var(--text-muted)' }}>Loading farmers...</p>
            </div>
        );
    }

    return (
        <div>
            {/* Stats */}
            <div style={S.statsGrid}>
                <StatCard title="Total Farmers" value={farmers.length}
                    subtitle={`${locations.length} locations`}
                    icon={Users} color="#8b7cf6" delay={0} />
                <StatCard title="Male Farmers" value={males}
                    subtitle={`${farmers.length ? ((males / farmers.length) * 100).toFixed(0) : 0}%`}
                    icon={Users} color="#3b82f6" delay={0.1} />
                <StatCard title="Female Farmers" value={females}
                    subtitle={`${farmers.length ? ((females / farmers.length) * 100).toFixed(0) : 0}%`}
                    icon={Users} color="#ec4899" delay={0.2} />
                <StatCard title="Average Age" value={avgAge}
                    subtitle="years old"
                    icon={Users} color="#2dd4bf" delay={0.3} />
            </div>

            {/* Toolbar */}
            <div style={S.toolbar}>
                <div style={S.searchBox} className="glass-card">
                    <Search size={16} color="var(--text-faint)" />
                    <input
                        type="text"
                        placeholder="Search by name, ID, or location..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        style={S.searchInput}
                    />
                </div>
                <button className="btn-primary"
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                    onClick={() => {
                            setEditFarmer(null);
                            setFormOpen(true);
                        }}
                >
                    <UserPlus size={16} />
                    <span>Add Farmer</span>
                </button>
                
            </div>

            {/* Grouped Cards */}
            {locations.map((loc) => (
                <div key={loc} style={S.group}>
                    <div style={S.groupHeader}>
                        <div style={S.groupDot} />
                        <MapPin size={15} color="var(--primary)" />
                        <h2 style={S.groupTitle}>{loc}</h2>
                        <span style={S.groupCount}>
                            {grouped[loc].length} farmer{grouped[loc].length > 1 ? 's' : ''}
                        </span>
                        <div style={S.groupLine} />
                    </div>
                    <div style={S.cardGrid}>
                        {grouped[loc]
                            .sort((a, b) => b.FarmerId.localeCompare(a.FarmerId))
                            .map((farmer, i) => (
                                <FarmerCard
                                    key={farmer.FarmerId}
                                    farmer={farmer}
                                    index={i}
                                    onEditProfilePic={handleEditProfilePic}
                                />
                            ))}
                    </div>
                </div>
            ))}

            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleProfilePicSelected}
            />
            {/* Farmer Form Modal */}
            <FarmerForm
                isOpen={formOpen}
                onClose={() => setFormOpen(false)}
                onSaved={() => {
                    load();
                    setTimeout(() => ScrollTrigger.refresh(), 300);
                }}
                editFarmer={editFarmer}
            />
        </div>
    );
}

const S: Record<string, React.CSSProperties> = {
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '16px',
        marginBottom: '24px',
        alignItems: 'stretch',
    },
    toolbar: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '28px',
    },
    searchBox: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        padding: '10px 18px',
        width: '380px',
        borderRadius: '12px',
    },
    searchInput: {
        border: 'none',
        outline: 'none',
        background: 'transparent',
        fontSize: '13px',
        color: 'var(--text-normal)',
        width: '100%',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
    },
    group: { marginBottom: '32px' },
    groupHeader: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginBottom: '16px',
    },
    groupDot: {
        width: '8px', height: '8px',
        borderRadius: '50%',
        background: 'var(--primary)',
        boxShadow: '0 0 8px rgba(139, 124, 246, 0.4)',
    },
    groupTitle: {
        fontSize: '16px',
        fontWeight: 700,
        color: 'var(--text-bright)',
    },
    groupCount: {
        fontSize: '11px',
        fontWeight: 600,
        color: 'var(--text-faint)',
        background: 'rgba(255,255,255,0.04)',
        padding: '3px 10px',
        borderRadius: '8px',
        border: '1px solid var(--glass-border)',
    },
    groupLine: {
        flex: 1,
        height: '1px',
        background: 'var(--glass-border)',
        marginLeft: '8px',
    },
    cardGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: '18px',
    },
    loading: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '60vh',
        gap: '16px',
    },
    spinner: {
        width: '40px', height: '40px',
        border: '3px solid var(--base-300)',
        borderTopColor: 'var(--primary)',
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
    },
};