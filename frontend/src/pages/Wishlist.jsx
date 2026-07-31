import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Loader from '../components/Loader.jsx';

const Wishlist = () => {
  const { products, loading } = useWishlist();

  if (loading) return <Loader fullScreen />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <Helmet><title>Your Wishlist — Utsaah</title></Helmet>
      <h1 className="font-display font-bold text-3xl text-ink mb-8">Your Wishlist 💛</h1>

      {products.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl shadow-soft">
          <p className="text-6xl mb-4">💌</p>
          <p className="font-display font-semibold text-xl text-ink mb-2">Nothing saved yet</p>
          <p className="text-ink/50 mb-6">Tap the heart on any product to save it here for later.</p>
          <Link to="/shop" className="btn-sticker bg-rani text-white px-6 py-3 inline-flex">
            Explore Products <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
          {products.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
