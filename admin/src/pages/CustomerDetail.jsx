import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Mail, Phone, Cake } from 'lucide-react';
import api from '../api/axios.js';
import { useToast } from '../context/ToastContext.jsx';
import Loader from '../components/Loader.jsx';
import StatusPill from '../components/StatusPill.jsx';

const CustomerDetail = () => {
  const { id } = useParams();
  const { showToast } = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = () => api.get(`/users/admin/customers/${id}`).then((res) => { setData(res.data); setLoading(false); });
  useEffect(() => { fetchData(); }, [id]);

  const toggleActive = async () => {
    try {
      await api.put(`/users/admin/customers/${id}/toggle-active`);
      showToast('Account status updated', 'success');
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading) return <Loader fullScreen />;
  if (!data) return <p className="text-center py-20 text-ink/50">Customer not found.</p>;

  const { customer, orders } = data;

  return (
    <div>
      <Link to="/customers" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink/50 hover:text-rani mb-4"><ArrowLeft size={15} /> Back to Customers</Link>

      <div className="bg-white rounded-3xl p-6 shadow-soft mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-rani text-white font-display font-bold text-xl flex items-center justify-center shrink-0">
            {customer.name[0].toUpperCase()}
          </div>
          <div>
            <h1 className="font-display font-bold text-xl text-ink">{customer.name}</h1>
            <div className="flex flex-wrap gap-3 text-xs text-ink/50 mt-1">
              <span className="flex items-center gap-1"><Mail size={12} /> {customer.email}</span>
              {customer.phone && <span className="flex items-center gap-1"><Phone size={12} /> {customer.phone}</span>}
              {customer.birthday && <span className="flex items-center gap-1"><Cake size={12} /> {new Date(customer.birthday).toLocaleDateString()}</span>}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatusPill status={customer.isActive ? 'Active' : 'Inactive'} />
          <button onClick={toggleActive} className="btn-sticker bg-blush text-ink px-4 py-2 text-xs">
            {customer.isActive ? 'Deactivate' : 'Activate'} Account
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 shadow-soft text-center">
          <p className="text-2xl font-display font-bold text-ink">{orders.length}</p>
          <p className="text-xs text-ink/50 font-semibold">Total Orders</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-soft text-center">
          <p className="text-2xl font-display font-bold text-ink">₹{orders.reduce((s, o) => s + o.totalAmount, 0)}</p>
          <p className="text-xs text-ink/50 font-semibold">Total Spent</p>
        </div>
        <div className="bg-white rounded-2xl p-4 shadow-soft text-center">
          <p className="text-2xl font-display font-bold text-ink">₹{customer.walletBalance}</p>
          <p className="text-xs text-ink/50 font-semibold">Wallet Balance</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-soft overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr className="text-left text-ink/40 text-xs font-semibold border-b-2 border-ink/5">
              <th className="p-4">Order #</th><th className="p-4">Items</th><th className="p-4">Total</th><th className="p-4">Status</th><th className="p-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id} className="border-b border-ink/5 last:border-0">
                <td className="p-4 font-semibold text-ink">#{o.orderNumber}</td>
                <td className="p-4 text-ink/60">{o.items.length}</td>
                <td className="p-4 font-semibold text-ink">₹{o.totalAmount}</td>
                <td className="p-4"><StatusPill status={o.orderStatus} /></td>
                <td className="p-4 text-ink/50 text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && <p className="text-center py-12 text-ink/40 text-sm">No orders yet.</p>}
      </div>
    </div>
  );
};

export default CustomerDetail;
