import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Package, ChevronRight } from 'lucide-react';
import api, { resolveImage } from '../../api/axios.js';
import Loader from '../../components/Loader.jsx';

const STATUS_COLORS = {
  'Order Received': 'bg-blush text-ink/70',
  'Payment Successful': 'bg-mint text-mehendi-dark',
  'Production Started': 'bg-butter text-marigold-dark',
  'Shipped': 'bg-lavender text-indigo_ink',
  'Delivered': 'bg-mehendi/20 text-mehendi-dark',
  'Cancelled': 'bg-ink/10 text-ink/50',
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my').then((res) => { setOrders(res.data); setLoading(false); });
  }, []);

  if (loading) return <Loader />;

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-10 shadow-soft text-center">
        <Package size={40} className="mx-auto text-ink/20 mb-3" />
        <p className="font-display font-semibold text-lg text-ink mb-1">No orders yet</p>
        <p className="text-ink/50 text-sm mb-5">Your handmade treasures will show up here.</p>
        <Link to="/shop" className="btn-sticker bg-rani text-white px-6 py-2.5 text-sm inline-flex">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Helmet><title>My Orders — Utsaah</title></Helmet>
      {orders.map((order) => (
        <Link
          key={order._id}
          to={`/profile/orders/${order._id}`}
          className="bg-white rounded-3xl p-5 shadow-soft flex items-center gap-4 hover:shadow-card transition-shadow"
        >
          <div className="flex -space-x-3 shrink-0">
            {order.items.slice(0, 3).map((item, i) => (
              <div key={i} className="w-14 h-14 rounded-xl bg-blush border-2 border-white overflow-hidden">
                <img src={resolveImage(item.image)} alt="" className="w-full h-full object-contain p-1.5" />
              </div>
            ))}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display font-semibold text-ink text-sm">#{order.orderNumber}</p>
            <p className="text-xs text-ink/50">{order.items.length} item{order.items.length !== 1 ? 's' : ''} · ₹{order.totalAmount} · {new Date(order.createdAt).toLocaleDateString()}</p>
            <span className={`inline-block mt-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[order.orderStatus] || 'bg-blush text-ink/60'}`}>
              {order.orderStatus}
            </span>
          </div>
          <ChevronRight size={18} className="text-ink/30 shrink-0" />
        </Link>
      ))}
    </div>
  );
};

export default Orders;
