import { useLayoutEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ArrowRight, Milk, ShieldCheck, Sparkles, UserRound, LockKeyhole } from 'lucide-react';
import { authAPI } from '../api';

export default function SignIn() {
    const navigate = useNavigate();
    const pageRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const [form, setForm] = useState({ username: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useLayoutEffect(() => {
        if (!pageRef.current || !cardRef.current) return;
        const ctx = gsap.context(() => {
            gsap.fromTo(pageRef.current, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' });
            gsap.fromTo(cardRef.current, { opacity: 0, x: 24, rotate: 1.5 }, { opacity: 1, x: 0, rotate: 0, duration: 0.8, delay: 0.08, ease: 'power3.out' });
            gsap.from('.signin-float', { y: 18, opacity: 0, duration: 0.7, stagger: 0.08, delay: 0.16, ease: 'power3.out' });
        }, pageRef);

        return () => ctx.revert();
    }, []);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError('');

        const usernameOrEmail = form.username.trim();
        if (!usernameOrEmail || !form.password) {
            setError('Username/email and password are required');
            setLoading(false);
            return;
        }

        try {
            const response = await authAPI.login(usernameOrEmail, form.password) as {
                token: string;
                user: { username: string; email: string; role: string };
            };

            localStorage.setItem('dairysphere_token', response.token);
            localStorage.setItem('dairysphere_user', JSON.stringify(response.user));
            navigate('/');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to sign in');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div ref={pageRef} style={styles.page}>
            <div style={styles.glowOne} />
            <div style={styles.glowTwo} />

            <div style={styles.shell}>
                <section style={styles.brandPanel} className="signin-float">
                    <div style={styles.brandMark}>
                        <img src="/dairysphere-logo.svg" alt="DairySphere" style={{ width: 172, height: 52, objectFit: 'contain' }} />
                    </div>
                    <h1 style={styles.headline}>DairySphere Society</h1>
                    <p style={styles.copy}>
                        A premium cooperative workspace for tracking deliveries, loans, monthly earnings, and farmer performance in one calm glass interface.
                    </p>
                    <div style={styles.badges}>
                        <Badge icon={ShieldCheck} title="Secure access" text="JWT + role based" />
                        <Badge icon={Sparkles} title="Liquid glass" text="Polished SaaS finish" />
                        <Badge icon={Milk} title="Dairy focus" text="Built for milk societies" />
                    </div>
                </section>

                <section ref={cardRef} style={styles.card}>
                    <div style={styles.cardHeader}>
                        <div>
                            <p style={styles.cardKicker}>Welcome back</p>
                            <h2 style={styles.cardTitle}>Sign in to continue</h2>
                        </div>
                        <div style={styles.cardIcon}><UserRound size={18} /></div>
                    </div>

                    {error && <div style={styles.errorBox}>{error}</div>}

                    <form onSubmit={handleSubmit} style={styles.form}>
                        <label style={styles.label}>
                            Username or Email
                            <div style={styles.inputWrap}>
                                <UserRound size={16} color="var(--text-faint)" />
                                <input
                                    style={styles.input}
                                    value={form.username}
                                    onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
                                    placeholder="admin or admin@dairysphere.com"
                                    autoComplete="username"
                                />
                            </div>
                        </label>

                        <label style={styles.label}>
                            Password
                            <div style={styles.inputWrap}>
                                <LockKeyhole size={16} color="var(--text-faint)" />
                                <input
                                    type="password"
                                    style={styles.input}
                                    value={form.password}
                                    onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                />
                            </div>
                        </label>

                        <button type="submit" disabled={loading} style={styles.submit}>
                            {loading ? 'Signing in...' : 'Enter Dashboard'} <ArrowRight size={16} />
                        </button>
                    </form>

                    <div style={styles.footerRow}>
                        <span>New here?</span>
                        <Link to="/signup" style={styles.link}>Create an account</Link>
                    </div>
                </section>
            </div>
        </div>
    );
}

function Badge({ icon: Icon, title, text }: { icon: React.ComponentType<{ size?: number; color?: string }>; title: string; text: string; }) {
    return (
        <div style={styles.badge} className="signin-float">
            <div style={styles.badgeIcon}><Icon size={16} color="var(--primary)" /></div>
            <div>
                <div style={styles.badgeTitle}>{title}</div>
                <div style={styles.badgeText}>{text}</div>
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    page: {
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        display: 'grid',
        placeItems: 'center',
        padding: '28px',
        background: 'radial-gradient(circle at top left, rgba(139,124,246,0.22), transparent 34%), radial-gradient(circle at bottom right, rgba(45,212,191,0.16), transparent 30%), linear-gradient(160deg, #06080d 0%, #10141b 100%)',
    },
    glowOne: {
        position: 'absolute',
        inset: '10% auto auto 8%',
        width: 280,
        height: 280,
        borderRadius: '50%',
        background: 'rgba(139,124,246,0.18)',
        filter: 'blur(50px)',
        pointerEvents: 'none',
    },
    glowTwo: {
        position: 'absolute',
        right: '8%',
        bottom: '6%',
        width: 340,
        height: 340,
        borderRadius: '50%',
        background: 'rgba(74,222,128,0.12)',
        filter: 'blur(60px)',
        pointerEvents: 'none',
    },
    shell: {
        position: 'relative',
        zIndex: 2,
        width: 'min(1160px, 100%)',
        display: 'grid',
        gridTemplateColumns: '1.05fr 0.95fr',
        gap: '24px',
        alignItems: 'stretch',
    },
    brandPanel: {
        padding: '40px',
        borderRadius: '28px',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.03))',
        border: '1px solid rgba(255,255,255,0.09)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: '640px',
    },
    brandMark: { marginBottom: 26 },
    headline: {
        fontSize: 'clamp(34px, 5vw, 58px)',
        lineHeight: 1,
        letterSpacing: '-0.04em',
        color: 'var(--text-bright)',
        marginBottom: 18,
        fontWeight: 800,
    },
    copy: {
        color: 'var(--text-muted)',
        fontSize: 15,
        lineHeight: 1.7,
        maxWidth: 560,
        marginBottom: 28,
    },
    badges: {
        display: 'grid',
        gap: 14,
        maxWidth: 520,
    },
    badge: {
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '16px 18px',
        borderRadius: '18px',
        background: 'rgba(13,17,23,0.45)',
        border: '1px solid rgba(255,255,255,0.08)',
    },
    badgeIcon: {
        width: 40,
        height: 40,
        borderRadius: '12px',
        display: 'grid',
        placeItems: 'center',
        background: 'rgba(139,124,246,0.12)',
        flexShrink: 0,
    },
    badgeTitle: { color: 'var(--text-bright)', fontSize: 13, fontWeight: 700 },
    badgeText: { color: 'var(--text-faint)', fontSize: 11, marginTop: 2 },
    card: {
        padding: '32px',
        borderRadius: '28px',
        background: 'linear-gradient(180deg, rgba(22,27,34,0.88), rgba(22,27,34,0.76))',
        border: '1px solid rgba(255,255,255,0.08)',
        backdropFilter: 'blur(28px) saturate(180%)',
        WebkitBackdropFilter: 'blur(28px) saturate(180%)',
        boxShadow: '0 24px 80px rgba(0,0,0,0.45)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    cardKicker: { color: 'var(--primary)', fontSize: 12, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: 8 },
    cardTitle: { color: 'var(--text-bright)', fontSize: 28, fontWeight: 800, letterSpacing: '-0.03em' },
    cardIcon: {
        width: 46,
        height: 46,
        borderRadius: '16px',
        background: 'rgba(139,124,246,0.12)',
        border: '1px solid rgba(139,124,246,0.18)',
        display: 'grid',
        placeItems: 'center',
        color: 'var(--primary)',
    },
    errorBox: {
        padding: '12px 14px',
        borderRadius: '14px',
        background: 'rgba(239,68,68,0.12)',
        border: '1px solid rgba(239,68,68,0.25)',
        color: '#fca5a5',
        marginBottom: 18,
        fontSize: 13,
    },
    form: { display: 'grid', gap: 16 },
    label: { display: 'grid', gap: 8, color: 'var(--text-muted)', fontSize: 12, fontWeight: 600 },
    inputWrap: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '0 14px',
        borderRadius: '16px',
        background: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
    },
    input: {
        width: '100%',
        border: 'none',
        outline: 'none',
        background: 'transparent',
        color: 'var(--text-bright)',
        fontSize: 14,
        padding: '14px 0',
        fontFamily: 'inherit',
    },
    submit: {
        marginTop: 8,
        height: 50,
        border: 'none',
        borderRadius: '16px',
        background: 'linear-gradient(135deg, var(--primary), #6d5ce7)',
        color: '#fff',
        fontSize: 14,
        fontWeight: 700,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        boxShadow: '0 14px 30px rgba(139,124,246,0.25)',
    },
    footerRow: {
        marginTop: 18,
        display: 'flex',
        justifyContent: 'space-between',
        color: 'var(--text-muted)',
        fontSize: 13,
    },
    link: {
        color: 'var(--primary)',
        textDecoration: 'none',
        fontWeight: 700,
    },
};
