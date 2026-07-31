import { useState, useEffect } from 'react';
import api from '../api/axios.js';
import { useToast } from '../context/ToastContext.jsx';
import Loader from '../components/Loader.jsx';
import StatusPill from '../components/StatusPill.jsx';

const Returns = () => {
  const { showToast } = useToast();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = () => api.get('/returns/admin/all').then((res) => { setReturns(res.data); setLoading(false); });
  useEffect(() => { fetchAll(); }, []);

  const decide = async (id, decision) => {
    try {
      await api.put(`/returns/${id}/decision`, { decision });
      showToast(`Return ${decision.toLowerCase()}`, 'success');
      fetchAll();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const markCompleted = async (id) => {
    try {
      await api.put(`/returns/${id}/complete`);
      showToast('Refund marked as completed', 'success');
      fetchAll();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-ink mb-1">Returns &amp; Refunds</h1>
      <p className="text-ink/50 text-sm mb-6">{returns.length} return requests</p>

      <div className="space-y-4">
        {returns.map((r) => (
          <div key={r._id} className="bg-white rounded-3xl p-5 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
              <div>
                <p className="font-display font-semibold text-ink">Order #{r.order?.orderNumber}</p>
                <p className="text-xs text-ink/50">{r.user?.name} · {r.user?.email}</p>
              </div>
              <StatusPill status={r.status} />
            </div>
            <p className="text-sm text-ink/60"><span className="font-semibold">Reason:</span> {r.reason}</p>
            {r.description && <p className="text-sm text-ink/50 mt-1">{r.description}</p>}
            <p className="text-xs text-ink/40 mt-2">Requested {new Date(r.requestedAt).toLocaleDateString()} · Order total ₹{r.order?.totalAmount}</p>

            {r.status === 'Requested' && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-ink/5">
                <button onClick={() => decide(r._id, 'Approved')} className="btn-sticker bg-mehendi text-white px-4 py-2 text-xs">Approve Return</button>
                <button onClick={() => decide(r._id, 'Rejected')} className="btn-sticker bg-ink/10 text-ink px-4 py-2 text-xs">Reject</button>
              </div>
            )}
            {r.status === 'Refund Initiated' && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-ink/5 items-center">
                <p className="text-xs text-ink/50">Waiting for manual refund via original payment method.</p>
                <button onClick={() => markCompleted(r._id)} className="btn-sticker bg-rani text-white px-4 py-2 text-xs">Mark Refund Completed</button>
              </div>
            )}
            {r.refundStatus === 'processed' && (
              <p className="text-xs text-mehendi font-semibold mt-3">✅ Refund of ₹{r.refundAmount} completed via {r.refundMethod === 'wallet' ? 'Wallet' : 'Original Payment'}</p>
            )}
          </div>
        ))}
        {returns.length === 0 && <p className="text-center py-16 text-ink/40 text-sm bg-white rounded-3xl shadow-soft">No return requests yet.</p>}
      </div>
    </div>
  );
};

export default Returns;
