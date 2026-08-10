import { useState, useEffect } from 'react';
import { Save, QrCode, MessageCircle } from 'lucide-react';
import api from '../api/axios.js';
import { useToast } from '../context/ToastContext.jsx';
import Loader from '../components/Loader.jsx';

const Settings = () => {
  const { showToast } = useToast();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api.get('/settings/admin').then((res) => { setForm(res.data); setLoading(false); });
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/settings/admin', form);
      setForm(data);
      showToast('Settings saved ✅', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) return <Loader fullScreen />;

  return (
    <div className="max-w-2xl">
      <h1 className="font-display font-bold text-3xl text-ink mb-1">Payment Settings</h1>
      <p className="text-ink/50 text-sm mb-6">
        Utsaah takes payment via UPI QR — no gateway needed. Set up both owners' UPI IDs here and switch the
        "active" one any time (e.g. when only one of you is available). Customers always see whichever is active.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-3xl p-6 shadow-soft">
          <h3 className="font-display font-bold text-lg text-ink mb-1 flex items-center gap-2"><QrCode size={18} className="text-rani" /> UPI Owners</h3>
          <p className="text-xs text-ink/40 mb-4">Only the active owner's UPI ID is ever shown to customers.</p>

          <div className="grid sm:grid-cols-2 gap-5">
            <div className={`rounded-2xl p-4 border-2 ${form.activeOwner === 'one' ? 'border-rani bg-blush/40' : 'border-ink/10'}`}>
              <label className="flex items-center gap-2 mb-3 cursor-pointer">
                <input type="radio" name="activeOwner" value="one" checked={form.activeOwner === 'one'} onChange={handleChange} className="accent-rani" />
                <span className="text-sm font-display font-semibold text-ink">Active for checkout</span>
              </label>
              <input name="ownerOneName" placeholder="Owner 1 Name" value={form.ownerOneName} onChange={handleChange} className="w-full bg-blush/60 rounded-xl px-3.5 py-2.5 text-sm mb-2 focus:outline-none" />
              <input name="ownerOneUpiId" placeholder="UPI ID (e.g. name@okhdfcbank)" value={form.ownerOneUpiId} onChange={handleChange} className="w-full bg-blush/60 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none" />
            </div>

            <div className={`rounded-2xl p-4 border-2 ${form.activeOwner === 'two' ? 'border-rani bg-blush/40' : 'border-ink/10'}`}>
              <label className="flex items-center gap-2 mb-3 cursor-pointer">
                <input type="radio" name="activeOwner" value="two" checked={form.activeOwner === 'two'} onChange={handleChange} className="accent-rani" />
                <span className="text-sm font-display font-semibold text-ink">Active for checkout</span>
              </label>
              <input name="ownerTwoName" placeholder="Owner 2 Name" value={form.ownerTwoName} onChange={handleChange} className="w-full bg-blush/60 rounded-xl px-3.5 py-2.5 text-sm mb-2 focus:outline-none" />
              <input name="ownerTwoUpiId" placeholder="UPI ID (e.g. name@okicici)" value={form.ownerTwoUpiId} onChange={handleChange} className="w-full bg-blush/60 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-soft">
          <h3 className="font-display font-bold text-lg text-ink mb-1 flex items-center gap-2"><MessageCircle size={18} className="text-rani" /> WhatsApp</h3>
          <p className="text-xs text-ink/40 mb-4">Shown to customers who'd rather confirm before paying. Include the country code, digits only (e.g. 919876543210).</p>
          <input name="whatsappNumber" placeholder="91 74300 63257" value={form.whatsappNumber} onChange={handleChange} className="w-full bg-blush/60 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none" />
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-soft">
          <h3 className="font-display font-bold text-lg text-ink mb-3">Business Name</h3>
          <input name="businessName" value={form.businessName} onChange={handleChange} className="w-full bg-blush/60 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none" />
          <p className="text-xs text-ink/40 mt-2">Shown as the payee name in the UPI app during payment.</p>
        </div>

        <button disabled={saving} className="btn-sticker bg-rani text-white px-6 py-3 text-sm disabled:opacity-60">
          <Save size={16} /> {saving ? 'Saving…' : 'Save Settings'}
        </button>
      </form>
    </div>
  );
};

export default Settings;