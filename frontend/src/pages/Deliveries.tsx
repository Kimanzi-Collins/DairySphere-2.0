import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { FileText, Droplet, DollarSign, TrendingUp, Search, Plus, Edit3, Trash2, TruckElectric } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import DeliveryForm from '../components/forms/DeliveryForm';
import '../styles/Transactions.css';

const API = 'http://localhost:3001/api';

const Deliveries = () => {
  const [deliveries, setDeliveries] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [, setEditItem] = useState<any>(null);
  const animated = useRef(false);

  const load = async () => {
    try {
      const res = await fetch(`${API}/deliveries`);
      const data = await res.json();
      setDeliveries(Array.isArray(data) ? data : data.recordset ?? []);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
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

  const totalDeliveries = deliveries.length;
  const totalLitres = deliveries.reduce((s, d) => s + Number(d.MilkQuantity || 0), 0);
  const totalAmount = deliveries.reduce((s, d) => s + Number(d.Amount || 0), 0);
  const avgLitres = totalDeliveries > 0 ? totalLitres / totalDeliveries : 0;

  const filtered = deliveries.filter(d =>
    (d.DeliveryId || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.BatchRef || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.FarmerName || '').toLowerCase().includes(search.toLowerCase()) ||
    (d.FactoryName || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this delivery?')) return;
    try { await fetch(`${API}/deliveries/${id}`, { method: 'DELETE' }); load(); } catch (err: any) { alert(err.message); }
  };

  if (loading) return <div className="page-loading"><div className="loading-spinner" /><p>Loading deliveries...</p></div>;

  return (
    <div className="tx-page">
      <div className="tx-page-header"><h1 className="page-title">Deliveries Management</h1><p className="page-date">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p></div>

      <div className="tx-stats">
        <StatCard icon={TruckElectric} title="TOTAL DELIVERIES" value={totalDeliveries} subtitle="records" color="#3b82f6" />
        <StatCard icon={Droplet} title="TOTAL LITRES" value={`${totalLitres.toLocaleString('en-KE', { minimumFractionDigits: 2 })} L`} subtitle="milk received" color="#10b981" />
        <StatCard icon={DollarSign} title="TOTAL AMOUNT" value={fmt(totalAmount)} subtitle="paid out" color="#8b5cf6" />
        <StatCard icon={TrendingUp} title="AVG / DELIVERY" value={`${avgLitres.toFixed(2)} L`} subtitle="per delivery" color="#f59e0b" />
      </div>

      <div className="tx-toolbar">
        <div className="search-bar"><Search size={18} className="search-icon" /><input type="text" placeholder="Search by ID, batch, farmer, factory..." value={search} onChange={e => setSearch(e.target.value)} className="search-input" /></div>
        <button onClick={() => { setEditItem(null); setFormOpen(true); }} className="add-btn blue"><Plus size={18} /> Add Delivery</button>
      </div>

      <div className="tx-table-section">
        {filtered.length === 0 ? (
          <div className="empty-state"><FileText size={48} /><h3>{search ? 'No deliveries match' : 'No deliveries recorded yet'}</h3></div>
        ) : (
          <div className="tx-table-wrap">
            <table className="tx-table">
              <thead><tr>
                <th>ID</th><th>BATCH</th><th>FARMER</th><th>LITRES</th><th>GRADE</th><th>RATE</th><th>FACTORY</th><th>DATE</th><th>AMOUNT</th><th></th>
              </tr></thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d.DeliveryId || d.DeliveryIdNum}>
                    <td className="id-cell">{d.DeliveryId}</td>
                    <td><span className="batch-badge">{d.BatchRef}</span></td>
                    <td className="name-cell">{d.FarmerName || d.FarmerId}</td>
                    <td>{Number(d.MilkQuantity).toLocaleString('en-KE', { minimumFractionDigits: 2 })} L</td>
                    <td><span className="grade-pill">{d.Grade || d.QualityId}</span></td>
                    <td>{fmt(d.RatePerLitre)}</td>
                    <td>{d.FactoryName || d.FactoryId}</td>
                    <td>{fmtDate(d.DeliveryDate)}</td>
                    <td className="amount-cell">{fmt(d.Amount)}</td>
                    <td className="actions-cell">
                      <button type="button" title="Edit delivery" className="action-btn edit" onClick={() => { setEditItem(d); setFormOpen(true); }}><Edit3 size={14} /></button>
                      <button type="button" title="Delete delivery" className="action-btn delete" onClick={() => handleDelete(d.DeliveryId)}><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <DeliveryForm
        isOpen={formOpen}
        onSaved={() => { load(); setFormOpen(false); setEditItem(null); }}
        onClose={() => { setFormOpen(false); setEditItem(null); }}
      />
    </div>
  );
};

export default Deliveries;