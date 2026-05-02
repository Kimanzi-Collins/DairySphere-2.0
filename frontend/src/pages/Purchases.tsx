import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ShoppingCart, DollarSign, Package, Users, Search, Plus, Edit3, Trash2 } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import PurchaseForm from '../components/forms/PurchaseForm';
import '../styles/Transactions.css';

const API = 'http://localhost:3001/api';

const Purchases = () => {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [, setEditItem] = useState<any>(null);
  const animated = useRef(false);

  const load = async () => {
    try { const res = await fetch(`${API}/input-purchases`); const data = await res.json(); setPurchases(Array.isArray(data) ? data : data.recordset ?? []); }
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

  const total = purchases.length;
  const totalAmount = purchases.reduce((s, p) => s + Number(p.PurchaseAmount || 0), 0);
  const uniqueInputs = [...new Set(purchases.map(p => p.InputName))].length;
  const uniqueFarmers = [...new Set(purchases.map(p => p.FarmerId))].length;

  const filtered = purchases.filter(p =>
    (p.PurchaseId || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.FarmerName || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.InputName || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this purchase?')) return;
    try { await fetch(`${API}/input-purchases/${id}`, { method: 'DELETE' }); load(); } catch (err: any) { alert(err.message); }
  };

  if (loading) return <div className="page-loading"><div className="loading-spinner" /><p>Loading purchases...</p></div>;

  return (
    <div className="tx-page">
      <div className="tx-page-header"><h1 className="page-title">Purchases Management</h1><p className="page-date">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p></div>

      <div className="tx-stats">
        <StatCard icon={ShoppingCart} title="TOTAL PURCHASES" value={total} subtitle="records" color="#10b981" />
        <StatCard icon={DollarSign} title="TOTAL AMOUNT" value={fmt(totalAmount)} subtitle="spent" color="#ef4444" />
        <StatCard icon={Package} title="UNIQUE ITEMS" value={uniqueInputs} subtitle="purchased" color="#8b5cf6" />
        <StatCard icon={Users} title="FARMERS" value={uniqueFarmers} subtitle="with purchases" color="#f59e0b" />
      </div>

      <div className="tx-toolbar">
        <div className="search-bar"><Search size={18} className="search-icon" /><input type="text" placeholder="Search by ID, farmer, or input..." value={search} onChange={e => setSearch(e.target.value)} className="search-input" /></div>
        <button onClick={() => { setEditItem(null); setFormOpen(true); }} className="add-btn green"><Plus size={18} /> Add Purchase</button>
      </div>

      <div className="tx-table-section">
        {filtered.length === 0 ? (
          <div className="empty-state"><ShoppingCart size={48} /><h3>{search ? 'No purchases match' : 'No purchases recorded yet'}</h3></div>
        ) : (
          <div className="tx-table-wrap">
            <table className="tx-table">
              <thead><tr><th>ID</th><th>FARMER</th><th>INPUT</th><th>PRICE</th><th>QTY</th><th>AMOUNT</th><th>DATE</th><th></th></tr></thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.PurchaseId || p.PurchaseIdNum}>
                    <td className="id-cell">{p.PurchaseId}</td>
                    <td className="name-cell">{p.FarmerName || p.FarmerId}</td>
                    <td>{p.InputName}</td>
                    <td>{fmt(p.InputPrice)}</td>
                    <td>{p.Quantity}</td>
                    <td className="amount-cell">{fmt(p.PurchaseAmount)}</td>
                    <td>{fmtDate(p.DateOfPurchase)}</td>
                    <td className="actions-cell">
                      <button  type="button" title="Edit purchase" className="action-btn edit" onClick={() => { setEditItem(p); setFormOpen(true); }}><Edit3 size={14} /></button>
                      <button  type="button" title="Delete purchase" className="action-btn delete" onClick={() => handleDelete(p.PurchaseId)}><Trash2 size={14} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <PurchaseForm
        isOpen={formOpen}
        onSaved={() => { load(); setFormOpen(false); setEditItem(null); }}
        onClose={() => { setFormOpen(false); setEditItem(null); }}
      />
    </div>
  );
};

export default Purchases;