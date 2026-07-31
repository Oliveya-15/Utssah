import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useAuth } from '../../context/AuthContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import api from '../../api/axios.js';

const PersonalInfo = () => {
  const { user, updateUserLocal } = useAuth();
  const { showToast } = useToast();
  const [form, setForm] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    birthday: user?.birthday ? user.birthday.slice(0, 10) : '',
  });
  const [saving, setSaving] = useState(false);

  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '' });
  const [pwSaving, setPwSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/users/profile', form);
      updateUserLocal(data);
      showToast('Profile updated ✅', 'success');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwSaving(true);
    try {
      await api.put('/users/change-password', pwForm);
      showToast('Password updated ✅', 'success');
      setPwForm({ currentPassword: '', newPassword: '' });
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setPwSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <Helmet><title>Personal Info — Utsaah</title></Helmet>

      <div className="bg-white rounded-3xl p-6 shadow-soft">
        <h2 className="font-display font-bold text-lg text-ink mb-4">Personal Information</h2>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink/50 mb-1.5">Full Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-blush/60 rounded-xl px-4 py-3 text-sm focus:outline-none" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink/50 mb-1.5">Email (cannot be changed)</label>
            <input value={user?.email} disabled className="w-full bg-ink/5 rounded-xl px-4 py-3 text-sm text-ink/40" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-ink/50 mb-1.5">Phone</label>
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full bg-blush/60 rounded-xl px-4 py-3 text-sm focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-ink/50 mb-1.5">Birthday 🎂</label>
              <input type="date" value={form.birthday} onChange={(e) => setForm({ ...form, birthday: e.target.value })} className="w-full bg-blush/60 rounded-xl px-4 py-3 text-sm focus:outline-none" />
            </div>
          </div>
          <button disabled={saving} className="btn-sticker bg-rani text-white px-6 py-3 text-sm disabled:opacity-60">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
        </form>
      </div>

      <div className="bg-white rounded-3xl p-6 shadow-soft">
        <h2 className="font-display font-bold text-lg text-ink mb-4">Change Password</h2>
        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-sm">
          <input
            type="password" required placeholder="Current Password"
            value={pwForm.currentPassword} onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
            className="w-full bg-blush/60 rounded-xl px-4 py-3 text-sm focus:outline-none"
          />
          <input
            type="password" required minLength={6} placeholder="New Password"
            value={pwForm.newPassword} onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
            className="w-full bg-blush/60 rounded-xl px-4 py-3 text-sm focus:outline-none"
          />
          <button disabled={pwSaving} className="btn-sticker bg-ink text-white px-6 py-3 text-sm disabled:opacity-60">
            {pwSaving ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PersonalInfo;
