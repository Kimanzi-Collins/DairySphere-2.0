import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { CreditCard, DollarSign, Clock, Search, Plus, Edit3, Trash2 } from 'lucide-react';
import StatCard from '../components/common/StatCard';
import LoanForm from '../components/forms/LoanForm';
import '../styles/Transactions.css';

const API = 'http://localhost:3001/api';

const Loans = () => {
  const [loans, setLoans] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [, setEditItem] = useState<any>(null);
  const animated = useRef(false);

  const load = async () => {
    try { const res = await fetch(`${API}/loans`); const data = await res.json(); setLoans(Array.isArray(data) ? data : data.recordset ?? []); }
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

  const totalLoans = loans.length;
  const totalAmount = loans.reduce((s, l) => s + Number(l.LoanAmount || 0), 0);
  const avgLoan = totalLoans > 0 ? totalAmount / totalLoans : 0;
  const avgPeriod = totalLoans > 0 ? Math.round(loans.reduce((s, l) => s + Number(l.RepaymentPeriod || 0), 0) / totalLoans) : 0;

  const filtered = loans.filter(l =>
    (l.LoanId || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.FarmerName || '').toLowerCase().includes(search.toLowerCase()) ||
    (l.FarmerId || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this loan?')) return;
    try { await fetch(`${API}/loans/${id}`, { method: 'DELETE' }); load(); } catch (err: any) { alert(err.message); }
  };

  if (loading) return <div className="page-loading"><div className="loading-spinner" /><p>Loading loans...</p></div>;

  return (
    <div className="tx-page">
      <div className="tx-page-header"><h1 className="page-title">Loans Management</h1><p className="page-date">{new Date().toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p></div>

      <div className="tx-stats">
        <StatCard icon={CreditCard} title="TOTAL LOANS" value={totalLoans} subtitle="issued" color="#8b5cf6" />
        <StatCard icon={DollarSign} title="TOTAL AMOUNT" value={fmt(totalAmount)} subtitle="lent out" color="#ef4444" />
        <StatCard icon={DollarSign} title="AVG LOAN" value={fmt(avgLoan)} subtitle="per farmer" color="#3b82f6" />
        <StatCard icon={Clock} title="AVG PERIOD" value={`${avgPeriod} months`} subtitle="repayment" color="#f59e0b" />
      </div>

      <div className="tx-toolbar">
        <div className="search-bar"><Search size={18} className="search-icon" /><input type="text" placeholder="Search by ID or farmer..." value={search} onChange={e => setSearch(e.target.value)} className="search-input" /></div>
        <button onClick={() => { setEditItem(null); setFormOpen(true); }} className="add-btn purple"><Plus size={18} /> Add Loan</button>
      </div>

      <div className="tx-table-section">
        {filtered.length === 0 ? (
          <div className="empty-state"><CreditCard size={48} /><h3>{search ? 'No loans match' : 'No loans recorded yet'}</h3></div>
        ) : (
          <div className="tx-table-wrap">
            <table className="tx-table">
              <thead><tr><th>ID</th><th>FARMER</th><th>AMOUNT</th><th>PERIOD</th><th>DATE BORROWED</th><th>MONTHLY</th><th></th></tr></thead>
              <tbody>
                {filtered.map(l => {
                  const interest = Number(l.LoanAmount) * 0.1 * (Number(l.RepaymentPeriod) / 12);
                  const total = Number(l.LoanAmount) + interest;
                  const monthly = total / Number(l.RepaymentPeriod || 1);
                  return (
                    <tr key={l.LoanId || l.LoanIdNum}>
                      <td className="id-cell">{l.LoanId}</td>
                      <td className="name-cell">{l.FarmerName || l.FarmerId}</td>
                      <td className="amount-cell negative">{fmt(l.LoanAmount)}</td>
                      <td>{l.RepaymentPeriod} months</td>
                      <td>{fmtDate(l.DateBorrowed)}</td>
                      <td>{fmt(monthly)}</td>
                      <td className="actions-cell">
                        <button type='button' title="Edit loan" className="action-btn edit" onClick={() => { setEditItem(l); setFormOpen(true); }}><Edit3 size={14} /></button>
                        <button type='button' title="Delete loan" className="action-btn delete" onClick={() => handleDelete(l.LoanId)}><Trash2 size={14} /></button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <LoanForm
        isOpen={formOpen}
        onSaved={() => { load(); setFormOpen(false); setEditItem(null); }}
        onClose={() => { setFormOpen(false); setEditItem(null); }}
      />
    </div>
  );
};

export default Loans;