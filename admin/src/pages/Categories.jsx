import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import api, { resolveImage } from '../api/axios.js';
import { useToast } from '../context/ToastContext.jsx';
import Loader from '../components/Loader.jsx';
import Modal from '../components/Modal.jsx';

const emptyForm = { name: '', description: '', icon: '', displayOrder: 0 };

const Categories = () => {
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [image, setImage] = useState(null);
  const [saving, setSaving] = useState(false);

  const fetchAll = () => api.get('/categories/admin/all').then((res) => { setCategories(res.data); setLoading(false); });
  useEffect(() => { fetchAll(); }, []);

  const openNew = () => { setForm(emptyForm); setImage(null); setEditingId(null); setShowModal(true); };
  const openEdit = (c) => {
    setForm({ name: c.name, description: c.description, icon: c.icon, displayOrder: c.displayOrder });
    setImage(null);
    setEditingId(c._id);
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (image) fd.append('image', image);
      if (editingId) {
        await api.put(`/categories/${editingId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        showToast('Category updated', 'success');
      } else {
        await api.post('/categories', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        showToast('Category created', 'success');
      }
      setShowModal(false);
      fetchAll();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (c) => {
    await api.put(`/categories/${c._id}`, { isActive: !c.isActive });
    fetchAll();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return;
    try {
      await api.delete(`/categories/${id}`);
      showToast('Category deleted', 'success');
      fetchAll();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display font-bold text-3xl text-ink">Categories</h1>
          <p className="text-ink/50 text-sm mt-1">{categories.length} categories</p>
        </div>
        <button onClick={openNew} className="btn-sticker bg-rani text-white px-5 py-2.5 text-sm hover:bg-rani-dark">
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((c) => (
          <div key={c._id} className="bg-white rounded-3xl p-5 shadow-soft">
            <div className="flex items-start justify-between mb-3">
              <span className="text-3xl">
                <img src="/favicon.png" alt="Utsaah" className="h-8 w-auto inline-block" />
              </span>
              <div className="flex gap-1">
                <button onClick={() => openEdit(c)} className="w-8 h-8 rounded-full hover:bg-blush flex items-center justify-center text-ink/40 hover:text-rani"><Edit2 size={14} /></button>
                <button onClick={() => handleDelete(c._id)} className="w-8 h-8 rounded-full hover:bg-blush flex items-center justify-center text-ink/40 hover:text-rani"><Trash2 size={14} /></button>
              </div>
            </div>
            <h3 className="font-display font-semibold text-ink mb-1">{c.name}</h3>
            <p className="text-xs text-ink/50 line-clamp-2 mb-3">{c.description}</p>
            <label className="flex items-center gap-2 text-xs font-semibold text-ink/60 cursor-pointer">
              <input type="checkbox" checked={c.isActive} onChange={() => toggleActive(c)} className="accent-rani" /> Active
            </label>
          </div>
        ))}
      </div>

      {showModal && (
        <Modal title={editingId ? 'Edit Category' : 'Add Category'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <input required placeholder="Category Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-blush/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none" />
            <textarea placeholder="Description" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full bg-blush/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none" />
            <div className="grid grid-cols-2 gap-4">
              <input placeholder="Icon (emoji)" value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })} className="bg-blush/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none" />
              <input type="number" placeholder="Display Order" value={form.displayOrder} onChange={(e) => setForm({ ...form, displayOrder: e.target.value })} className="bg-blush/60 rounded-xl px-4 py-2.5 text-sm focus:outline-none" />
            </div>
            <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} className="text-sm" />
            <div className="flex gap-2 pt-2">
              <button disabled={saving} className="btn-sticker bg-rani text-white px-6 py-3 text-sm disabled:opacity-60">{saving ? 'Saving…' : 'Save'}</button>
              <button type="button" onClick={() => setShowModal(false)} className="btn-sticker bg-blush text-ink px-6 py-3 text-sm">Cancel</button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Categories;
