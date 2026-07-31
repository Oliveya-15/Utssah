import { useState, useEffect } from 'react';
import { Check, Mail } from 'lucide-react';
import api from '../api/axios.js';
import { useToast } from '../context/ToastContext.jsx';
import Loader from '../components/Loader.jsx';
import StatusPill from '../components/StatusPill.jsx';

const Messages = () => {
  const { showToast } = useToast();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = () => api.get('/contact/admin/all').then((res) => { setMessages(res.data); setLoading(false); });
  useEffect(() => { fetchAll(); }, []);

  const resolve = async (id) => {
    await api.put(`/contact/${id}/resolve`);
    showToast('Marked as resolved', 'success');
    fetchAll();
  };

  if (loading) return <Loader fullScreen />;

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-ink mb-1">Contact Messages</h1>
      <p className="text-ink/50 text-sm mb-6">{messages.length} messages</p>

      <div className="space-y-4">
        {messages.map((m) => (
          <div key={m._id} className="bg-white rounded-3xl p-5 shadow-soft">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div>
                <p className="font-display font-semibold text-ink text-sm">{m.subject}</p>
                <p className="text-xs text-ink/50 flex items-center gap-1"><Mail size={12} /> {m.name} · {m.email} {m.phone && `· ${m.phone}`}</p>
              </div>
              <StatusPill status={m.isResolved ? 'Active' : 'New'} />
            </div>
            <p className="text-sm text-ink/60">{m.message}</p>
            <p className="text-xs text-ink/40 mt-2">{new Date(m.createdAt).toLocaleString()}</p>
            {!m.isResolved && (
              <button onClick={() => resolve(m._id)} className="btn-sticker bg-mehendi text-white px-3 py-1.5 text-xs mt-3"><Check size={13} /> Mark Resolved</button>
            )}
          </div>
        ))}
        {messages.length === 0 && <p className="text-center py-16 text-ink/40 text-sm bg-white rounded-3xl shadow-soft">No messages yet.</p>}
      </div>
    </div>
  );
};

export default Messages;
