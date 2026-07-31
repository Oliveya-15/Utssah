import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Star } from 'lucide-react';
import api, { resolveImage } from '../../api/axios.js';
import Loader from '../../components/Loader.jsx';

const MyReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reviews/my').then((res) => { setReviews(res.data); setLoading(false); });
  }, []);

  if (loading) return <Loader />;

  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-10 shadow-soft text-center">
        <Star size={40} className="mx-auto text-ink/20 mb-3" />
        <p className="font-display font-semibold text-lg text-ink mb-1">No reviews yet</p>
        <p className="text-ink/50 text-sm">Reviews you write after delivery will show up here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Helmet><title>My Reviews — Utsaah</title></Helmet>
      {reviews.map((r) => (
        <div key={r._id} className="bg-white rounded-3xl p-5 shadow-soft flex gap-4">
          <Link to={`/product/${r.product?.slug}`} className="w-16 h-16 rounded-xl bg-blush shrink-0 overflow-hidden">
            <img src={resolveImage(r.product?.images?.[0])} alt="" className="w-full h-full object-contain p-1.5" />
          </Link>
          <div className="flex-1 min-w-0">
            <Link to={`/product/${r.product?.slug}`} className="font-display font-semibold text-ink text-sm hover:text-rani">{r.product?.name}</Link>
            <div className="flex items-center gap-1 my-1">
              {[1, 2, 3, 4, 5].map((n) => <Star key={n} size={13} className={n <= r.rating ? 'fill-marigold text-marigold' : 'text-ink/20'} />)}
            </div>
            <p className="text-sm text-ink/60">{r.reviewText}</p>
            {!r.isApproved && <p className="text-[11px] text-marigold-dark mt-1">Pending approval</p>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyReviews;
