import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { RotateCcw } from 'lucide-react';
import api from '../../api/axios.js';
import { useToast } from '../../context/ToastContext.jsx';
import Loader from '../../components/Loader.jsx';

const STATUS_COLORS = {
  Requested: 'bg-blush text-ink/70',
  Approved: 'bg-mint text-mehendi-dark',
  Rejected: 'bg-ink/10 text-ink/50',
  'Refund Initiated': 'bg-lavender text-indigo_ink',
  'Refund Completed': 'bg-mehendi/20 text-mehendi-dark',
};

const Returns = () => {
  const { showToast } = useToast();
  const [returns, setReturns] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReturns = () => api.get('/returns/my').then((res) => { setReturns(res.data); setLoading(false); });
  useEffect(() => { fetchReturns(); }, []);

  const chooseRefundMethod = async (returnId, method) => {
    try {
      await api.put(`/returns/${returnId}/refund`, { refundMethod: method });
      showToast('Refund method selected!', 'success');
      fetchReturns();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading) return <Loader />;

  if (returns.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-10 shadow-soft text-center">
        <RotateCcw size={40} className="mx-auto text-ink/20 mb-3" />
        <p className="font-display font-semibold text-lg text-ink mb-1">No return requests</p>
        <p className="text-ink/50 text-sm">Returns you request will show up here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Helmet><title>Returns & Refunds — Utsaah</title></Helmet>
      {returns.map((r) => (
        <div key={r._id} className="bg-white rounded-3xl p-5 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <p className="font-display font-semibold text-ink text-sm">Order #{r.order?.orderNumber}</p>
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[r.status] || 'bg-blush'}`}>{r.status}</span>
          </div>
          <p className="text-sm text-ink/60">Reason: {r.reason}</p>
          {r.description && <p className="text-sm text-ink/50 mt-1">{r.description}</p>}

          {r.status === 'Approved' && (
            <div className="mt-3 pt-3 border-t border-ink/5">
              <p className="text-xs font-semibold text-ink/60 mb-2">Choose your refund method:</p>
              <div className="flex gap-2">
                <button onClick={() => chooseRefundMethod(r._id, 'wallet')} className="btn-sticker bg-rani text-white px-4 py-2 text-xs">Utsaah Wallet (Instant)</button>
                <button onClick={() => chooseRefundMethod(r._id, 'original_payment')} className="btn-sticker bg-blush text-ink px-4 py-2 text-xs">Original Payment (5-7 days)</button>
              </div>
            </div>
          )}
          {r.refundMethod && r.refundStatus !== 'not_started' && (
            <p className="text-xs text-mehendi font-semibold mt-2">
              Refund via {r.refundMethod === 'wallet' ? 'Utsaah Wallet' : 'Original Payment Method'} — {r.refundStatus === 'processed' ? 'Completed ✅' : 'Processing…'}
            </p>
          )}
        </div>
      ))}
    </div>
  );
};

export default Returns;
