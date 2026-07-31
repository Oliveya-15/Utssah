import { useState, useEffect } from 'react';
import { Star, Trash2, Check, X as XIcon } from 'lucide-react';
import api, { resolveImage } from '../api/axios.js';
import { useToast } from '../context/ToastContext.jsx';
import Loader from '../components/Loader.jsx';

const Reviews = () => {
  const { showToast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = () => api.get('/reviews/admin/all').then((res) => { setReviews(res.data); setLoading(false); });
  useEffect(() => { fetchAll(); }, []);

  const moderate = async (id, isApproved) => {
    await api.put(`/reviews/${id}/moderate`, { isApproved });
    showToast(isApproved ? 'Review approved' : 'Review hidden', 'success');
    fetchAll();
  };

  const remove = async (id) => {
    if (!confirm('Delete this review?')) return;
    await api.delete(`/reviews/${id}`);
    showToast('Review deleted', 'success');
    fetchAll();
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-ink mb-1">Reviews</h1>
      <p className="text-ink/50 text-sm mb-6">{reviews.length} customer reviews</p>

      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r._id} className="bg-white rounded-3xl p-5 shadow-soft flex gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <p className="font-display font-semibold text-ink text-sm">{r.product?.name}</p>
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map((n) => <Star key={n} size={13} className={n <= r.rating ? 'fill-marigold text-marigold' : 'text-ink/20'} />)}
                </div>
              </div>
              <p className="text-xs text-ink/40 mb-2">{r.user?.name} · {r.user?.email}</p>
              <p className="text-sm text-ink/60">{r.reviewText}</p>
              {r.images?.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {r.images.map((img, i) => <img key={i} src={resolveImage(img)} alt="" className="w-12 h-12 rounded-lg object-cover bg-blush" />)}
                </div>
              )}
              <div className="flex gap-2 mt-3">
                {!r.isApproved ? (
                  <button onClick={() => moderate(r._id, true)} className="btn-sticker bg-mehendi text-white px-3 py-1.5 text-xs"><Check size={13} /> Approve</button>
                ) : (
                  <button onClick={() => moderate(r._id, false)} className="btn-sticker bg-ink/10 text-ink px-3 py-1.5 text-xs"><XIcon size={13} /> Hide</button>
                )}
                <button onClick={() => remove(r._id)} className="btn-sticker bg-blush text-rani px-3 py-1.5 text-xs"><Trash2 size={13} /> Delete</button>
              </div>
            </div>
          </div>
        ))}
        {reviews.length === 0 && <p className="text-center py-16 text-ink/40 text-sm bg-white rounded-3xl shadow-soft">No reviews yet.</p>}
      </div>
    </div>
  );
};

export default Reviews;
