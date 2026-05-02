import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Wallet, DollarSign, TrendingUp } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import { getEntityProfilePic } from '../utils/entityProfilePics';
import '../styles/AgentProfile.css';

const API = 'http://localhost:3001/api';

const AgentProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const pageRef = useRef<HTMLDivElement>(null);

  const [agent, setAgent] = useState<any>(null);
  const [sales, setSales] = useState<any[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      // Fetch agent details
      const agentRes = await fetch(`${API}/agents/${id}`);
      const agentData = await agentRes.json();
      const agentObj = Array.isArray(agentData) ? agentData[0] : agentData.recordset?.[0] ?? agentData;
      console.log('Agent profile:', agentObj);
      setAgent(agentObj);

      // Fetch sales for this agent
      try {
        const salesRes = await fetch(`${API}/sales?agentId=${id}`);
        if (salesRes.ok) {
          const salesData = await salesRes.json();
          const salesList = Array.isArray(salesData) ? salesData : salesData.recordset ?? [];
          setSales(salesList);

          // Build monthly breakdown
          const monthly: Record<string, { month: string; salesCount: number; totalAmount: number; commission: number }> = {};
          salesList.forEach((s: any) => {
            const date = new Date(s.SaleDate || s.DateSold || s.Date);
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const label = date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
            if (!monthly[key]) monthly[key] = { month: label, salesCount: 0, totalAmount: 0, commission: 0 };
            monthly[key].salesCount += 1;
            monthly[key].totalAmount += Number(s.SaleAmount || s.Amount || 0);
            monthly[key].commission += Number(s.Commission || s.CommissionAmount || 0);
          });
          setMonthlyData(Object.values(monthly).sort((a, b) => a.month.localeCompare(b.month)));
        }
      } catch { console.log('Sales data not available'); }
    } catch (err) { console.error('Failed to load agent profile:', err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [id]);

  // GSAP
  useEffect(() => {
    if (loading || !agent) return;
    requestAnimationFrame(() => {
      gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
        tl.from('.profile-back-btn', { x: -20, opacity: 0, duration: 0.4 })
          .from('.agent-profile-card', { y: 40, opacity: 0, duration: 0.7 }, '-=0.2')
          .from('.agent-profile-stats .stat-card', { y: 30, opacity: 0, stagger: 0.1, duration: 0.5 }, '-=0.4')
          .from('.agent-profile-chart-section', { y: 40, opacity: 0, duration: 0.6, clearProps: 'all' }, '-=0.3')
          .from('.agent-profile-table-section', { y: 40, opacity: 0, duration: 0.6, clearProps: 'all' }, '-=0.3');
      }, pageRef);
    });
  }, [loading, agent]);

  // Helpers
  const getField = (obj: any, ...keys: string[]) => { for (const k of keys) if (obj?.[k]) return obj[k]; return ''; };
  const formatCurrency = (n: number) => `Ksh. ${n.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const getInitials = (name: string) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '??';
  const getAvatarColor = (agentId: string) => {
    const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#06b6d4'];
    return colors[(agentId || '').split('').reduce((s, c) => s + c.charCodeAt(0), 0) % colors.length];
  };

  // Stats
  const totalSalesCount = sales.length;
  const totalSalesAmount = sales.reduce((sum, s) => sum + Number(s.SaleAmount || s.Amount || 0), 0);
  const totalCommission = sales.reduce((sum, s) => sum + Number(s.Commission || s.CommissionAmount || 0), 0);
  const avgCommission = totalSalesCount > 0 ? totalCommission / totalSalesCount : 0;
  const agentProfilePic = agent?.AgentId ? getEntityProfilePic('agents', agent.AgentId) : null;

  const customTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    return (
      <div className="profile-chart-tooltip">
        <p className="tooltip-label">{label}</p>
        {payload.map((p: any, i: number) => (
          <p key={i} style={{ color: p.color }}>{p.name}: {formatCurrency(p.value)}</p>
        ))}
      </div>
    );
  };

  if (loading) return <div className="agents-loading"><div className="loading-spinner" /><p>Loading agent profile...</p></div>;
  if (!agent) return <div className="agents-loading"><p>Agent not found</p></div>;

  return (
    <div className="agent-profile-page" ref={pageRef}>
      <button className="profile-back-btn" onClick={() => navigate('/agents')}>← Back to Agents</button>

      {/* Profile Card */}
      <div className="agent-profile-card">
        <div className="agent-profile-card-left">
          {agentProfilePic ? (
            <img className="agent-profile-avatar" src={agentProfilePic} alt={agent.AgentName} style={{ objectFit: 'cover' }} />
          ) : (
            <div className="agent-profile-avatar" style={{ background: getAvatarColor(agent.AgentId) }}>
              {getInitials(agent.AgentName)}
            </div>
          )}
          <div className="agent-profile-info">
            <div className="agent-profile-badges">
              <span className="badge badge-purple">{agent.AgentId}</span>
            </div>
            <h2 className="agent-profile-name">{agent.AgentName}</h2>
            <div className="agent-profile-meta">
              <span>📍 {getField(agent, 'Location')}</span>
              <span>📞 {getField(agent, 'Contact', 'Phone') || '—'}</span>
              <span>✉️ {getField(agent, 'Email') || '—'}</span>
              <span>📅 Joined {getField(agent, 'DateRegistered', 'DateJoined') ? new Date(getField(agent, 'DateRegistered', 'DateJoined')).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}</span>
            </div>
          </div>
        </div>
        <div className="agent-profile-earnings-box">
          <span className="earnings-label">TOTAL COMMISSION</span>
          <span className={`earnings-value ${totalCommission > 0 ? 'positive' : ''}`}>
            {formatCurrency(totalCommission)}
          </span>
          <span className="earnings-sub">{totalSalesCount} total sales</span>
        </div>
      </div>

      {/* Stats */}
      <div className="agent-profile-stats">
        <StatCard icon={Wallet} title="TOTAL SALES" value={totalSalesCount} subtitle="transactions" color="#8b5cf6" />
        <StatCard icon={DollarSign} title="SALES AMOUNT" value={formatCurrency(totalSalesAmount)} subtitle="total value" color="#3b82f6" />
        <StatCard icon={DollarSign} title="TOTAL COMMISSION" value={formatCurrency(totalCommission)} subtitle="5% earned" color="#10b981" />
        <StatCard icon={TrendingUp} title="AVG / SALE" value={formatCurrency(avgCommission)} subtitle="per transaction" color="#f59e0b" />
      </div>

      {/* Chart Section */}
      <div className="agent-profile-chart-section">
        <div className="profile-chart-card">
          <h3 className="profile-section-title">Monthly Breakdown</h3>
          <p className="profile-section-sub">Sales & commission over time</p>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                <Tooltip content={customTooltip} />
                <Bar dataKey="totalAmount" name="Sales Amount" fill="#8b5cf6" radius={[4,4,0,0]} />
                <Bar dataKey="commission" name="Commission" fill="#10b981" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="profile-chart-empty">No sales data available yet</div>
          )}
        </div>
        <div className="profile-performance-card">
          <h3 className="profile-section-title">Performance</h3>
          <p className="profile-section-sub">Key indicators</p>
          <div className="performance-rows">
            <div className="perf-row"><span>Best Month</span><span className="perf-value positive">{monthlyData.length > 0 ? formatCurrency(Math.max(...monthlyData.map(m => m.commission))) : '—'}</span></div>
            <div className="perf-row"><span>Worst Month</span><span className="perf-value">{monthlyData.length > 0 ? formatCurrency(Math.min(...monthlyData.map(m => m.commission))) : '—'}</span></div>
            <div className="perf-row"><span>Avg Monthly</span><span className="perf-value">{monthlyData.length > 0 ? formatCurrency(totalCommission / monthlyData.length) : '—'}</span></div>
            <div className="perf-row"><span>Active Months</span><span className="perf-value">{monthlyData.length}</span></div>
            <div className="perf-row"><span>Total Sales</span><span className="perf-value">{totalSalesCount}</span></div>
          </div>
        </div>
      </div>

      {/* Monthly Table */}
      <div className="agent-profile-table-section">
        <h3 className="profile-section-title">Monthly Sales Detail</h3>
        <p className="profile-section-sub">Complete sales breakdown</p>
        {monthlyData.length > 0 ? (
          <div className="profile-table-wrap">
            <table className="profile-table">
              <thead>
                <tr>
                  <th>MONTH</th>
                  <th>SALES</th>
                  <th>AMOUNT</th>
                  <th>COMMISSION</th>
                </tr>
              </thead>
              <tbody>
                {monthlyData.map((m, i) => (
                  <tr key={i}>
                    <td className="month-cell">{m.month}</td>
                    <td>{m.salesCount}</td>
                    <td>{formatCurrency(m.totalAmount)}</td>
                    <td className="positive">{formatCurrency(m.commission)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="profile-chart-empty">No monthly data to display</div>
        )}
      </div>
    </div>
  );
};

export default AgentProfile;