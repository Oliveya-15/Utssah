import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Search } from 'lucide-react';
import api from '../api/axios.js';
import Loader from '../components/Loader.jsx';
import StatusPill from '../components/StatusPill.jsx';

const STATUS_FILTERS = [
  'All', 'Order Received', 'Payment Successful', 'Production Started', 'Packed',
  'Shipped', 'Delivered', 'Return Requested', 'Cancelled',
];

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const fetchOrders = (status) => {
    setLoading(true);
    api.get('/orders/admin/all', { params: status && status !== 'All' ? { status } : {} }).then((res) => {
      setOrders(res.data);
      setLoading(false);
    });
  };

  useEffect(() => { fetchOrders(filter); }, [filter]);

  const filtered = orders.filter(
    (o) => o.orderNumber.toLowerCase().includes(search.toLowerCase()) || o.user?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-ink mb-1">Orders</h1>
      <p className="text-ink/50 text-sm mb-6">{orders.length} orders {filter !== 'All' && `· ${filter}`}</p>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-display font-semibold whitespace-nowrap ${filter === s ? 'bg-rani text-white' : 'bg-white text-ink/60 shadow-soft'}`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="relative mb-5 max-w-sm">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
        <input placeholder="Search by order # or customer…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-white rounded-full pl-9 pr-4 py-2.5 text-sm shadow-soft focus:outline-none" />
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="bg-white rounded-3xl shadow-soft overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[700px]">
            <thead>
              <tr className="text-left text-ink/40 text-xs font-semibold border-b-2 border-ink/5">
                <th className="p-4">Order #</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Items</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <tr key={o._id} className="border-b border-ink/5 last:border-0 hover:bg-blush/20">
                  <td className="p-4 font-semibold text-ink">#{o.orderNumber}</td>
                  <td className="p-4 text-ink/70">{o.user?.name}</td>
                  <td className="p-4 text-ink/60">{o.items.length}</td>
                  <td className="p-4 font-semibold text-ink">₹{o.totalAmount}</td>
                  <td className="p-4"><StatusPill status={o.orderStatus} /></td>
                  <td className="p-4 text-ink/50 text-xs">{new Date(o.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <Link to={`/orders/${o._id}`} className="w-8 h-8 rounded-full hover:bg-blush flex items-center justify-center text-ink/40 hover:text-rani ml-auto">
                      <ChevronRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-center py-12 text-ink/40 text-sm">No orders found.</p>}
        </div>
      )}
    </div>
  );
};

export default Orders;
