import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { resolveImage } from '../api/axios.js';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useNavigate } from 'react-router-dom';
import Badge from './Badge.jsx';
import Rating from './Rating.jsx';

// Every product photo sits on this exact same soft backdrop tone so the
// catalog reads as one cohesive, styled shelf — regardless of each photo's
// own background.
const CARD_BACKDROP = 'bg-blush';

const ProductCard = ({ product }) => {
  const { isAuthenticated } = useAuth();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
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
    <Link
      to={`/product/${product.slug}`}
      className="group block rounded-xl2 bg-white border-2 border-ink/5 shadow-soft hover:shadow-card hover:-translate-y-1 transition-all duration-200 overflow-hidden"
    >
      <div className={`relative aspect-square ${CARD_BACKDROP} overflow-hidden`}>
        <img
          src={resolveImage(product.images?.[0])}
          alt={product.name}
          className="w-full h-full object-contain p-6 group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 items-start">
          {product.isBestSeller && <Badge variant="bestseller">✨ Bestseller</Badge>}
          {product.isNewArrival && !product.isBestSeller && <Badge variant="new">New</Badge>}
          {discountPct > 0 && <Badge variant="sale">{discountPct}% off</Badge>}
        </div>

        {product.availability === 'unavailable' && (
          <div className="absolute inset-0 bg-ink/50 flex items-center justify-center">
            <Badge variant="unavailable">Currently Unavailable</Badge>
          </div>
        )}

        <button
          onClick={handleWishlist}
          aria-label="Toggle wishlist"
          className="absolute top-2.5 right-2.5 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-soft hover:scale-110 transition-transform"
        >
          <Heart
            size={17}
            className={isInWishlist(product._id) ? 'fill-rani text-rani' : 'text-ink/40'}
          />
        </button>

        <span className="absolute bottom-2.5 right-2.5 text-[10px] font-display font-semibold bg-white/90 backdrop-blur px-2 py-1 rounded-full text-ink/70">
          {product.productionDays}d to craft
        </span>
      </div>

      <div className="p-3.5">
        {product.category?.name && (
          <p className="text-[11px] font-semibold text-mehendi uppercase tracking-wide mb-0.5">{product.category.name}</p>
        )}
        <h3 className="font-display font-semibold text-ink text-[15px] leading-snug line-clamp-2 mb-1.5 min-h-[2.5em]">
          {product.name}
        </h3>
        <Rating value={product.ratingAverage} count={product.ratingCount} size={12} />
        <div className="flex items-baseline gap-2 mt-2">
          <span className="font-display font-bold text-ink text-lg">₹{product.price}</span>
          {product.compareAtPrice > product.price && (
            <span className="text-xs text-ink/40 line-through">₹{product.compareAtPrice}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
