import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MapPin, Phone, Mail, Calendar, ArrowRight, Pencil } from 'lucide-react';
import type { Farmer } from '../../types';
import { formatDate } from '../../utils/formatCurrency';

gsap.registerPlugin(ScrollTrigger);

interface FarmerCardProps {
    farmer: Farmer;
    index: number;
    onEditProfilePic?: (farmer: Farmer) => void;
}

const API_BASE = 'http://localhost:3001';

export default function FarmerCard({ farmer, index, onEditProfilePic }: FarmerCardProps) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const innerRef = useRef<HTMLDivElement>(null);
    const [, setFlipped] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!wrapperRef.current) return;
        gsap.set(wrapperRef.current, { y: 70, opacity: 0, scale: 0.93 });
        const ctx = gsap.context(() => {
            ScrollTrigger.create({
                trigger: wrapperRef.current,
                start: 'top 92%',
                onEnter: () => {
                    gsap.to(wrapperRef.current, {
                        y: 0, opacity: 1, scale: 1,
                        duration: 0.8,
                        delay: (index % 4) * 0.08,
                        ease: 'expo.out',
                    });
                },
                once: true,
            });
        });
        return () => ctx.revert();
    }, [index]);

    const flip = (to: boolean) => {
        setFlipped(to);
        gsap.to(innerRef.current, {
            rotateY: to ? 180 : 0,
            duration: 0.6,
            ease: 'power2.inOut'
        });
    };

    const defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(farmer.FarmerName)}&background=1e1533&color=8b7cf6&size=200&font-size=0.45&bold=true&format=svg`;
    const hasValidProfilePic = typeof farmer.ProfilePicUrl === 'string'
        && farmer.ProfilePicUrl.trim().length > 0
        && farmer.ProfilePicUrl.trim().toLowerCase() !== 'null';
    const profilePic = hasValidProfilePic
        ? `${API_BASE}${farmer.ProfilePicUrl}`
        : defaultAvatar;
    return (
        <div
            ref={wrapperRef}
            style={styles.perspective}
            onMouseEnter={() => flip(true)}
            onMouseLeave={() => flip(false)}
            onClick={() => {
                gsap.to(wrapperRef.current, {
                    scale: 0.95, duration: 0.15,
                    ease: 'power2.in',
                    onComplete: () => {
                        navigate(`/farmers/${farmer.FarmerId}`);
                    }
                });
            }}
        >
            <div ref={innerRef} style={styles.inner}>

                {/* ===== FRONT ===== */}
                <div style={styles.front}>
                    <div style={styles.stripe} />

                    <div style={styles.profileWrap}>
                        <div style={{ position: 'relative' }}>
                            <img
                                src={profilePic}
                                alt={farmer.FarmerName}
                                style={styles.avatar}
                                onError={(e) => {
                                    const img = e.currentTarget;
                                    if (img.src !== defaultAvatar) {
                                        img.src = defaultAvatar;
                                    }
                                }}
                            />
                            <div style={{
                                ...styles.dot,
                                background: farmer.Age < 35 ? 'var(--secondary)' : 'var(--warning)',
                            }} />
                        </div>
                        <div style={styles.idBadge}>{farmer.FarmerId}</div>
                    </div>

                    <h3 style={styles.name}>{farmer.FarmerName}</h3>
                    <div style={styles.locRow}>
                        <MapPin size={12} color="var(--primary)" />
                        <span style={styles.locText}>{farmer.Location}</span>
                    </div>

                    <div style={styles.tags}>
                        <span style={{
                            ...styles.tag,
                            background: farmer.Gender === 'Male'
                                ? 'rgba(139, 124, 246, 0.1)' : 'rgba(236, 72, 153, 0.1)',
                            color: farmer.Gender === 'Male' ? 'var(--primary)' : '#ec4899',
                            border: farmer.Gender === 'Male'
                                ? '1px solid rgba(139, 124, 246, 0.2)'
                                : '1px solid rgba(236, 72, 153, 0.2)',
                        }}>
                            {farmer.Gender}
                        </span>
                        <span style={styles.tagNeutral}>Age: {farmer.Age}</span>
                    </div>
                </div>

                {/* ===== BACK ===== */}
                <div style={styles.back}>
                    {onEditProfilePic && (
                        <button
                            type="button"
                            style={styles.editPicBtn}
                            aria-label="Edit profile picture"
                            onClick={(e) => {
                                e.stopPropagation();
                                onEditProfilePic(farmer);
                            }}
                        >
                            <Pencil size={11} />
                        </button>
                    )}
                    <div style={styles.backInner}>
                        <div style={styles.backHead}>
                            <img
                                src={profilePic}
                                alt={farmer.FarmerName}
                                style={styles.backAvatar}
                                onError={(e) => {
                                    const img = e.currentTarget;
                                    if (img.src !== defaultAvatar) {
                                        img.src = defaultAvatar;
                                    }
                                }}
                            />
                            <div>
                                <h3 style={styles.backName}>{farmer.FarmerName}</h3>
                                <span style={styles.backId}>{farmer.FarmerId}</span>
                            </div>
                        </div>

                        <div style={styles.backRows}>
                            <div style={styles.row}><Phone size={13} color="var(--primary)" /><span>{farmer.Contact}</span></div>
                            <div style={styles.row}><Mail size={13} color="var(--primary)" /><span>{farmer.Email || 'No email'}</span></div>
                            <div style={styles.row}><MapPin size={13} color="var(--primary)" /><span>{farmer.Location}</span></div>
                            <div style={styles.row}><Calendar size={13} color="var(--primary)" /><span>Joined: {formatDate(farmer.EnrolmentDate)}</span></div>
                        </div>

                        <div style={styles.viewBtn}>
                            <span>View Profile</span>
                            <ArrowRight size={15} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles: Record<string, React.CSSProperties> = {
    perspective: { perspective: '1200px', cursor: 'pointer' },
    inner: {
        position: 'relative',
        width: '100%', height: '290px',
        transformStyle: 'preserve-3d',
        borderRadius: '16px',
    },

    // FRONT
    front: {
        position: 'absolute',
        width: '100%', height: '100%',
        backfaceVisibility: 'hidden',
        background: 'var(--glass-bg-card)',
        backdropFilter: 'blur(12px) saturate(160%)',
        border: '1px solid var(--glass-border)',
        borderRadius: '16px',
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        overflow: 'hidden',
    },
    stripe: {
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '3px',
        background: 'linear-gradient(90deg, var(--primary), var(--accent))',
    },
    editPicBtn: {
        position: 'absolute',
        top: '10px',
        right: '10px',
        width: '24px',
        height: '24px',
        borderRadius: '8px',
        border: '1px solid var(--glass-border)',
        background: 'var(--glass-bg)',
        color: 'var(--text-muted)',
        cursor: 'pointer',
        zIndex: 3,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    profileWrap: {
        position: 'relative',
        marginBottom: '12px',
        marginTop: '8px',
    },
    avatar: {
        width: '74px', height: '74px',
        borderRadius: '50%',
        objectFit: 'cover',
        border: '2px solid rgba(139, 124, 246, 0.2)',
    },
    dot: {
        position: 'absolute',
        bottom: '2px', right: '2px',
        width: '13px', height: '13px',
        borderRadius: '50%',
        border: '2px solid var(--base-200)',
    },
    idBadge: {
    position: 'absolute',
    top: '-8px',
    right: '-24px',
    background: 'var(--base-100)',
    color: 'var(--primary)',
    fontSize: '10px',
    fontWeight: 700,
    padding: '3px 8px',
    borderRadius: '6px',
    border: '1px solid rgba(139, 124, 246, 0.25)',
    letterSpacing: '0.3px',
    zIndex: 2,
},
    name: {
        fontSize: '15px',
        fontWeight: 700,
        color: 'var(--text-bright)',
        textAlign: 'center',
        marginBottom: '4px',
    },
    locRow: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        marginBottom: '14px',
    },
    locText: {
        fontSize: '12px',
        color: 'var(--text-muted)',
    },
    tags: {
        display: 'flex',
        gap: '8px',
        marginTop: 'auto',
    },
    tag: {
        fontSize: '11px',
        fontWeight: 600,
        padding: '4px 12px',
        borderRadius: '8px',
    },
    tagNeutral: {
        fontSize: '11px',
        fontWeight: 600,
        padding: '4px 12px',
        borderRadius: '8px',
        background: 'rgba(255,255,255,0.04)',
        color: 'var(--text-muted)',
        border: '1px solid var(--glass-border)',
    },

    // BACK
    back: {
        position: 'absolute',
        width: '100%', height: '100%',
        backfaceVisibility: 'hidden',
        background: 'var(--glass-bg-card)',
        backdropFilter: 'blur(20px) saturate(180%)',
        borderRadius: '16px',
        transform: 'rotateY(180deg)',
        padding: '24px',
        border: '1px solid var(--glass-border)',
    },
    backInner: {
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
    },
    backHead: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '16px',
        paddingBottom: '14px',
        borderBottom: '1px solid rgba(255,255,255,0.05)',
    },
    backAvatar: {
        width: '40px', height: '40px',
        borderRadius: '10px',
        objectFit: 'cover',
        border: '2px solid rgba(139, 124, 246, 0.25)',
    },
    backName: {
        fontSize: '14px',
        fontWeight: 700,
        color: 'var(--text-bright)',
    },
    backId: {
        fontSize: '11px',
        color: 'var(--primary)',
        fontWeight: 600,
    },
    backRows: {
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        flex: 1,
    },
    row: {
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '12.5px',
        color: 'var(--text-normal)',
    },
    viewBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '10px',
        background: 'rgba(139, 124, 246, 0.1)',
        border: '1px solid rgba(139, 124, 246, 0.2)',
        borderRadius: '10px',
        color: 'var(--primary)',
        fontSize: '12.5px',
        fontWeight: 600,
        marginTop: 'auto',
        transition: 'background 0.3s ease',
    },
};