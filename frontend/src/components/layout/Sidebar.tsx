import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Users, UserCheck, Factory,
    Package, Milk, Landmark, Truck,
    ShoppingCart, DollarSign, FileText,
    ChevronRight, Leaf, PanelLeftClose, PanelLeft
} from 'lucide-react';

const mainNav = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/farmers', label: 'Farmers', icon: Users },
    { path: '/agents', label: 'Agents', icon: UserCheck },
    { path: '/factories', label: 'Factories', icon: Factory },
    { path: '/inputs', label: 'Inputs', icon: Package },
    { path: '/milk-quality', label: 'Milk Quality', icon: Milk },
    { path: '/loans', label: 'Loans', icon: Landmark },
    { path: '/deliveries', label: 'Deliveries', icon: Truck },
    { path: '/purchases', label: 'Purchases', icon: ShoppingCart },
    { path: '/sales', label: 'Sales', icon: DollarSign },
];

const reportNav = [
    { path: '/reports/farmers-list', label: 'Farmers Report', icon: FileText },
    { path: '/reports/agents-commission', label: 'Commission', icon: FileText },
    { path: '/reports/deliveries', label: 'Deliveries', icon: FileText },
    { path: '/reports/loans', label: 'Loans', icon: FileText },
    { path: '/reports/purchases', label: 'Purchases', icon: FileText },
    { path: '/reports/statements', label: 'Statements', icon: FileText },
];

interface SidebarProps {
    collapsed: boolean;
    onToggle: () => void;
}

export default function Sidebar({ collapsed, onToggle }: SidebarProps) {
    const location = useLocation();

    return (
        <div style={{
            ...S.sidebar,
            width: collapsed ? '72px' : '260px',
        }}>
            {/* Logo */}
            <div style={{
                ...S.logo,
                justifyContent: collapsed ? 'center' : 'flex-start',
                padding: collapsed ? '20px 0 12px' : '20px 20px 12px',
            }}>
                <div style={S.logoIcon}>
                    <Leaf size={20} color="var(--primary)" />
                </div>
                {!collapsed && (
                    <div>
                        <div style={S.logoText}>DairySphere</div>
                        <div style={S.logoSub}>SOCIETY</div>
                    </div>
                )}
            </div>

            {/* Toggle */}
            <div onClick={onToggle} style={{
                ...S.toggle,
                justifyContent: collapsed ? 'center' : 'flex-end',
                padding: collapsed ? '0' : '0 14px',
            }}>
                <div style={S.toggleBox}>
                    {collapsed
                        ? <PanelLeft size={15} color="var(--text-muted)" />
                        : <PanelLeftClose size={15} color="var(--text-muted)" />
                    }
                </div>
            </div>

            {/* Navigation */}
            <div style={S.scroll}>
                <NavSection
                    label="MAIN MENU"
                    items={mainNav}
                    collapsed={collapsed}
                    location={location}
                />
                <NavSection
                    label="REPORTS"
                    items={reportNav}
                    collapsed={collapsed}
                    location={location}
                />
            </div>

            {/* Bottom */}
            {!collapsed ? (
                <div style={S.bottom}>
                    <span style={{ fontSize: '18px' }}>🐄</span>
                    <div style={{ flex: 1 }}>
                        <div style={S.bottomName}>DairySphere v1.0</div>
                        <div style={S.bottomSub}>SQL Server Connected</div>
                    </div>
                    <div style={S.dot} />
                </div>
            ) : (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '14px 0' }}>
                    <div style={S.dot} />
                </div>
            )}
        </div>
    );
}

function NavSection({ label, items, collapsed, location }: {
    label: string;
    items: typeof mainNav;
    collapsed: boolean;
    location: ReturnType<typeof useLocation>;
}) {
    return (
        <div style={{ marginBottom: '14px' }}>
            {!collapsed
                ? <div style={S.navLabel}>{label}</div>
                : <div style={S.divider} />
            }
            {items.map((item) => {
                const isActive = item.path === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(item.path);

                return (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        end={item.path === '/'}
                        title={collapsed ? item.label : undefined}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '11px',
                            padding: collapsed ? '10px 0' : '10px 14px',
                            justifyContent: collapsed ? 'center' : 'flex-start',
                            borderRadius: '10px',
                            textDecoration: 'none',
                            fontSize: '13px',
                            fontWeight: isActive ? 600 : 500,
                            marginBottom: '2px',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            background: isActive ? 'var(--sidebar-active-bg)' : 'transparent',
                            borderLeft: isActive && !collapsed
                                ? '3px solid var(--primary)' : '3px solid transparent',
                            transition: 'all 0.25s ease',
                        }}
                    >
                        <item.icon
                            size={18}
                            color={isActive ? 'var(--primary)' : 'var(--text-muted)'}
                            style={{ flexShrink: 0 }}
                        />
                        {!collapsed && (
                            <>
                                <span style={{
                                    color: isActive ? 'var(--text-bright)' : 'var(--text-muted)',
                                }}>{item.label}</span>
                                {isActive && (
                                    <ChevronRight size={14} color="var(--primary)"
                                        style={{ marginLeft: 'auto' }} />
                                )}
                            </>
                        )}
                    </NavLink>
                );
            })}
        </div>
    );
}

const S: Record<string, React.CSSProperties> = {
    sidebar: {
        height: '100vh',
        background: 'var(--sidebar-bg)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        position: 'fixed',
        left: 0, top: 0,
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        borderRight: '1px solid var(--sidebar-border)',
        overflow: 'hidden',
        transition: 'width 0.35s cubic-bezier(0.23, 1, 0.32, 1)',
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        transition: 'all 0.3s ease',
    },
    logoIcon: {
        width: '36px', height: '36px',
        borderRadius: '10px',
        background: 'var(--sidebar-logo-bg)',
        border: '1px solid var(--sidebar-logo-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
    },
    logoText: {
        fontSize: '17px',
        fontWeight: 800,
        color: 'var(--text-bright)',
        lineHeight: 1.1,
        whiteSpace: 'nowrap',
    },
    logoSub: {
        fontSize: '9px',
        fontWeight: 700,
        color: 'var(--primary)',
        letterSpacing: '3px',
    },
    toggle: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '10px',
        cursor: 'pointer',
    },
    toggleBox: {
        width: '30px', height: '30px',
        borderRadius: '8px',
        background: 'var(--base-200)',
        border: '1px solid var(--glass-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    scroll: {
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        padding: '0 8px',
    },
    navLabel: {
        fontSize: '10px',
        fontWeight: 700,
        color: 'var(--text-faint)',
        letterSpacing: '1.5px',
        padding: '10px 14px 6px',
        whiteSpace: 'nowrap',
    },
    divider: {
        height: '1px',
        background: 'var(--sidebar-border)',
        margin: '8px 12px',
    },
    bottom: {
        margin: '8px 10px 14px',
        padding: '12px 14px',
        background: 'var(--base-200)',
        borderRadius: '10px',
        border: '1px solid var(--glass-border)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    bottomName: {
        fontSize: '11px',
        fontWeight: 600,
        color: 'var(--text-normal)',
        whiteSpace: 'nowrap',
    },
    bottomSub: {
        fontSize: '10px',
        color: 'var(--text-faint)',
        whiteSpace: 'nowrap',
    },
    dot: {
        width: '8px', height: '8px',
        borderRadius: '50%',
        background: 'var(--secondary)',
        flexShrink: 0,
        boxShadow: '0 0 8px rgba(74, 222, 128, 0.5)',
    },
};