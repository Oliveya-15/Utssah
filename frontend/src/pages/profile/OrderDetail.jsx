import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MapPin, Truck, RotateCcw, XCircle, Star, RefreshCw, Package, MessageCircle, Landmark } from 'lucide-react';
import api, { resolveImage } from '../../api/axios.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useCart } from '../../context/CartContext.jsx';
import Loader from '../../components/Loader.jsx';
import UpiQrPayment from '../../components/UpiQrPayment.jsx';

const CANCELLABLE = ['Order Received', 'Payment Reported', 'Payment Successful', 'Confirmation Sent', 'Acknowledgement Pending'];
const MAIN_STEPS = ['Order Received', 'Payment Successful', 'Production Started', 'Packed', 'Shipped', 'Delivered'];

const trackerStatusFor = (status) => (status === 'Payment Reported' ? 'Order Received' : status);

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { refetch } = useCart();
  const [order, setOrder] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirmingPayment, setConfirmingPayment] = useState(false);
  const [showReturnForm, setShowReturnForm] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [returnDesc, setReturnDesc] = useState('');
  const [showReviewFor, setShowReviewFor] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  const fetchOrder = useCallback(() => {
    api.get(`/orders/${id}`)
      .then((res) => {
        setOrder(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  useEffect(() => {
    if (order) {
      api.get('/settings').then((res) => setSettings(res.data)).catch(() => {});
    }
  }, [order?._id]);

  const handleConfirmPaid = async () => {
    setConfirmingPayment(true);
    try {
      await api.put(`/orders/${id}/report-payment`);
      showToast("Thanks! We'll confirm your payment shortly 💛", 'success');
      fetchOrder();
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error');
    } finally {
      setConfirmingPayment(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await api.put(`/orders/${id}/cancel`, { reason: 'Cancelled by customer' });
      showToast('Order cancelled — refund credited to wallet', 'success');
      fetchOrder();
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error');
    }
  };

  const handleReorder = async () => {
    try {
      await api.post(`/orders/${id}/reorder`);
      await refetch();
      showToast('Items added to cart! 🛍️', 'success');
      navigate('/cart');
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error');
    }
  };

  const handleReturnSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append('reason', returnReason);
      fd.append('description', returnDesc);
      await api.post(`/returns/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      showToast('Return request submitted', 'success');
      setShowReturnForm(false);
      fetchOrder();
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error');
    }
  };

  const handleReviewSubmit = async (e, productId) => {
    e.preventDefault();
    try {
      // Sent as JSON instead of FormData unless file upload is required
      await api.post(`/reviews/${productId}`, {
        rating: reviewRating,
        reviewText,
      });
      showToast('Thanks for your review! 💛', 'success');
      setShowReviewFor(null);
      setReviewText('');
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error');
    }
  };

  if (loading) return <Loader fullScreen />;
  if (!order) return <p className="text-center py-20 text-ink/50">Order not found.</p>;

  const currentStepIndex = MAIN_STEPS.indexOf(trackerStatusFor(order.orderStatus));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <Helmet><title>Order #{order.orderNumber} — Utsaah</title></Helmet>

      <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
        <div>
          <h1 className="font-display font-bold text-2xl text-ink">Order #{order.orderNumber}</h1>
          <p className="text-sm text-ink/50">Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleReorder} className="btn-sticker bg-white shadow-soft text-ink px-4 py-2.5 text-sm flex items-center gap-1.5">
            <RefreshCw size={15} /> Reorder
          </button>
          {CANCELLABLE.includes(order.orderStatus) && (
            <button onClick={handleCancel} className="btn-sticker bg-white shadow-soft text-rani px-4 py-2.5 text-sm flex items-center gap-1.5">
              <XCircle size={15} /> Cancel Order
            </button>
          )}
          {(order.orderStatus === 'Delivered' || order.orderStatus === 'Completed') && (
            <button onClick={() => setShowReturnForm((prev) => !prev)} className="btn-sticker bg-white shadow-soft text-ink px-4 py-2.5 text-sm flex items-center gap-1.5">
              <RotateCcw size={15} /> Return
            </button>
          )}
        </div>
      </div>

      {/* Status tracker */}
      {!['Cancelled'].includes(order.orderStatus) && (
        <div className="bg-white rounded-3xl p-6 shadow-soft mb-6 overflow-x-auto">
          <div className="flex items-center min-w-[560px]">
            {MAIN_STEPS.map((step, i) => (
              <div key={step} className="flex items-center flex-1 last:flex-initial">
                <div className="flex flex-col items-center gap-2 shrink-0">
                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center font-display font-bold text-xs shrink-0 ${
                      i <= currentStepIndex ? 'bg-rani text-white' : 'bg-blush text-ink/30'
                    }`}
                  >
                    {i + 1}
                  </div>
                  <p className={`text-[10px] font-semibold text-center w-20 ${i <= currentStepIndex ? 'text-ink' : 'text-ink/30'}`}>{step}</p>
                </div>
                {i < MAIN_STEPS.length - 1 && (
                  <div className={`chain-stitch flex-1 h-[2px] mx-1 mb-5 ${i < currentStepIndex ? 'opacity-100' : 'opacity-25'}`} />
                )}
              </div>
            ))}
          </div>
          {order.trackingNumber && (
            <div className="mt-5 pt-4 border-t border-ink/5 flex items-center gap-2 text-sm text-ink/60">
              <Truck size={16} className="text-rani" />
              Tracking: <span className="font-semibold text-ink">{order.trackingNumber}</span> {order.courierPartner && `via ${order.courierPartner}`}
            </div>
          )}
        </div>
      )}

      {order.orderStatus === 'Cancelled' && (
        <div className="bg-ink/5 rounded-2xl p-4 mb-6 text-sm text-ink/60">
          This order was cancelled{order.cancelReason ? `: ${order.cancelReason}` : '.'} Refund credited to your wallet.
        </div>
      )}

      {order.orderStatus === 'Payment Reported' && (
        <div className="bg-butter rounded-2xl p-4 mb-6 text-sm text-marigold-dark font-semibold flex items-center gap-2">
          <Landmark size={16} /> Payment confirmation received — we're verifying it and will update you shortly 💛
        </div>
      )}

      {order.paymentStatus === 'pending' && order.orderStatus === 'Order Received' && (
        <div className="mb-6">
          {order.paymentMethod === 'upi' && settings?.upiConfigured ? (
            <UpiQrPayment
              upiId={settings.activeUpiId}
              ownerName={settings.activeOwnerName}
              amount={order.totalAmount}
              orderNumber={order.orderNumber}
              whatsappNumber={settings.whatsappNumber}
              onConfirmPaid={handleConfirmPaid}
              confirming={confirmingPayment}
            />
          ) : (
            settings?.whatsappNumber && (
              /* FIXED: Added missing '<a' */
              <a
                href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(`Hi! I'd like to arrange payment for order ${order.orderNumber} (₹${order.totalAmount}).`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-sticker bg-mehendi text-white w-full py-3.5 flex items-center justify-center gap-2"
              >
                <MessageCircle size={18} /> Message us on WhatsApp to Pay
              </a>
            )
          )}
        </div>
      )}

      {/* Items */}
      <div className="bg-white rounded-3xl p-6 shadow-soft mb-6">
        <h3 className="font-display font-bold text-lg text-ink mb-4">Items</h3>
        <div className="space-y-4">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-xl bg-blush shrink-0 overflow-hidden">
                <img src={resolveImage(item.image)} alt={item.name} className="w-full h-full object-contain p-1.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-ink text-sm">{item.name}</p>
                <p className="text-xs text-ink/50">Qty {item.quantity} × ₹{item.price}</p>
              </div>
              {(order.orderStatus === 'Delivered' || order.orderStatus === 'Completed') && (
                <button
                  onClick={() => setShowReviewFor(showReviewFor === item.product ? null : item.product)}
                  className="text-xs font-semibold text-rani flex items-center gap-1 shrink-0"
                >
                  <Star size={13} /> Review
                </button>
              )}
            </div>
          ))}
        </div>

        {showReviewFor && (
          <form onSubmit={(e) => handleReviewSubmit(e, showReviewFor)} className="mt-4 pt-4 border-t border-ink/5 space-y-3">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button type="button" key={n} onClick={() => setReviewRating(n)}>
                  <Star size={22} className={n <= reviewRating ? 'fill-marigold text-marigold' : 'text-ink/20'} />
                </button>
              ))}
            </div>
            <textarea
              required
              placeholder="Share your experience…"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={3}
              className="w-full bg-blush/60 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
            />
            <button className="btn-sticker bg-rani text-white px-5 py-2.5 text-sm">Submit Review</button>
          </form>
        )}
      </div>

      {showReturnForm && (
        <form onSubmit={handleReturnSubmit} className="bg-white rounded-3xl p-6 shadow-soft mb-6 space-y-3">
          <h3 className="font-display font-bold text-lg text-ink mb-1">Request a Return</h3>
          <select
            required
            value={returnReason}
            onChange={(e) => setReturnReason(e.target.value)}
            className="w-full bg-blush/60 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
          >
            <option value="">Select a reason</option>
            <option value="Item damaged">Item damaged</option>
            <option value="Wrong item received">Wrong item received</option>
            <option value="Quality not as expected">Quality not as expected</option>
            <option value="Changed my mind">Changed my mind</option>
            <option value="Other">Other</option>
          </select>
          <textarea
            placeholder="Tell us more (optional)"
            value={returnDesc}
            onChange={(e) => setReturnDesc(e.target.value)}
            rows={3}
            className="w-full bg-blush/60 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none"
          />
          <div className="flex gap-2">
            <button className="btn-sticker bg-rani text-white px-5 py-2.5 text-sm">Submit Return Request</button>
            <button type="button" onClick={() => setShowReturnForm(false)} className="btn-sticker bg-blush text-ink px-5 py-2.5 text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Address + summary */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-soft">
          <h3 className="font-display font-bold text-lg text-ink mb-3 flex items-center gap-2">
            <MapPin size={17} className="text-rani" /> Delivery Address
          </h3>
          <p className="text-sm text-ink/70 font-semibold">{order.address?.fullName}</p>
          <p className="text-sm text-ink/60">
            {order.address?.fullAddress}, {order.address?.city}, {order.address?.state} {order.address?.postalCode}
          </p>
          <p className="text-sm text-ink/50 mt-1">{order.address?.phone}</p>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-soft">
          <h3 className="font-display font-bold text-lg text-ink mb-3 flex items-center gap-2">
            <Package size={17} className="text-rani" /> Payment Summary
          </h3>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-ink/60">
              <span>Items Total</span>
              <span>₹{order.itemsTotal}</span>
            </div>
            {order.couponDiscount > 0 && (
              <div className="flex justify-between text-mehendi">
                <span>Coupon ({order.couponCode})</span>
                <span>−₹{order.couponDiscount}</span>
              </div>
            )}
            {order.giftWrapCost > 0 && (
              <div className="flex justify-between text-ink/60">
                <span>Gift Wrap</span>
                <span>₹{order.giftWrapCost}</span>
              </div>
            )}
            {order.chocolateAddonCost > 0 && (
              <div className="flex justify-between text-ink/60">
                <span>Chocolate Box</span>
                <span>₹{order.chocolateAddonCost}</span>
              </div>
            )}
            {order.walletUsed > 0 && (
              <div className="flex justify-between text-mehendi">
                <span>Wallet Used</span>
                <span>−₹{order.walletUsed}</span>
              </div>
            )}
            <hr className="stitch-rule my-2" />
            <div className="flex justify-between font-display font-bold text-ink">
              <span>{order.paymentStatus === 'paid' ? 'Total Paid' : 'Total Due'}</span>
              <span>₹{order.totalAmount}</span>
            </div>
          </div>
          <p className="text-xs text-ink/40 mt-3">
            {order.paymentMethod === 'upi' ? 'Paid via UPI' : 'Confirmed via WhatsApp'}
            {order.upiOwnerUsed && ` · to ${order.upiOwnerUsed}`}
            {order.paymentStatus === 'paid' && ' · ✅ Verified'}
          </p>
        </div>
      </div>

      {settings?.whatsappNumber && order.orderStatus !== 'Cancelled' && (
        /* FIXED: Added missing '<a' */
        <a
          href={`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(`Hi! I have a question about order ${order.orderNumber}.`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-mehendi-dark hover:underline mt-6"
        >
          <MessageCircle size={15} /> Have a question about this order? Chat with us on WhatsApp
        </a>
      )}
    </div>
  );
};

export default OrderDetail;