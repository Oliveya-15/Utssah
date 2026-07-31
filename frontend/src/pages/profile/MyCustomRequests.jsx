import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import api from '../../api/axios.js';
import Loader from '../../components/Loader.jsx';

const STATUS_COLORS = {
  New: 'bg-blush text-ink/70',
  'In Discussion': 'bg-lavender text-indigo_ink',
  'Quotation Sent': 'bg-butter text-marigold-dark',
  Accepted: 'bg-mint text-mehendi-dark',
  'Converted To Order': 'bg-mehendi/20 text-mehendi-dark',
  Declined: 'bg-ink/10 text-ink/50',
};

const MyCustomRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/custom-requests/my').then((res) => { setRequests(res.data); setLoading(false); });
  }, []);

  if (loading) return <Loader />;

  if (requests.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-10 shadow-soft text-center">
        <Sparkles size={40} className="mx-auto text-ink/20 mb-3" />
        <p className="font-display font-semibold text-lg text-ink mb-1">No custom requests yet</p>
        <Link to="/custom-orders" className="text-sm font-semibold text-rani hover:underline">Start a Custom Order →</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Helmet><title>Custom Requests — Utsaah</title></Helmet>
      {requests.map((r) => (
        <div key={r._id} className="bg-white rounded-3xl p-5 shadow-soft">
          <div className="flex items-center justify-between mb-2">
            <p className="font-display font-semibold text-ink text-sm">{r.productType}</p>
            <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[r.status] || 'bg-blush'}`}>{r.status}</span>
          </div>
          <p className="text-sm text-ink/50">Submitted {new Date(r.createdAt).toLocaleDateString()}</p>
          {r.quotedPrice > 0 && <p className="text-sm font-semibold text-ink mt-1">Quoted Price: ₹{r.quotedPrice}</p>}
          {r.adminReply && <p className="text-sm text-ink/60 mt-2 bg-blush/50 rounded-xl p-3">"{r.adminReply}"</p>}
        </div>
      ))}
    </div>
  );
};

export default MyCustomRequests;
