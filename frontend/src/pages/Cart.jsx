import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { resolveImage } from '../api/axios.js';
import Loader from '../components/Loader.jsx';

const Cart = () => {
  const { items, loading, updateQuantity, removeItem, subtotal } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }
    navigate('/checkout');
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <Helmet><title>Your Cart — Utsaah</title></Helmet>
      <h1 className="font-display font-bold text-3xl text-ink mb-8">Your Cart</h1>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl shadow-soft">
          <p className="text-6xl mb-4">🛍️</p>
          <p className="font-display font-semibold text-xl text-ink mb-2">Your cart is feeling a little empty</p>
          <p className="text-ink/50 mb-6">Fill it with handmade happiness!</p>
          <Link to="/shop" className="btn-sticker bg-rani text-white px-6 py-3 inline-flex">
            Start Shopping <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.product._id} className="bg-white rounded-2xl p-4 shadow-soft flex gap-4 items-center">
                <Link to={`/product/${item.product.slug}`} className="w-20 h-20 rounded-xl bg-blush shrink-0 overflow-hidden">
                  <img src={resolveImage(item.product.images?.[0])} alt={item.product.name} className="w-full h-full object-contain p-2" />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link to={`/product/${item.product.slug}`} className="font-display font-semibold text-ink hover:text-rani line-clamp-1">
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-ink/50 mt-0.5">₹{item.product.price} each</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center bg-blush rounded-full">
                      <button
                        onClick={() => updateQuantity(item.product._id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center text-ink/60 hover:text-rani"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-7 text-center text-sm font-display font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.product._id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center text-ink/60 hover:text-rani"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                    <button onClick={() => removeItem(item.product._id)} className="text-ink/30 hover:text-rani">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <p className="font-display font-bold text-ink shrink-0">₹{item.product.price * item.quantity}</p>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-3xl p-6 shadow-soft sticky top-24">
            <h3 className="font-display font-bold text-lg text-ink mb-4">Order Summary</h3>
            <div className="flex justify-between text-sm text-ink/60 mb-2">
              <span>Subtotal</span>
              <span className="font-semibold text-ink">₹{subtotal}</span>
            </div>
            <p className="text-xs text-ink/40 mb-4">Coupons, gift options &amp; shipping calculated at checkout.</p>
            <hr className="stitch-rule mb-4" />
            <div className="flex justify-between font-display font-bold text-lg text-ink mb-5">
              <span>Total</span>
              <span>₹{subtotal}</span>
            </div>
            <button onClick={handleCheckout} className="btn-sticker bg-rani text-white w-full py-3.5 hover:bg-rani-dark">
              <ShoppingBag size={18} /> Proceed to Checkout
            </button>
            <Link to="/shop" className="block text-center text-sm font-semibold text-ink/50 hover:text-rani mt-4">
              ← Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
