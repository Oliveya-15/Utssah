import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Heart, ShoppingBag, Clock, Truck, ShieldCheck, ChevronRight, Minus, Plus } from 'lucide-react';
import api, { resolveImage } from '../api/axios.js';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Rating from '../components/Rating.jsx';
import Badge from '../components/Badge.jsx';
import Loader from '../components/Loader.jsx';

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setLoading(true);
    setActiveImage(0);
    setQuantity(1);
    api
      .get(`/products/${slug}`)
      .then((res) => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) return <Loader fullScreen />;
  if (!data) {
    return (
      <div className="text-center py-24">
        <p className="text-5xl mb-4">🧶</p>
        <p className="font-display font-semibold text-xl text-ink mb-4">Product not found</p>
        <Link to="/shop" className="btn-sticker bg-rani text-white px-6 py-2.5 text-sm inline-flex">Back to Shop</Link>
      </div>
    );
  }

  const { product, similar, reviews } = data;

  const handleAddToCart = async () => {
    setAdding(true);
    try {
      await addItem(product, quantity);
      showToast(`Added ${quantity} × ${product.name} to cart 🛍️`, 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setAdding(false);
    }
  };

  const handleBuyNow = async () => {
    await handleAddToCart();
    navigate('/cart');
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      showToast('Please log in to save items to your wishlist', 'info');
      navigate('/login');
      return;
    }
    const res = await toggleWishlist(product);
    showToast(res.added ? 'Added to wishlist 💛' : 'Removed from wishlist', 'success');
  };

  const discountPct = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <Helmet>
        <title>{product.name} — Utsaah</title>
        <meta name="description" content={product.description?.slice(0, 150)} />
      </Helmet>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-xs text-ink/40 mb-6 font-semibold">
        <Link to="/" className="hover:text-rani">Home</Link> <ChevronRight size={12} />
        <Link to="/shop" className="hover:text-rani">Shop</Link> <ChevronRight size={12} />
        {product.category?.name && (
          <>
            <Link to={`/shop?category=${product.category._id}`} className="hover:text-rani">{product.category.name}</Link>
            <ChevronRight size={12} />
          </>
        )}
        <span className="text-ink/70">{product.name}</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-10 mb-16">
        {/* Gallery */}
        <div>
          <div className="aspect-square bg-blush rounded-3xl overflow-hidden relative mb-3 shadow-soft">
            <img
              src={resolveImage(product.images[activeImage])}
              alt={product.name}
              className="w-full h-full object-contain p-10"
            />
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.isBestSeller && <Badge variant="bestseller">✨ Bestseller</Badge>}
              {product.isNewArrival && <Badge variant="new">New</Badge>}
              {discountPct > 0 && <Badge variant="sale">{discountPct}% off</Badge>}
            </div>
          </div>
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden bg-blush border-2 shrink-0 ${activeImage === i ? 'border-rani' : 'border-transparent'}`}
                >
                  <img src={resolveImage(img)} alt="" className="w-full h-full object-contain p-2" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          {product.category?.name && (
            <p className="text-xs font-display font-semibold text-mehendi uppercase tracking-wide mb-2">{product.category.name}</p>
          )}
          <h1 className="font-display font-bold text-3xl text-ink mb-3">{product.name}</h1>
          <Rating value={product.ratingAverage} count={product.ratingCount} size={18} />

          <div className="flex items-baseline gap-3 mt-4 mb-1">
            <span className="font-display font-bold text-3xl text-ink">₹{product.price}</span>
            {product.compareAtPrice > product.price && (
              <>
                <span className="text-lg text-ink/40 line-through">₹{product.compareAtPrice}</span>
                <span className="text-sm font-bold text-mehendi">Save {discountPct}%</span>
              </>
            )}
          </div>
          <p className="text-xs text-ink/40 mb-6">Inclusive of all taxes</p>

          <p className="text-ink/70 leading-relaxed mb-6">{product.description}</p>

          <div className="flex flex-wrap gap-3 mb-6">
            <div className="flex items-center gap-2 bg-blush px-3.5 py-2 rounded-full text-xs font-semibold text-ink/70">
              <Clock size={14} /> {product.productionDays} days to craft
            </div>
            <div className="flex items-center gap-2 bg-mint px-3.5 py-2 rounded-full text-xs font-semibold text-ink/70">
              <Truck size={14} /> Ships across India
            </div>
            <div className="flex items-center gap-2 bg-lavender px-3.5 py-2 rounded-full text-xs font-semibold text-ink/70">
              <ShieldCheck size={14} /> 7-day returns
            </div>
          </div>

          {product.availability === 'unavailable' ? (
            <div className="bg-ink/5 rounded-2xl p-4 text-center font-display font-semibold text-ink/50 mb-4">
              Currently Unavailable — check back soon!
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <div className="flex items-center bg-blush rounded-full">
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} className="w-11 h-11 flex items-center justify-center text-ink/60 hover:text-rani">
                  <Minus size={16} />
                </button>
                <span className="w-8 text-center font-display font-bold">{quantity}</span>
                <button onClick={() => setQuantity((q) => q + 1)} className="w-11 h-11 flex items-center justify-center text-ink/60 hover:text-rani">
                  <Plus size={16} />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                disabled={adding}
                className="btn-sticker bg-white border-2 border-rani text-rani px-6 py-3 hover:bg-blush flex-1 sm:flex-initial disabled:opacity-60"
              >
                <ShoppingBag size={18} /> Add to Cart
              </button>
              <button onClick={handleBuyNow} className="btn-sticker bg-rani text-white px-6 py-3 hover:bg-rani-dark flex-1 sm:flex-initial">
                Buy Now
              </button>
              <button
                onClick={handleWishlist}
                className="w-12 h-12 rounded-full bg-white shadow-soft flex items-center justify-center shrink-0"
                aria-label="Wishlist"
              >
                <Heart size={20} className={isInWishlist(product._id) ? 'fill-rani text-rani' : 'text-ink/40'} />
              </button>
            </div>
          )}

          {product.specifications?.length > 0 && (
            <div className="mt-8 bg-white rounded-2xl p-5 shadow-soft">
              <h3 className="font-display font-semibold text-ink mb-3">Specifications</h3>
              <dl className="space-y-2">
                {product.specifications.map((s, i) => (
                  <div key={i} className="flex justify-between text-sm border-b border-ink/5 pb-2 last:border-0">
                    <dt className="text-ink/50 font-semibold">{s.key}</dt>
                    <dd className="text-ink font-semibold">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="mb-16">
        <h2 className="font-display font-bold text-2xl text-ink mb-6">Customer Reviews ({reviews.length})</h2>
        {reviews.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-soft">
            <p className="text-ink/50">No reviews yet — be the first to share your experience after your order is delivered!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {reviews.map((r) => (
              <div key={r._id} className="bg-white rounded-2xl p-5 shadow-soft">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-display font-semibold text-ink text-sm">{r.user?.name || 'Verified Buyer'}</p>
                  <Rating value={r.rating} showCount={false} size={13} />
                </div>
                <p className="text-sm text-ink/60 leading-relaxed">{r.reviewText}</p>
                {r.images?.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {r.images.map((img, i) => (
                      <img key={i} src={resolveImage(img)} alt="" className="w-14 h-14 rounded-xl object-cover bg-blush" />
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Similar products */}
      {similar.length > 0 && (
        <div>
          <h2 className="font-display font-bold text-2xl text-ink mb-6">You Might Also Love</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {similar.map((p) => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
