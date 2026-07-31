import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, MapPin, Package, Truck } from 'lucide-react';
import api, { resolveImage } from '../api/axios.js';
import { useToast } from '../context/ToastContext.jsx';
import Loader from '../components/Loader.jsx';
import StatusPill from '../components/StatusPill.jsx';

const ORDER_STATUSES = [
  'Order Received', 'Payment Successful', 'Confirmation Sent', 'Acknowledgement Pending',
  'Production Started', 'Gift Packaging', 'Packed', 'Shipping Assigned', 'Shipped', 'Delivered', 'Completed',
];

const OrderDetail = () => {
  const { id } = useParams();
  const { showToast } = useToast();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('');
  const [note, setNote] = useState('');
  const [shippingProvider, setShippingProvider] = useState('');
  const [courierPartner, setCourierPartner] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [adminNote, setAdminNote] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchOrder = () => {
    api.get(`/orders/${id}`).then((res) => {
      setOrder(res.data);
      setStatus(res.data.orderStatus);
      setShippingProvider(res.data.shippingProvider || '');
      setCourierPartner(res.data.courierPartner || '');
      setTrackingNumber(res.data.trackingNumber || '');
      setAdminNote(res.data.adminNote || '');
      setLoading(false);
    });
  };
  useEffect(fetchOrder, [id]);

  const handleUpdate = async () => {
    setSaving(true);
    try {
      await api.put(`/orders/${id}/status`, { orderStatus: status, note, shippingProvider, courierPartner, trackingNumber, adminNote });
      showToast('Order updated — customer notified ✅', 'success');
      setNote('');
      fetchOrder();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader fullScreen />;
  if (!order) return <p className="text-center py-20 text-ink/50">Order not found.</p>;

  return (
    <div>
      <Link to="/orders" className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink/50 hover:text-rani mb-4"><ArrowLeft size={15} /> Back to Orders</Link>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink">Order #{order.orderNumber}</h1>
          <p className="text-sm text-ink/50">{order.user?.name} · {order.user?.email} · {order.user?.phone}</p>
        </div>
        <StatusPill status={order.orderStatus} />
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-6">
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 shadow-soft">
            <h3 className="font-display font-bold text-lg text-ink mb-4 flex items-center gap-2"><Package size={17} className="text-rani" /> Items</h3>
            <div className="space-y-3">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-blush shrink-0 overflow-hidden">
                    <img src={resolveImage(item.image)} alt="" className="w-full h-full object-contain p-1.5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-ink">{item.name}</p>
                    <p className="text-xs text-ink/50">Qty {item.quantity} × ₹{item.price} · {item.productionDays}d to craft</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-soft">
            <h3 className="font-display font-bold text-lg text-ink mb-4 flex items-center gap-2"><MapPin size={17} className="text-rani" /> Delivery Address</h3>
            <p className="text-sm font-semibold text-ink">{order.address.fullName}</p>
            <p className="text-sm text-ink/60">{order.address.fullAddress}, {order.address.city}, {order.address.state} {order.address.postalCode}</p>
            <p className="text-sm text-ink/50 mt-1">{order.address.phone}</p>
            {order.address.latitude && (
              <a
                href={`https://www.google.com/maps?q=${order.address.latitude},${order.address.longitude}`}
                target="_blank" rel="noopener noreferrer"
                className="text-xs font-semibold text-rani hover:underline mt-2 inline-block"
              >
                View on Google Maps →
              </a>
            )}
            {order.giftWrap && <p className="text-xs mt-3 bg-butter text-marigold-dark inline-block px-2.5 py-1 rounded-full font-semibold">🎀 Gift Wrap Requested</p>}
            {order.giftNote && <p className="text-sm text-ink/60 mt-2 italic">"{order.giftNote}"</p>}

            {order.trackingNumber && (
              <div className="mt-4 pt-4 border-t border-ink/5 flex items-center gap-2 text-sm text-ink/60">
                <Truck size={16} className="text-rani" /> {order.trackingNumber} via {order.courierPartner || order.shippingProvider}
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-soft">
            <h3 className="font-display font-bold text-lg text-ink mb-4">Status History</h3>
            <div className="space-y-3">
              {order.statusHistory?.slice().reverse().map((h, i) => (
                <div key={i} className="flex gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-rani mt-1.5 shrink-0" />
                  <div>
                    <p className="font-semibold text-ink">{h.status}</p>
                    {h.note && <p className="text-ink/50 text-xs">{h.note}</p>}
                    <p className="text-ink/30 text-xs">{new Date(h.changedAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-soft h-fit sticky top-6">
          <h3 className="font-display font-bold text-lg text-ink mb-4">Manage Order</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-ink/50 mb-1.5">Order Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full bg-blush/60 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none">
                {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <textarea placeholder="Note to include (optional)" value={note} onChange={(e) => setNote(e.target.value)} rows={2} className="w-full bg-blush/60 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none" />

            <hr className="stitch-rule my-3" />
            <div>
              <label className="block text-xs font-semibold text-ink/50 mb-1.5">Shipping Provider</label>
              <select value={shippingProvider} onChange={(e) => setShippingProvider(e.target.value)} className="w-full bg-blush/60 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none">
                <option value="">Not assigned</option>
                <option value="Rapido Parcel">Rapido Parcel</option>
                <option value="Shiprocket">Shiprocket</option>
              </select>
            </div>
            <input placeholder="Courier Partner (e.g. Delhivery)" value={courierPartner} onChange={(e) => setCourierPartner(e.target.value)} className="w-full bg-blush/60 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none" />
            <input placeholder="Tracking Number" value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} className="w-full bg-blush/60 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none" />

            <hr className="stitch-rule my-3" />
            <div>
              <label className="block text-xs font-semibold text-ink/50 mb-1.5">Internal Admin Note</label>
              <textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)} rows={2} className="w-full bg-blush/60 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none" />
            </div>

            <button disabled={saving} onClick={handleUpdate} className="btn-sticker bg-rani text-white w-full py-3 text-sm disabled:opacity-60">
              {saving ? 'Updating…' : 'Update Order'}
            </button>
          </div>

          <hr className="stitch-rule my-5" />
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-ink/60"><span>Items Total</span><span>₹{order.itemsTotal}</span></div>
            {order.couponDiscount > 0 && <div className="flex justify-between text-mehendi"><span>Coupon</span><span>−₹{order.couponDiscount}</span></div>}
            {order.walletUsed > 0 && <div className="flex justify-between text-mehendi"><span>Wallet Used</span><span>−₹{order.walletUsed}</span></div>}
            <div className="flex justify-between font-display font-bold text-ink pt-1"><span>Total Paid</span><span>₹{order.totalAmount}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
