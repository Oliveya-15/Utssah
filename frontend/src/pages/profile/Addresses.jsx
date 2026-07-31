import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Plus, Trash2, Edit2, Star, LocateFixed } from 'lucide-react';
import api from '../../api/axios.js';
import { useToast } from '../../context/ToastContext.jsx';
import Loader from '../../components/Loader.jsx';

const emptyAddress = { label: 'Home', fullName: '', phone: '', fullAddress: '', city: '', state: '', country: 'India', postalCode: '' };

const Addresses = () => {
  const { showToast } = useToast();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyAddress);
  const [geoCoords, setGeoCoords] = useState(null);
  const [locating, setLocating] = useState(false);

  const fetchAddresses = () => {
    api.get('/users/addresses').then((res) => { setAddresses(res.data); setLoading(false); });
  };

  useEffect(fetchAddresses, []);

  const startEdit = (addr) => {
    setForm(addr);
    setEditingId(addr._id);
    setShowForm(true);
  };

  const startNew = () => {
    setForm(emptyAddress);
    setEditingId(null);
    setGeoCoords(null);
    setShowForm(true);
  };

  const handleUseLocation = () => {
    if (!navigator.geolocation) return showToast('Geolocation not supported', 'error');
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        showToast('Location captured 📍', 'success');
        setLocating(false);
      },
      () => { showToast('Could not access location', 'info'); setLocating(false); }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, ...(geoCoords || {}) };
      if (editingId) {
        await api.put(`/users/addresses/${editingId}`, payload);
        showToast('Address updated', 'success');
      } else {
        await api.post('/users/addresses', payload);
        showToast('Address added', 'success');
      }
      setShowForm(false);
      fetchAddresses();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/users/addresses/${id}`);
      showToast('Address removed', 'success');
      fetchAddresses();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSetDefault = async (addr) => {
    await api.put(`/users/addresses/${addr._id}`, { ...addr, isDefault: true });
    fetchAddresses();
  };

  if (loading) return <Loader />;

  return (
    <div className="bg-white rounded-3xl p-6 shadow-soft">
      <Helmet><title>My Addresses — Utsaah</title></Helmet>
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-display font-bold text-lg text-ink">Saved Addresses</h2>
        <button onClick={startNew} className="btn-sticker bg-rani text-white px-4 py-2.5 text-sm">
          <Plus size={16} /> Add New
        </button>
      </div>

      {addresses.length === 0 && !showForm && (
        <p className="text-ink/50 text-sm py-8 text-center">No saved addresses yet.</p>
      )}

      <div className="space-y-3">
        {addresses.map((addr) => (
          <div key={addr._id} className="border-2 border-ink/10 rounded-2xl p-4 flex items-start justify-between gap-3">
            <div>
              <p className="font-display font-semibold text-ink text-sm flex items-center gap-2">
                {addr.fullName} <span className="text-xs font-normal text-ink/40">({addr.label})</span>
                {addr.isDefault && <span className="text-[10px] bg-marigold/30 text-marigold-dark px-2 py-0.5 rounded-full font-semibold">Default</span>}
              </p>
              <p className="text-sm text-ink/60">{addr.fullAddress}, {addr.city}, {addr.state} {addr.postalCode}</p>
              <p className="text-sm text-ink/50">{addr.phone}</p>
            </div>
            <div className="flex gap-1.5 shrink-0">
              {!addr.isDefault && (
                <button onClick={() => handleSetDefault(addr)} title="Set as default" className="w-8 h-8 rounded-full hover:bg-blush flex items-center justify-center text-ink/40 hover:text-marigold">
                  <Star size={15} />
                </button>
              )}
              <button onClick={() => startEdit(addr)} className="w-8 h-8 rounded-full hover:bg-blush flex items-center justify-center text-ink/40 hover:text-rani">
                <Edit2 size={15} />
              </button>
              <button onClick={() => handleDelete(addr._id)} className="w-8 h-8 rounded-full hover:bg-blush flex items-center justify-center text-ink/40 hover:text-rani">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-5 pt-5 border-t-2 border-ink/5 space-y-3">
          <div className="grid sm:grid-cols-3 gap-3">
            {['Home', 'Work', 'Other'].map((l) => (
              <button type="button" key={l} onClick={() => setForm({ ...form, label: l })} className={`px-4 py-2 rounded-xl text-sm font-semibold ${form.label === l ? 'bg-rani text-white' : 'bg-blush text-ink/60'}`}>
                {l}
              </button>
            ))}
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <input required placeholder="Full Name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="bg-blush/60 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none" />
            <input required placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-blush/60 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none" />
          </div>
          <textarea required placeholder="Full Address" value={form.fullAddress} onChange={(e) => setForm({ ...form, fullAddress: e.target.value })} rows={2} className="w-full bg-blush/60 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none" />
          <div className="grid sm:grid-cols-3 gap-3">
            <input required placeholder="City" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="bg-blush/60 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none" />
            <input required placeholder="State" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="bg-blush/60 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none" />
            <input required placeholder="Postal Code" value={form.postalCode} onChange={(e) => setForm({ ...form, postalCode: e.target.value })} className="bg-blush/60 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none" />
          </div>
          <button type="button" onClick={handleUseLocation} disabled={locating} className="flex items-center gap-1.5 text-xs font-semibold text-indigo_ink hover:text-rani">
            <LocateFixed size={14} /> {locating ? 'Locating…' : geoCoords ? 'Location captured ✓' : 'Use my current location'}
          </button>
          <div className="flex gap-2 pt-1">
            <button type="submit" className="btn-sticker bg-rani text-white px-5 py-2.5 text-sm">Save Address</button>
            <button type="button" onClick={() => setShowForm(false)} className="btn-sticker bg-blush text-ink px-5 py-2.5 text-sm">Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default Addresses;
