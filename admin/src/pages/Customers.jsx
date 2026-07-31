import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronRight } from 'lucide-react';
import api from '../api/axios.js';
import Loader from '../components/Loader.jsx';
import StatusPill from '../components/StatusPill.jsx';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/users/admin/customers').then((res) => { setCustomers(res.data); setLoading(false); });
  }, []);

  const filtered = customers.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()) || c.email.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <Loader fullScreen />;

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-ink mb-1">Customers</h1>
      <p className="text-ink/50 text-sm mb-6">{customers.length} registered customers</p>

      <div className="relative mb-5 max-w-sm">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink/40" />
        <input placeholder="Search customers…" value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-white rounded-full pl-9 pr-4 py-2.5 text-sm shadow-soft focus:outline-none" />
      </div>

      <div className="bg-white rounded-3xl shadow-soft overflow-hidden overflow-x-auto">
        <table className="w-full text-sm min-w-[700px]">
          <thead>
            <tr className="text-left text-ink/40 text-xs font-semibold border-b-2 border-ink/5">
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Orders</th>
              <th className="p-4">Total Spent</th>
              <th className="p-4">Wallet</th>
              <th className="p-4">Status</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c._id} className="border-b border-ink/5 last:border-0 hover:bg-blush/20">
                <td className="p-4 font-semibold text-ink">{c.name}</td>
                <td className="p-4 text-ink/60">{c.email}</td>
                <td className="p-4 text-ink/60">{c.totalOrders}</td>
                <td className="p-4 font-semibold text-ink">₹{c.totalSpent}</td>
                <td className="p-4 text-ink/60">₹{c.walletBalance}</td>
                <td className="p-4"><StatusPill status={c.isActive ? 'Active' : 'Inactive'} /></td>
                <td className="p-4">
                  <Link to={`/customers/${c._id}`} className="w-8 h-8 rounded-full hover:bg-blush flex items-center justify-center text-ink/40 hover:text-rani ml-auto"><ChevronRight size={16} /></Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <p className="text-center py-12 text-ink/40 text-sm">No customers found.</p>}
      </div>
    </div>
  );
};

export default Customers;
