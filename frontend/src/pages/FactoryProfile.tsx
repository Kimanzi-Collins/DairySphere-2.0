import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FileText, Droplet, DollarSign, TrendingUp } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import { getEntityProfilePic } from '../utils/entityProfilePics';
import '../styles/FactoryProfile.css';

const API = 'http://localhost:3001/api';

const FactoryProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const pageRef = useRef<HTMLDivElement>(null);

  const [factory, setFactory] = useState<any>(null);
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const facRes = await fetch(`${API}/factories/${id}`);
      const facData = await facRes.json();
      const facObj = Array.isArray(facData) ? facData[0] : facData.recordset?.[0] ?? facData;
      console.log('Factory profile:', facObj);
      setFactory(facObj);

      // Fetch deliveries for this factory
      try {
        const delRes = await fetch(`${API}/deliveries?factoryId=${id}`);
        if (delRes.ok) {
          const delData = await delRes.json();
          const fullList = Array.isArray(delData) ? delData : delData.recordset ?? [];
          const delList = fullList.filter((delivery: any) =>
            String(delivery.FactoryId || '').toUpperCase() === String(id || '').toUpperCase()
          );
          setDeliveries(delList);

          // Build monthly breakdown
          const monthly: Record<string, { month: string; sortKey: string; deliveries: number; totalLitres: number; totalAmount: number }> = {};
          delList.forEach((d: any) => {
            const date = new Date(d.DeliveryDate || d.Date || d.DateDelivered || d.CreatedAt);
            if (Number.isNaN(date.getTime())) return;
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const label = date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
            if (!monthly[key]) monthly[key] = { month: label, sortKey: key, deliveries: 0, totalLitres: 0, totalAmount: 0 };
            monthly[key].deliveries += 1;
            monthly[key].totalLitres += Number(d.MilkQuantity || d.Litres || d.Quantity || 0);
            monthly[key].totalAmount += Number(d.Amount || d.TotalAmount || 0);
          });
          setMonthlyData(Object.values(monthly).sort((a, b) => a.sortKey.localeCompare(b.sortKey)));
        }
      } catch { console.log('Delivery data not available'); }
    } catch (err) { console.error('Failed to load factory:', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  useEffect(() => {
    if (loading || !factory) return;
    requestAnimationFrame(() => {
      gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl.from('.profile-back-btn', { x: -20, opacity: 0, duration: 0.4 })
          .from('.factory-profile-card', { y: 40, opacity: 0, duration: 0.7 }, '-=0.2')
          .from('.factory-profile-stats .stat-card', { y: 30, opacity: 0, stagger: 0.1, duration: 0.5 }, '-=0.4')
          .from('.factory-profile-chart-section', { y: 40, opacity: 0, duration: 0.6, clearProps: 'all' }, '-=0.3')
          .from('.factory-profile-table-section', { y: 40, opacity: 0, duration: 0.6, clearProps: 'all' }, '-=0.3');
      }, pageRef);
    });
  }, [loading, factory]);

  const getField = (obj: any, ...keys: string[]) => { for (const k of keys) if (obj?.[k]) return obj[k]; return ''; };
  const formatCurrency = (n: number) => `Ksh. ${n.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const getInitials = (name: string) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
  const getAvatarColor = (fid: string) => {
    const colors = ['#3b82f6', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];
    return colors[(fid || '').split('').reduce((s, c) => s + c.charCodeAt(0), 0) % colors.length];
  };

  const totalDeliveries = deliveries.length;
  const totalLitres = deliveries.reduce((s, d) => s + Number(d.MilkQuantity || d.Litres || d.Quantity || 0), 0);
  const totalAmount = deliveries.reduce((s, d) => s + Number(d.Amount || d.TotalAmount || 0), 0);
  const avgLitres = totalDeliveries > 0 ? totalLitres / totalDeliveries : 0;
  const factoryProfilePic = factory?.FactoryId ? getEntityProfilePic('factories', factory.FactoryId) : null;

  const customTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    return (
      <div className="profile-chart-tooltip">
        <p className="tooltip-label">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {typeof p.value === 'number' && p.name.includes('Amount') ? formatCurrency(p.value) : `${p.value.toLocaleString()} L`}</p>
        ))}
      </div>
    );
  };

  if (loading) return <div className="factories-loading"><div className="loading-spinner" /><p>Loading factory profile...</p></div>;
  if (!factory) return <div className="factories-loading"><p>Factory not found</p></div>;

  return (
    <div className="factory-profile-page" ref={pageRef}>
      <button className="profile-back-btn" onClick={() => navigate('/factories')}>← Back to Factories</button>

      <div className="factory-profile-card">
        <div className="factory-profile-card-left">
          {factoryProfilePic ? (
            <img className="factory-profile-avatar" src={factoryProfilePic} alt={factory.FactoryName} style={{ objectFit: 'cover' }} />
          ) : (
            <div className="factory-profile-avatar" style={{ background: getAvatarColor(factory.FactoryId) }}>
              {getInitials(factory.FactoryName)}
            </div>
          )}
          <div className="factory-profile-info">
            <div className="factory-profile-badges">
              <span className="badge badge-blue">{factory.FactoryId}</span>
            </div>
            <h2 className="factory-profile-name">{factory.FactoryName}</h2>
            <div className="factory-profile-meta">
              <span>📍 {getField(factory, 'Location')}</span>
              <span>📞 {getField(factory, 'Contact', 'Phone') || '—'}</span>
              <span>✉️ {getField(factory, 'Email') || '—'}</span>
            </div>
          </div>
        </div>
        <div className="factory-profile-earnings-box">
          <span className="earnings-label">TOTAL MILK RECEIVED</span>
          <span className="earnings-value positive">{totalLitres.toLocaleString('en-KE', { minimumFractionDigits: 2 })} L</span>
          <span className="earnings-sub">{totalDeliveries} deliveries</span>
        </div>
      </div>

      <div className="factory-profile-stats">
        <StatCard icon={FileText} title="DELIVERIES" value={totalDeliveries} subtitle="total received" color="#3b82f6" />
        <StatCard icon={Droplet} title="TOTAL LITRES" value={`${totalLitres.toLocaleString('en-KE', { minimumFractionDigits: 2 })} L`} subtitle="milk received" color="#10b981" />
        <StatCard icon={DollarSign} title="TOTAL AMOUNT" value={formatCurrency(totalAmount)} subtitle="paid out" color="#8b5cf6" />
        <StatCard icon={TrendingUp} title="AVG / DELIVERY" value={`${avgLitres.toFixed(2)} L`} subtitle="per delivery" color="#f59e0b" />
      </div>

      <div className="factory-profile-chart-section">
        <div className="profile-chart-card">
          <h3 className="profile-section-title">Monthly Milk Received</h3>
          <p className="profile-section-sub">Litres delivered per month</p>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <Tooltip content={customTooltip} />
                <Bar dataKey="totalLitres" name="Litres" fill="#3b82f6" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="profile-chart-empty">No delivery data available yet</div>}
        </div>
        <div className="profile-performance-card">
          <h3 className="profile-section-title">Performance</h3>
          <p className="profile-section-sub">Key indicators</p>
          <div className="performance-rows">
            <div className="perf-row"><span>Best Month</span><span className="perf-value positive">{monthlyData.length > 0 ? `${Math.max(...monthlyData.map(m => m.totalLitres)).toLocaleString()} L` : '—'}</span></div>
            <div className="perf-row"><span>Worst Month</span><span className="perf-value">{monthlyData.length > 0 ? `${Math.min(...monthlyData.map(m => m.totalLitres)).toLocaleString()} L` : '—'}</span></div>
            <div className="perf-row"><span>Avg Monthly</span><span className="perf-value">{monthlyData.length > 0 ? `${(totalLitres / monthlyData.length).toFixed(2)} L` : '—'}</span></div>
            <div className="perf-row"><span>Active Months</span><span className="perf-value">{monthlyData.length}</span></div>
            <div className="perf-row"><span>Total Deliveries</span><span className="perf-value">{totalDeliveries}</span></div>
          </div>
        </div>
      </div>

      <div className="factory-profile-table-section">
        <h3 className="profile-section-title">Monthly Delivery Detail</h3>
        <p className="profile-section-sub">Complete delivery breakdown</p>
        {monthlyData.length > 0 ? (
          <div className="profile-table-wrap">
            <table className="profile-table">
              <thead><tr><th>MONTH</th><th>DELIVERIES</th><th>LITRES</th><th>AMOUNT</th></tr></thead>
              <tbody>
                {monthlyData.map((m, i) => (
                  <tr key={i}>
                    <td className="month-cell">{m.month}</td>
                    <td>{m.deliveries}</td>
                    <td>{m.totalLitres.toLocaleString('en-KE', { minimumFractionDigits: 2 })} L</td>
                    <td className="positive">{formatCurrency(m.totalAmount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <div className="profile-chart-empty">No monthly data to display</div>}
      </div>
    </div>
  );
};

export default FactoryProfile;