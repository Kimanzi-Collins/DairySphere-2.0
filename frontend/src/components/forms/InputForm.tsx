import { useState, useEffect } from 'react';

const API = 'http://localhost:3001/api';

interface Props {
  mode: 'add' | 'edit';
  initialData?: any;
  onSuccess: () => void;
  onClose: () => void;
}

const InputForm = ({ mode, initialData, onSuccess, onClose }: Props) => {
  const [formData, setFormData] = useState({ inputName: '', inputPrice: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setFormData({
        inputName: initialData.InputName || '',
        inputPrice: String(initialData.InputPrice || ''),
      });
    }
  }, [mode, initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const url = mode === 'add' ? `${API}/inputs` : `${API}/inputs/${initialData?.InputId}`;
      const res = await fetch(url, {
        method: mode === 'add' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, inputPrice: Number(formData.inputPrice) }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Failed to save');
      onSuccess();
    } catch (err: any) { setError(err.message); }
    finally { setLoading(false); }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div className="form-error">{error}</div>}
      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">INPUT NAME *</label>
          <input type="text" name="inputName" value={formData.inputName} onChange={handleChange} placeholder="e.g. Dairy Meal" className="form-input" required />
        </div>
        <div className="form-group">
          <label className="form-label">PRICE PER UNIT (Ksh.) *</label>
          <input type="number" name="inputPrice" value={formData.inputPrice} onChange={handleChange} placeholder="e.g. 2500.00" className="form-input" step="0.01" min="0.01" required />
        </div>
      </div>
      <div className="form-actions">
        <button type="button" onClick={onClose} className="btn-cancel">Cancel</button>
        <button type="submit" disabled={loading} className="btn-submit">{loading ? 'Saving...' : mode === 'add' ? 'Add Input' : 'Update Input'}</button>
      </div>
    </form>
  );
};

export default InputForm;
