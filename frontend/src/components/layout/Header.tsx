import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { Bell, Search, Sparkles, Sun, Moon, LogOut, ShieldCheck } from 'lucide-react';
import { authAPI } from '../../api';

const titles: Record<string, string> = {
    '/': 'Dashboard',
    '/farmers': 'Farmers Management',
    '/agents': 'Agents',
    '/factories': 'Factories',
    '/inputs': 'Inputs',
    '/milk-quality': 'Milk Quality',
    '/loans': 'Loans',
    '/deliveries': 'Deliveries',
    '/purchases': 'Purchases',
    '/sales': 'Sales',
    '/reports/farmers-list': 'Farmers Report',
    '/reports/agents-commission': 'Agents Commission Report',
    '/reports/deliveries': 'Deliveries Report',
    '/reports/loans': 'Loans Report',
    '/reports/purchases': 'Purchases Report',
    '/reports/statements': 'Statements Report',
};

export default function Header() {
    const ref = useRef<HTMLDivElement>(null);
    const titleRef = useRef<HTMLHeadingElement>(null);
    const location = useLocation();
    const navigate = useNavigate();
    const title = titles[location.pathname] || 'DairySphere';
    const [theme, setTheme] = useState<'dark' | 'light'>(() => {
        const stored = localStorage.getItem('dairyweb_theme');
        return stored === 'light' ? 'light' : 'dark';
    });
    const [user, setUser] = useState<{ username?: string; email?: string; role?: string } | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('dairysphere_token');
        if (!token) {
            setUser(null);
            return;
        }

        let mounted = true;
        authAPI.me()
            .then((response) => {
                if (!mounted) return;
                const payload = response as any;
                const data = payload.data || payload;
                setUser(data ? {
                    username: data.Username || data.username,
                    email: data.Email || data.email,
                    role: data.Role || data.role,
                } : null);
            })
            .catch(() => {
                localStorage.removeItem('dairysphere_token');
                localStorage.removeItem('dairysphere_user');
                if (mounted) setUser(null);
            });

        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('dairyweb_theme', theme);
    }, [theme]);

    const handleSignOut = () => {
        localStorage.removeItem('dairysphere_token');
        localStorage.removeItem('dairysphere_user');
        setUser(null);
        navigate('/signin');
    };

    useLayoutEffect(() => {
        if (!titleRef.current) return;
        const tween = gsap.fromTo(titleRef.current,
            { y: 10, autoAlpha: 0.001 },
            { y: 0, autoAlpha: 1, duration: 0.45, ease: 'power3.out', clearProps: 'opacity,visibility,transform' }
        );
        return () => {
            tween.kill();
        };
    }, [location.pathname]);

    useLayoutEffect(() => {
        if (!ref.current) return;
        gsap.killTweensOf(ref.current);
        gsap.set(ref.current, { autoAlpha: 1, y: 0 });
        const tween = gsap.fromTo(ref.current, {
            y: -10,
            autoAlpha: 0.001,
        }, {
            y: 0,
            autoAlpha: 1,
            duration: 0.5,
            ease: 'power2.out',
            clearProps: 'opacity,visibility,transform',
        });
        return () => {
            tween.kill();
        };
    }, []);

    return (
        <div ref={ref} style={styles.header}>
            <div>
                <h1 ref={titleRef} style={styles.title}>{title}</h1>
                <p style={styles.date}>
                    {new Date().toLocaleDateString('en-KE', {
                        weekday: 'long', year: 'numeric',
                        month: 'long', day: 'numeric'
                    })}
                </p>
            </div>

            <div style={styles.actions}>
                <div style={styles.search}>
                    <Search size={15} color="var(--text-faint)" />
                    <input placeholder="Search..." style={styles.searchInput} />
                </div>

                <div style={styles.iconBtn}>
                    <Bell size={17} color="var(--text-muted)" />
                    <div style={styles.badge}>3</div>
                </div>
                <button
                    type="button"
                    style={styles.iconBtn}
                    onClick={() => setTheme((prev) => prev === 'dark' ? 'light' : 'dark')}
                    title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
                >
                    {theme === 'dark'
                        ? <Sun size={17} color="var(--warning)" />
                        : <Moon size={17} color="var(--primary)" />}
                </button>
                <div style={styles.iconBtn}>
                    <Sparkles size={17} color="var(--primary)" />
                </div>

                <div style={styles.profileCard}>
                    <div style={styles.profileAvatar}>
                        {(user?.username || 'Guest').slice(0, 2).toUpperCase()}
                    </div>
                    <div style={{ minWidth: 0 }}>
                        <div style={styles.profileName}>{user?.username || 'Guest user'}</div>
                        <div style={styles.profileMetaRow}>
                            <ShieldCheck size={11} color="var(--secondary)" />
                            <span style={styles.profileRole}>{user?.role || 'Signed out'}</span>
                        </div>
                    </div>
                    <button type="button" onClick={handleSignOut} style={styles.signOutBtn} title="Sign out">
                        <LogOut size={14} />
                    </button>
                </div>
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    header: {
        height: 'var(--header-height)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        position: 'sticky',
        top: 0,
        zIndex: 220,
        borderRadius: 0,
        background: 'var(--glass-bg-card)',
        borderBottom: '1px solid var(--glass-border)',
        backdropFilter: 'blur(12px) saturate(150%)',
        WebkitBackdropFilter: 'blur(12px) saturate(150%)',
    },
    title: {
        fontSize: '19px',
        fontWeight: 700,
        color: 'var(--text-bright)',
        letterSpacing: '-0.3px',
    },
    date: {
        fontSize: '11px',
        color: 'var(--text-faint)',
        marginTop: '2px',
    },
    actions: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    search: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        background: 'var(--base-200)',
        border: '1px solid var(--glass-border)',
        borderRadius: '10px',
        padding: '7px 14px',
    },
    searchInput: {
        border: 'none',
        outline: 'none',
        background: 'transparent',
        fontSize: '13px',
        color: 'var(--text-normal)',
        width: '160px',
        fontFamily: 'Plus Jakarta Sans, sans-serif',
    },
    iconBtn: {
        width: '36px', height: '36px',
        borderRadius: '10px',
        background: 'var(--base-200)',
        border: '1px solid var(--glass-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        position: 'relative' as const,
        appearance: 'none',
        outline: 'none',
    },
    badge: {
        position: 'absolute' as const,
        top: '-3px', right: '-3px',
        background: 'var(--primary)',
        color: '#fff',
        fontSize: '9px',
        fontWeight: 700,
        width: '16px', height: '16px',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileCard: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        marginLeft: '8px',
        padding: '10px 12px',
        border: '1px solid var(--glass-border)',
        borderRadius: '14px',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))',
        boxShadow: '0 12px 30px rgba(0,0,0,0.22)',
        maxWidth: '260px',
    },
    profileAvatar: {
        width: '36px', height: '36px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, var(--primary), #6d5ce7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        fontSize: '12px',
        fontWeight: 700,
        flexShrink: 0,
    },
    profileName: {
        fontSize: '12px',
        fontWeight: 600,
        color: 'var(--text-bright)',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
    },
    profileMetaRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '5px',
        marginTop: '2px',
    },
    profileRole: {
        fontSize: '10px',
        color: 'var(--text-faint)',
    },
    signOutBtn: {
        width: '30px',
        height: '30px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid var(--glass-border)',
        borderRadius: '10px',
        background: 'rgba(255,255,255,0.04)',
        color: 'var(--text-muted)',
        cursor: 'pointer',
        flexShrink: 0,
    },
};