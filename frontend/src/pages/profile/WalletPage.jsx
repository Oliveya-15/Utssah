import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Wallet } from 'lucide-react';
import api from '../../api/axios.js';
import Loader from '../../components/Loader.jsx';

const WalletPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/users/wallet').then((res) => { setData(res.data); setLoading(false); });
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="space-y-6">
      <Helmet><title>Wallet — Utsaah</title></Helmet>

      <div className="bg-gradient-to-br from-rani to-rani-dark rounded-3xl p-7 text-white shadow-card">
        <div className="flex items-center gap-2 mb-2 opacity-80">
          <Wallet size={18} /> <span className="text-sm font-semibold">Utsaah Wallet Balance</span>
        </div>
        <p className="font-display font-bold text-4xl">₹{data.balance}</p>
        <p className="text-xs opacity-70 mt-2">Use your wallet balance directly at checkout on your next order.</p>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-soft">
        <h3 className="font-display font-bold text-lg text-ink mb-4">Wallet Usage History</h3>
        {data.usageHistory.length === 0 ? (
          <p className="text-ink/50 text-sm py-6 text-center">No wallet transactions yet.</p>
        ) : (
          <div className="space-y-2">
            {data.usageHistory.map((o) => (
              <div key={o._id} className="flex justify-between items-center py-2.5 border-b border-ink/5 last:border-0">
                <div>
                  <p className="text-sm font-semibold text-ink">Order #{o.orderNumber}</p>
                  <p className="text-xs text-ink/40">{new Date(o.createdAt).toLocaleDateString()}</p>
                </div>
                <p className="text-sm font-display font-bold text-rani">−₹{o.walletUsed}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WalletPage;
