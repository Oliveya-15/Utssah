import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, EyeOff, Eye, Search, X } from 'lucide-react';
import api, { resolveImage } from '../api/axios.js';
import { useToast } from '../context/ToastContext.jsx';
import Loader from '../components/Loader.jsx';
import Modal from '../components/Modal.jsx';
import StatusPill from '../components/StatusPill.jsx';

const emptyForm = {
  name: '', category: '', description: '', price: '', compareAtPrice: '',
  productionDays: 3, availability: 'available', tags: '', stockNote: '',
  isFeatured: false, isNewArrival: true, isBestSeller: false,
};

const Products = () => {
  const { showToast } = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [specs, setSpecs] = useState([{ key: '', value: '' }]);
  const [newImages, setNewImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [saving, setSaving] = useState(false);

  const fetchAll = () => {
    Promise.all([api.get('/products/admin/all'), api.get('/categories/admin/all')]).then(([p, c]) => {
      setProducts(p.data);
      setCategories(c.data);
      setLoading(false);
    });
  };
  useEffect(fetchAll, []);

  const openNew = () => {
    setForm(emptyForm);
    setSpecs([{ key: '', value: '' }]);
    setNewImages([]);
    setExistingImages([]);
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (p) => {
    setForm({
      name: p.name, category: p.category?._id || '', description: p.description,
      price: p.price, compareAtPrice: p.compareAtPrice || '', productionDays: p.productionDays,
      availability: p.availability, tags: p.tags.join(', '), stockNote: p.stockNote || '',
      isFeatured: p.isFeatured, isNewArrival: p.isNewArrival, isBestSeller: p.isBestSeller,
    });
    setSpecs(p.specifications?.length ? p.specifications : [{ key: '', value: '' }]);
    setExistingImages(p.images);
    setNewImages([]);
    setEditingId(p._id);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      fd.append('specifications', JSON.stringify(specs.filter((s) => s.key && s.value)));
      if (editingId) fd.append('keepImages', JSON.stringify(existingImages));
      newImages.forEach((img) => fd.append('images', img));

      if (editingId) {
        await api.put(`/products/${editingId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        showToast('Product updated ✅', 'success');
      } else {
        await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        showToast('Product created ✅', 'success');
      }
      setShowModal(false);
      fetchAll();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this product permanently?')) return;
    try {
      await api.delete(`/products/${id}`);
      showToast('Product deleted', 'success');
      fetchAll();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const toggleHide = async (id) => {
    await api.patch(`/products/${id}/toggle-hide`);
    fetchAll();
  };

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <Loader fullScreen />;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-display font-bold text-3xl text-ink">Products</h1>
          <p className="text-ink/50 text-sm mt-1">{products.length} products in your catalog</p>
        </div>
        <button onClick={openNew} className="btn-sticker bg-rani text-white px-5 py-2.5 text-sm hover:bg-rani-dark">
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="relative mb-5 max-w-sm">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
        <input
          placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white rounded-full pl-9 pr-4 py-2.5 text-sm shadow-soft focus:outline-none"
        />
      </div>

      <div className="bg-white rounded-3xl shadow-soft overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead>
            <tr className="text-left text-ink/40 text-xs font-semibold border-b-2 border-ink/5">
              <th className="p-4">Product</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Status</th>
              <th className="p-4">Tags</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p._id} className="border-b border-ink/5 last:border-0 hover:bg-blush/20">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-blush shrink-0 overflow-hidden">
                      <img src={resolveImage(p.images[0])} alt="" className="w-full h-full object-contain p-1" />
                    </div>
                    <span className="font-semibold text-ink line-clamp-1">{p.name}</span>
                  </div>
                </td>
                <td className="p-4 text-ink/60">{p.category?.name || '—'}</td>
                <td className="p-4 font-semibold text-ink">₹{p.price}</td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    <StatusPill status={p.isHidden ? 'Inactive' : 'Active'} />
                    {p.availability === 'unavailable' && <StatusPill status="Cancelled" />}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {p.isBestSeller && <span className="text-[10px] bg-marigold/30 text-marigold-dark px-2 py-0.5 rounded-full font-semibold">Bestseller</span>}
                    {p.isFeatured && <span className="text-[10px] bg-rani/15 text-rani px-2 py-0.5 rounded-full font-semibold">Featured</span>}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1.5 justify-end">
                    <button onClick={() => toggleHide(p._id)} title={p.isHidden ? 'Show' : 'Hide'} className="w-8 h-8 rounded-full hover:bg-blush flex items-center justify-center text-ink/40 hover:text-indigo_ink">
                      {p.isHidden ? <Eye size={15} /> : <EyeOff size={15} />}
                    </button>
                    <button onClick={() => openEdit(p)} className="w-8 h-8 rounded-full hover:bg-blush flex items-center justify-center text-ink/40 hover:text-rani">
                      <Edit2 size={15} />
                    </button>
                    <button onClick={() => handleDelete(p._id)} className="w-8 h-8 rounded-full hover:bg-blush flex items-center justify-center text-ink/40 hover:text-rani">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center py-12 text-ink/40 text-sm">No products found.</p>}
      </div>

      {showModal && (
        <Modal title={editingId ? 'Edit Product' : 'Add New Product'} onClose={() => setShowModal(false)} wide>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <input required placeholder="Product Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-blush/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none" />
              <select required value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="bg-blush/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none">
                <option value="">Select Category</option>
                {categories.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <textarea required placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full bg-blush/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none" />

            <div className="grid sm:grid-cols-4 gap-4">
              <input required type="number" placeholder="Price ₹" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="bg-blush/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none" />
              <input type="number" placeholder="Compare-at Price" value={form.compareAtPrice} onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })} className="bg-blush/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none" />
              <input required type="number" placeholder="Production Days" value={form.productionDays} onChange={(e) => setForm({ ...form, productionDays: e.target.value })} className="bg-blush/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none" />
              <select value={form.availability} onChange={(e) => setForm({ ...form, availability: e.target.value })} className="bg-blush/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none">
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
            </div>

            <input placeholder="Tags (comma separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="w-full bg-blush/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none" />

            <div>
              <label className="block text-xs font-semibold text-ink/50 mb-2">Specifications</label>
              {specs.map((s, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <input placeholder="Key (e.g. Material)" value={s.key} onChange={(e) => setSpecs(specs.map((sp, idx) => idx === i ? { ...sp, key: e.target.value } : sp))} className="flex-1 bg-blush/60 rounded-xl px-3.5 py-2 text-sm focus:outline-none" />
                  <input placeholder="Value" value={s.value} onChange={(e) => setSpecs(specs.map((sp, idx) => idx === i ? { ...sp, value: e.target.value } : sp))} className="flex-1 bg-blush/60 rounded-xl px-3.5 py-2 text-sm focus:outline-none" />
                  <button type="button" onClick={() => setSpecs(specs.filter((_, idx) => idx !== i))} className="text-ink/30 hover:text-rani px-2"><X size={16} /></button>
                </div>
              ))}
              <button type="button" onClick={() => setSpecs([...specs, { key: '', value: '' }])} className="text-xs font-semibold text-rani hover:underline">+ Add specification</button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-ink/50 mb-2">Product Images</label>
              <div className="flex flex-wrap gap-3">
                {existingImages.map((img, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden bg-blush">
                    <img src={resolveImage(img)} alt="" className="w-full h-full object-contain p-1" />
                    <button type="button" onClick={() => setExistingImages(existingImages.filter((_, idx) => idx !== i))} className="absolute top-0.5 right-0.5 w-4 h-4 bg-ink/70 rounded-full text-white flex items-center justify-center"><X size={10} /></button>
                  </div>
                ))}
                {newImages.map((img, i) => (
                  <div key={i} className="relative w-16 h-16 rounded-xl overflow-hidden bg-blush">
                    <img src={URL.createObjectURL(img)} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => setNewImages(newImages.filter((_, idx) => idx !== i))} className="absolute top-0.5 right-0.5 w-4 h-4 bg-ink/70 rounded-full text-white flex items-center justify-center"><X size={10} /></button>
                  </div>
                ))}
                <label className="w-16 h-16 rounded-xl border-2 border-dashed border-ink/20 flex items-center justify-center cursor-pointer hover:border-rani text-ink/40 hover:text-rani text-xs">
                  <Plus size={18} />
                  <input type="file" accept="image/*" multiple hidden onChange={(e) => setNewImages([...newImages, ...Array.from(e.target.files)])} />
                </label>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              {[
                { key: 'isFeatured', label: 'Featured' },
                { key: 'isNewArrival', label: 'New Arrival' },
                { key: 'isBestSeller', label: 'Bestseller' },
              ].map((f) => (
                <label key={f.key} className="flex items-center gap-2 text-sm font-semibold text-ink/70 cursor-pointer">
                  <input type="checkbox" checked={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.checked })} className="w-4 h-4 accent-rani" />
                  {f.label}
                </label>
              ))}
            </div>

            <div className="flex gap-2 pt-2">
              <button disabled={saving} className="btn-sticker bg-rani text-white px-6 py-3 text-sm disabled:opacity-60">
                {saving ? 'Saving…' : editingId ? 'Update Product' : 'Create Product'}
              </button>
              <button type="button" onClick={() => setShowModal(false)} className="btn-sticker bg-blush text-ink px-6 py-3 text-sm">Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Products;
