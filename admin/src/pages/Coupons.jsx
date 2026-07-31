import { useState, useEffect } from 'react';
import { Plus, Trash2, Tag } from 'lucide-react';
import api from '../api/axios.js';
import { useToast } from '../context/ToastContext.jsx';
import Loader from '../components/Loader.jsx';
import Modal from '../components/Modal.jsx';
import StatusPill from '../components/StatusPill.jsx';

const emptyForm = { code: '', discountType: 'percentage', discountValue: '', minimumPurchase: 0, expiryDate: '', usageLimit: 100 };

const Coupons = () => {
  const { showToast } = useToast();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const fetchAll = () => api.get('/coupons/admin/all').then((res) => { setCoupons(res.data); setLoading(false); });
  useEffect(() => { fetchAll(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.post('/coupons', form);
      showToast('Coupon created 🎉', 'success');
      setShowModal(false);
      setForm(emptyForm);
      fetchAll();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (c) => {
    await api.put(`/coupons/${c._id}`, { isActive: !c.isActive });
    fetchAll();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this coupon?')) return;
    await api.delete(`/coupons/${id}`);
    showToast('Coupon deleted', 'success');
    fetchAll();
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-3xl text-ink">Coupons</h1>
          <p className="text-ink/50 text-sm mt-1">{coupons.length} coupon codes</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-sticker bg-rani text-white px-5 py-2.5 text-sm hover:bg-rani-dark">
          <Plus size={16} /> Create Coupon
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map((c) => (
          <div key={c._id} className="bg-white rounded-3xl p-5 shadow-soft">
            <div className="flex items-start justify-between mb-3">
              <span className="flex items-center gap-2 font-display font-bold text-lg text-rani"><Tag size={16} /> {c.code}</span>
              <button onClick={() => handleDelete(c._id)} className="text-ink/30 hover:text-rani"><Trash2 size={15} /></button>
            </div>
            <p className="text-sm text-ink/70 font-semibold mb-1">
              {c.discountType === 'percentage' ? `${c.discountValue}% off` : `₹${c.discountValue} off`}
              {c.minimumPurchase > 0 && ` on orders above ₹${c.minimumPurchase}`}
            </p>
            <p className="text-xs text-ink/40 mb-3">Used {c.usedCount}/{c.usageLimit} · Expires {new Date(c.expiryDate).toLocaleDateString()}</p>
            <label className="flex items-center gap-2 text-xs font-semibold text-ink/60 cursor-pointer">
              <input type="checkbox" checked={c.isActive} onChange={() => toggleActive(c)} className="accent-rani" /> Active
            </label>
          </div>
        ))}
        {coupons.length === 0 && <p className="text-ink/40 text-sm col-span-full text-center py-12">No coupons yet.</p>}
      </div>

      {showModal && (
        <Modal title="Create Coupon" onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input required placeholder="Coupon Code (e.g. FESTIVE20)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} className="w-full bg-blush/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none" />
            <div className="grid grid-cols-2 gap-4">
              <select value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })} className="bg-blush/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none">
                <option value="percentage">Percentage</option>
                <option value="flat">Flat Amount</option>
              </select>
              <input required type="number" placeholder="Value" value={form.discountValue} onChange={(e) => setForm({ ...form, discountValue: e.target.value })} className="bg-blush/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input type="number" placeholder="Min. Purchase ₹" value={form.minimumPurchase} onChange={(e) => setForm({ ...form, minimumPurchase: e.target.value })} className="bg-blush/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none" />
              <input type="number" placeholder="Usage Limit" value={form.usageLimit} onChange={(e) => setForm({ ...form, usageLimit: e.target.value })} className="bg-blush/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink/50 mb-1.5">Expiry Date</label>
              <input required type="date" value={form.expiryDate} onChange={(e) => setForm({ ...form, expiryDate: e.target.value })} className="w-full bg-blush/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none" />
            </div>
            <div className="flex gap-2 pt-2">
              <button disabled={saving} className="btn-sticker bg-rani text-white px-6 py-3 text-sm disabled:opacity-60">{saving ? 'Creating…' : 'Create Coupon'}</button>
              <button type="button" onClick={() => setShowModal(false)} className="btn-sticker bg-blush text-ink px-6 py-3 text-sm">Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Coupons;
