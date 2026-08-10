import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MapPin, Gift, Wallet, Tag, Plus, LocateFixed, CheckCircle2, MessageCircle, QrCode, ArrowRight } from 'lucide-react';
import api, { resolveImage } from '../api/axios.js';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import Loader from '../components/Loader.jsx';
import UpiQrPayment from '../components/UpiQrPayment.jsx';

const emptyAddress = { label: 'Home', fullName: '', phone: '', fullAddress: '', city: '', state: '', country: 'India', postalCode: '' };

const Checkout = () => {
  const { items, subtotal, clearCart } = useCart();
  const { user, updateUserLocal } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState(emptyAddress);
  const [geoCoords, setGeoCoords] = useState(null);
  const [locating, setLocating] = useState(false);

  const [giftWrap, setGiftWrap] = useState(false);
  const [chocolateAddon, setChocolateAddon] = useState(false);
  const [giftNote, setGiftNote] = useState('');
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [useWallet, setUseWallet] = useState(false);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [settings, setSettings] = useState(null);
  const [placedOrder, setPlacedOrder] = useState(null);

  useEffect(() => {
    if (items.length === 0 && !placedOrder) {
      navigate('/cart');
      return;
    }
    Promise.all([api.get('/users/addresses'), api.get('/settings')]).then(([addrRes, settingsRes]) => {
      setAddresses(addrRes.data);
      const def = addrRes.data.find((a) => a.isDefault) || addrRes.data[0];
      if (def) setSelectedAddressId(def._id);
      else setShowAddressForm(true);
      setSettings(settingsRes.data);
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const GIFT_WRAP_COST = 49;
  const CHOCOLATE_ADDON_COST = 99;

  const couponDiscount = appliedCoupon?.discount || 0;
  const beforeWallet = subtotal - couponDiscount + (giftWrap ? GIFT_WRAP_COST : 0) + (chocolateAddon ? CHOCOLATE_ADDON_COST : 0);
  const walletAvailable = user?.walletBalance || 0;
  const walletApplied = useWallet ? Math.min(walletAvailable, beforeWallet) : 0;
  const total = Math.max(0, Math.round(beforeWallet - walletApplied));

  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser', 'error');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoCoords({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        showToast('Location captured! This helps our delivery partner find you 📍', 'success');
        setLocating(false);
      },
      () => {
        showToast('Could not access your location — you can still fill the address manually', 'info');
        setLocating(false);
      }
    );
  };

  const handleSaveAddress = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...newAddress, ...(geoCoords || {}) };
      const { data } = await api.post('/users/addresses', payload);
      setAddresses((prev) => [...prev, data]);
      setSelectedAddressId(data._id);
      setShowAddressForm(false);
      setNewAddress(emptyAddress);
      setGeoCoords(null);
      showToast('Address saved 🏡', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponInput) return;
    try {
      const { data } = await api.post('/coupons/validate', { code: couponInput, cartTotal: subtotal });
      setAppliedCoupon(data);
      showToast(`Coupon applied! You saved ₹${data.discount} 🎉`, 'success');
    } catch (err) {
      setAppliedCoupon(null);
      showToast(err.message, 'error');
    }
  };

  const handlePlaceOrder = async (paymentMethod) => {
    if (!selectedAddressId) {
      showToast('Please select or add a delivery address', 'error');
      return;
    }
    setPlacing(paymentMethod);
    try {
      const { data: order } = await api.post('/orders/place', {
        addressId: selectedAddressId,
        couponCode: appliedCoupon?.code || '',
        giftWrap, giftNote, chocolateAddon, useWallet, paymentMethod,
      });

      if (order.walletUsed) updateUserLocal({ walletBalance: walletAvailable - order.walletUsed });
      await clearCart();

      if (order.paymentStatus === 'paid') {
        // fully covered by wallet balance — nothing left to pay
        showToast('Order placed successfully! 🎉', 'success');
        navigate(`/profile/orders/${order._id}`);
        return;
      }

      if (paymentMethod === 'upi') {
        setPlacedOrder(order);
      } else {
        const message = `Hi! I've placed order ${order.orderNumber} on Utsaah for ₹${order.totalAmount}. I'd like to confirm the details before paying.`;
        window.open(`https://wa.me/${settings.whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
        showToast('Order reserved — see you on WhatsApp! 💬', 'success');
        navigate(`/profile/orders/${order._id}`);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setPlacing('');
    }
  };

  const handleConfirmPaid = async () => {
    setConfirming(true);
    try {
      await api.put(`/orders/${placedOrder._id}/report-payment`);
      showToast("Thanks! We'll confirm your payment shortly 💛", 'success');
      navigate(`/profile/orders/${placedOrder._id}`);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setConfirming(false);
    }
  };

  if (loading) return <Loader fullScreen />;

  // ---- Payment step: order already placed, waiting on UPI confirmation ----
  if (placedOrder) {
    return (
      <div className="max-w-md mx-auto px-4 sm:px-6 py-12">
        <Helmet><title>Complete Payment — Utsaah</title></Helmet>
        <div className="text-center mb-6">
          <p className="text-4xl mb-2">🎉</p>
          <h1 className="font-display font-bold text-2xl text-ink">Order #{placedOrder.orderNumber} reserved!</h1>
          <p className="text-ink/50 text-sm mt-1">Complete your payment below and we'll get started right away.</p>
        </div>
        <UpiQrPayment
          upiId={settings.activeUpiId}
          ownerName={settings.activeOwnerName}
          amount={placedOrder.totalAmount}
          orderNumber={placedOrder.orderNumber}
          whatsappNumber={settings.whatsappNumber}
          onConfirmPaid={handleConfirmPaid}
          confirming={confirming}
        />
        <Link to={`/profile/orders/${placedOrder._id}`} className="block text-center text-sm font-semibold text-ink/40 hover:text-rani mt-5">
          I'll pay later — take me to my order →
        </Link>
      </div>
    );
  }

  const upiReady = settings?.upiConfigured;
  const whatsappReady = !!settings?.whatsappNumber;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <Helmet><title>Checkout — Utsaah</title></Helmet>
      <h1 className="font-display font-bold text-3xl text-ink mb-8">Checkout</h1>

      <div className="grid lg:grid-cols-[1fr_360px] gap-8 items-start">
        <div className="space-y-6">
          {/* Address */}
          <div className="bg-white rounded-3xl p-6 shadow-soft">
            <h3 className="font-display font-bold text-lg text-ink mb-4 flex items-center gap-2">
              <MapPin size={18} className="text-rani" /> Delivery Address
            </h3>
            <div className="space-y-3">
              {addresses.map((addr) => (
                <label
                  key={addr._id}
                  className={`block border-2 rounded-2xl p-4 cursor-pointer transition-colors ${selectedAddressId === addr._id ? 'border-rani bg-blush/40' : 'border-ink/10 hover:border-rani/40'}`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="address"
                      checked={selectedAddressId === addr._id}
                      onChange={() => setSelectedAddressId(addr._id)}
                      className="mt-1 accent-rani"
                    />
                    <div>
                      <p className="font-display font-semibold text-ink text-sm">{addr.fullName} · <span className="text-ink/50 font-normal">{addr.label}</span></p>
                      <p className="text-sm text-ink/60">{addr.fullAddress}, {addr.city}, {addr.state} {addr.postalCode}</p>
                      <p className="text-sm text-ink/50">{addr.phone}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {!showAddressForm ? (
              <button
                onClick={() => setShowAddressForm(true)}
                className="mt-4 flex items-center gap-2 text-sm font-display font-semibold text-rani hover:text-rani-dark"
              >
                <Plus size={16} /> Add a new address
              </button>
            ) : (
              <form onSubmit={handleSaveAddress} className="mt-5 pt-5 border-t-2 border-ink/5 space-y-3">
                <div className="grid sm:grid-cols-2 gap-3">
                  <input required placeholder="Full Name" value={newAddress.fullName} onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })} className="bg-blush/60 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none" />
                  <input required placeholder="Phone Number" value={newAddress.phone} onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })} className="bg-blush/60 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none" />
                </div>
                <textarea required placeholder="Full Address (House No, Street, Area)" value={newAddress.fullAddress} onChange={(e) => setNewAddress({ ...newAddress, fullAddress: e.target.value })} rows={2} className="w-full bg-blush/60 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none" />
                <div className="grid sm:grid-cols-3 gap-3">
                  <input required placeholder="City" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} className="bg-blush/60 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none" />
                  <input required placeholder="State" value={newAddress.state} onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })} className="bg-blush/60 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none" />
                  <input required placeholder="Postal Code" value={newAddress.postalCode} onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })} className="bg-blush/60 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none" />
                </div>
                <button
                  type="button"
                  onClick={handleUseLocation}
                  disabled={locating}
                  className="flex items-center gap-1.5 text-xs font-semibold text-indigo_ink hover:text-rani"
                >
                  <LocateFixed size={14} /> {locating ? 'Locating…' : geoCoords ? 'Location captured ✓' : 'Use my current location'}
                </button>
                <div className="flex gap-2 pt-1">
                  <button type="submit" className="btn-sticker bg-rani text-white px-5 py-2.5 text-sm">Save Address</button>
                  <button type="button" onClick={() => setShowAddressForm(false)} className="btn-sticker bg-blush text-ink px-5 py-2.5 text-sm">Cancel</button>
                </div>
              </form>
            )}
          </div>

          {/* Gift options */}
          <div className="bg-white rounded-3xl p-6 shadow-soft">
            <h3 className="font-display font-bold text-lg text-ink mb-4 flex items-center gap-2">
              <Gift size={18} className="text-rani" /> Make it Extra Special
            </h3>
            <label className="flex items-center justify-between py-2.5 cursor-pointer">
              <span className="text-sm font-semibold text-ink/70">🎀 Gift Wrap</span>
              <span className="flex items-center gap-3">
                <span className="text-sm font-semibold text-ink">+₹{GIFT_WRAP_COST}</span>
                <input type="checkbox" checked={giftWrap} onChange={(e) => setGiftWrap(e.target.checked)} className="w-5 h-5 accent-rani" />
              </span>
            </label>
            <label className="flex items-center justify-between py-2.5 cursor-pointer border-t border-ink/5">
              <span className="text-sm font-semibold text-ink/70">🍫 Add Chocolate Box</span>
              <span className="flex items-center gap-3">
                <span className="text-sm font-semibold text-ink">+₹{CHOCOLATE_ADDON_COST}</span>
                <input type="checkbox" checked={chocolateAddon} onChange={(e) => setChocolateAddon(e.target.checked)} className="w-5 h-5 accent-rani" />
              </span>
            </label>
            {giftWrap && (
              <textarea
                placeholder="Write a little gift note (optional)…"
                value={giftNote}
                onChange={(e) => setGiftNote(e.target.value)}
                rows={2}
                className="w-full mt-3 bg-blush/60 rounded-xl px-3.5 py-2.5 text-sm font-hand text-lg focus:outline-none"
              />
            )}
          </div>

          {/* Order items */}
          <div className="bg-white rounded-3xl p-6 shadow-soft">
            <h3 className="font-display font-bold text-lg text-ink mb-4">Items ({items.length})</h3>
            <div className="space-y-3">
              {items.map((item) => (
                <div key={item.product._id} className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-xl bg-blush shrink-0 overflow-hidden">
                    <img src={resolveImage(item.product.images?.[0])} alt="" className="w-full h-full object-contain p-1.5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-ink line-clamp-1">{item.product.name}</p>
                    <p className="text-xs text-ink/50">Qty {item.quantity}</p>
                  </div>
                  <p className="text-sm font-display font-bold text-ink">₹{item.product.price * item.quantity}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-white rounded-3xl p-6 shadow-soft sticky top-24">
          <h3 className="font-display font-bold text-lg text-ink mb-4">Order Summary</h3>

          <div className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Tag size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
              <input
                placeholder="Coupon code"
                value={couponInput}
                onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                className="w-full bg-blush/60 rounded-xl pl-9 pr-3 py-2.5 text-sm focus:outline-none"
              />
            </div>
            <button onClick={handleApplyCoupon} className="btn-sticker bg-ink text-white px-4 text-sm">Apply</button>
          </div>
          {appliedCoupon && (
            <p className="text-xs text-mehendi font-semibold mb-4 flex items-center gap-1">
              <CheckCircle2 size={13} /> {appliedCoupon.code} applied — saved ₹{appliedCoupon.discount}
            </p>
          )}

          {walletAvailable > 0 && (
            <label className="flex items-center justify-between py-2.5 mb-3 border-y border-ink/5 cursor-pointer">
              <span className="flex items-center gap-2 text-sm font-semibold text-ink/70">
                <Wallet size={15} /> Use Wallet (₹{walletAvailable} available)
              </span>
              <input type="checkbox" checked={useWallet} onChange={(e) => setUseWallet(e.target.checked)} className="w-5 h-5 accent-rani" />
            </label>
          )}

          <div className="space-y-2 text-sm mb-4">
            <div className="flex justify-between text-ink/60"><span>Subtotal</span><span className="text-ink font-semibold">₹{subtotal}</span></div>
            {couponDiscount > 0 && <div className="flex justify-between text-mehendi"><span>Coupon Discount</span><span>−₹{couponDiscount}</span></div>}
            {giftWrap && <div className="flex justify-between text-ink/60"><span>Gift Wrap</span><span className="text-ink font-semibold">₹{GIFT_WRAP_COST}</span></div>}
            {chocolateAddon && <div className="flex justify-between text-ink/60"><span>Chocolate Box</span><span className="text-ink font-semibold">₹{CHOCOLATE_ADDON_COST}</span></div>}
            {walletApplied > 0 && <div className="flex justify-between text-mehendi"><span>Wallet Applied</span><span>−₹{walletApplied}</span></div>}
          </div>

          <hr className="stitch-rule mb-4" />
          <div className="flex justify-between font-display font-bold text-xl text-ink mb-6">
            <span>Total</span><span>₹{total}</span>
          </div>

          {total === 0 ? (
            <button
              onClick={() => handlePlaceOrder('upi')}
              disabled={!!placing}
              className="btn-sticker bg-rani text-white w-full py-3.5 hover:bg-rani-dark disabled:opacity-60"
            >
              {placing ? 'Placing order…' : 'Place Order (covered by wallet)'}
            </button>
          ) : (
            <div className="space-y-2.5">
              <button
                onClick={() => handlePlaceOrder('upi')}
                disabled={!!placing || !upiReady}
                className="btn-sticker bg-rani text-white w-full py-3.5 hover:bg-rani-dark disabled:opacity-60"
              >
                <QrCode size={18} /> {placing === 'upi' ? 'Preparing QR…' : `Pay ₹${total} via UPI`}
              </button>
              <button
                onClick={() => handlePlaceOrder('whatsapp')}
                disabled={!!placing || !whatsappReady}
                className="btn-sticker bg-mehendi text-white w-full py-3.5 hover:bg-mehendi-dark disabled:opacity-60"
              >
                <MessageCircle size={18} /> {placing === 'whatsapp' ? 'Reserving…' : 'Confirm on WhatsApp First'} <ArrowRight size={15} />
              </button>
              {!upiReady && !whatsappReady && (
                <p className="text-xs text-rani text-center pt-1">Payment isn't set up yet — please try again shortly.</p>
              )}
            </div>
          )}
          <p className="text-center text-[11px] text-ink/40 mt-3">🧡 Small-batch, handmade — pay directly via UPI, no middleman</p>
        </div>
      </div>
    </div>
  );
};

export default Checkout;