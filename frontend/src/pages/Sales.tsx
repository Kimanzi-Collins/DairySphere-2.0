import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { TrendingUp, DollarSign, Percent, Users, Search, Plus, Edit3, Trash2 } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import SaleForm from '../components/forms/SaleForm';
import '../styles/Transactions.css';

const API = 'http://localhost:3001/api';

const Sales = () => {
  const [sales, setSales] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [, setEditItem] = useState<any>(null);
  const animated = useRef(false);

  const load = async () => {
    try { const res = await fetch(`${API}/sales`); const data = await res.json(); setSales(Array.isArray(data) ? data : data.recordset ?? []); }
    catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (loading || animated.current) return;
    animated.current = true;
    setTimeout(() => {
      gsap.fromTo('.tx-stats .stat-card', { y: 30, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, duration: 0.5, ease: 'power3.out' });
      gsap.fromTo('.tx-table-section', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, ease: 'power3.out', delay: 0.3 });
    }, 50);
  }, [loading]);

  const fmt = (n: number) => `Ksh. ${Number(n).toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

  const totalSales = sales.length;
  const totalAmount = sales.reduce((s, x) => s + Number(x.SaleAmount || 0), 0);
  const totalComm = sales.reduce((s, x) => s + Number(x.Commission || 0), 0);
  const uniqueAgents = [...new Set(sales.map(s => s.AgentId))].length;

  const filtered = sales.filter(s =>
    (s.SaleId || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.FarmerName || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.AgentName || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this sale?')) return;
    try { await fetch(`${API}/sales/${id}`, { method: 'DELETE' }); load(); } catch (err: any) { alert(err.message); }
  };

  if (loading) return <div className="page-loading"><div className="loading-spinner" /><p>Loading sales...</p></div>;

  return (
    <div className="tx-page">
      <div className="tx-page-header"><h1 className="page-title">Sales Management</h1><p className="page-date">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p></div>

      <div className="tx-stats">
        <StatCard icon={TrendingUp} title="TOTAL SALES" value={totalSales} subtitle="transactions" color="#8b5cf6" />
        <StatCard icon={DollarSign} title="SALES AMOUNT" value={fmt(totalAmount)} subtitle="total value" color="#3b82f6" />
        <StatCard icon={Percent} title="COMMISSION" value={fmt(totalComm)} subtitle="5% earned" color="#10b981" />
        <StatCard icon={Users} title="AGENTS" value={uniqueAgents} subtitle="active" color="#f59e0b" />
      </div>

      <div className="tx-toolbar">
        <div className="search-bar"><Search size={18} className="search-icon" /><input type="text" placeholder="Search by ID, farmer, or agent..." value={search} onChange={e => setSearch(e.target.value)} className="search-input" /></div>
        <button onClick={() => { setEditItem(null); setFormOpen(true); }} className="add-btn purple"><Plus size={18} /> Add Sale</button>
      </div>

      <div className="tx-table-section">
        {filtered.length === 0 ? (
          <div className="empty-state"><TrendingUp size={48} /><h3>{search ? 'No sales match' : 'No sales recorded yet'}</h3></div>
        ) : (
          <div className="tx-table-wrap">
            <table className="tx-table">
              <thead><tr><th>ID</th><th>DATE</th><th>AGENT</th><th>FARMER</th><th>AMOUNT</th><th>COMMISSION</th><th></th></tr></thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.SaleId || s.SaleIdNum}>
                    <td className="id-cell">{s.SaleId}</td>
                    <td>{fmtDate(s.SaleDate)}</td>
                    <td className="name-cell">{s.AgentName || s.AgentId}</td>
                    <td>{s.FarmerName || s.FarmerId}</td>
                    <td className="amount-cell">{fmt(s.SaleAmount)}</td>
                    <td className="commission-cell">{fmt(s.Commission)}</td>
                    <td className="actions-cell">
                      <button type='button' title="Edit sale" className="action-btn edit" onClick={() => { setEditItem(s); setFormOpen(true); }}><Edit3 size={14} /></button>
                      <button type='button' title="Delete sale" className="action-btn delete" onClick={() => handleDelete(s.SaleId)}><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <SaleForm
        isOpen={formOpen}
        onSaved={() => { load(); setFormOpen(false); setEditItem(null); }}
        onClose={() => { setFormOpen(false); setEditItem(null); }}
      />
    </div>
  );
};

export default Sales;