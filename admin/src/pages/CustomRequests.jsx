import { useState, useEffect } from 'react';
import api, { resolveImage } from '../api/axios.js';
import { useToast } from '../context/ToastContext.jsx';
import Loader from '../components/Loader.jsx';
import Modal from '../components/Modal.jsx';
import StatusPill from '../components/StatusPill.jsx';

const STATUSES = ['New', 'In Discussion', 'Quotation Sent', 'Accepted', 'Converted To Order', 'Declined'];

const CustomRequests = () => {
  const { showToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(null);
  const [status, setStatus] = useState('');
  const [adminReply, setAdminReply] = useState('');
  const [quotedPrice, setQuotedPrice] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchAll = () => api.get('/custom-requests/admin/all').then((res) => { setRequests(res.data); setLoading(false); });
  useEffect(() => { fetchAll(); }, []);

  const openRequest = (r) => {
    setActive(r);
    setStatus(r.status);
    setAdminReply(r.adminReply || '');
    setQuotedPrice(r.quotedPrice || '');
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put(`/custom-requests/${active._id}`, { status, adminReply, quotedPrice });
      showToast('Request updated — customer notified', 'success');
      setActive(null);
      fetchAll();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-ink mb-1">Custom Order Requests</h1>
      <p className="text-ink/50 text-sm mb-6">{requests.length} requests</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {requests.map((r) => (
          <button key={r._id} onClick={() => openRequest(r)} className="text-left bg-white rounded-3xl p-5 shadow-soft hover:shadow-card transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <p className="font-display font-semibold text-ink text-sm">{r.productType}</p>
              <StatusPill status={r.status} />
            </div>
            <p className="text-xs text-ink/50">{r.name} · {r.contactPreference}</p>
            <p className="text-xs text-ink/40 mt-1">{new Date(r.createdAt).toLocaleDateString()}</p>
            {r.inspirationImages?.length > 0 && (
              <div className="flex gap-1.5 mt-3">
                {r.inspirationImages.slice(0, 3).map((img, i) => (
                  <img key={i} src={resolveImage(img)} alt="" className="w-10 h-10 rounded-lg object-cover bg-blush" />
                ))}
              </div>
            )}
          </button>
        ))}
        {requests.length === 0 && <p className="text-ink/40 text-sm col-span-full text-center py-12">No custom requests yet.</p>}
      </div>

      {active && (
        <Modal title={active.productType} onClose={() => setActive(null)}>
          <div className="mb-4 space-y-1 text-sm text-ink/60">
            <p><span className="font-semibold text-ink">Name:</span> {active.name}</p>
            <p><span className="font-semibold text-ink">Contact:</span> {active.email} · {active.phone} ({active.contactPreference})</p>
            {active.preferredColors && <p><span className="font-semibold text-ink">Colours:</span> {active.preferredColors}</p>}
            {active.preferredSize && <p><span className="font-semibold text-ink">Size:</span> {active.preferredSize}</p>}
            {active.notes && <p><span className="font-semibold text-ink">Notes:</span> {active.notes}</p>}
          </div>
          {active.inspirationImages?.length > 0 && (
            <div className="flex gap-2 mb-4 flex-wrap">
              {active.inspirationImages.map((img, i) => (
                <img key={i} src={resolveImage(img)} alt="" className="w-20 h-20 rounded-xl object-cover bg-blush" />
              ))}
            </div>
          )}
          <form onSubmit={handleSave} className="space-y-3 pt-3 border-t-2 border-ink/5">
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-blush/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none">
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <input type="number" placeholder="Quoted Price ₹" value={quotedPrice} onChange={(e) => setQuotedPrice(e.target.value)} className="w-full bg-blush/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none" />
            <textarea placeholder="Reply to customer…" rows={3} value={adminReply} onChange={(e) => setAdminReply(e.target.value)} className="w-full bg-blush/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none" />
            <button disabled={saving} className="btn-sticker bg-rani text-white px-6 py-3 text-sm disabled:opacity-60">{saving ? 'Saving…' : 'Save & Notify Customer'}</button>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default CustomRequests;
