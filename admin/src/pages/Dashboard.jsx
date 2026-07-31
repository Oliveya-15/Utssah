import { useState, useEffect } from 'react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { IndianRupee, ShoppingBag, TrendingUp, Cake, Repeat, Users } from 'lucide-react';
import api from '../api/axios.js';
import StatCard from '../components/StatCard.jsx';
import Loader from '../components/Loader.jsx';

const Dashboard = () => {
  const [revenue, setRevenue] = useState(null);
  const [crm, setCrm] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/orders/admin/dashboard/revenue'), api.get('/orders/admin/dashboard/crm')])
      .then(([rev, c]) => { setRevenue(rev.data); setCrm(c.data); })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader fullScreen />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display font-bold text-3xl text-ink">Dashboard</h1>
        <p className="text-ink/50 text-sm mt-1">A little overview of how Utsaah is doing 🌸</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<IndianRupee size={18} />} label="Total Revenue" value={`₹${revenue.totalRevenue.toLocaleString('en-IN')}`} accent="bg-rani" />
        <StatCard icon={<ShoppingBag size={18} />} label="Total Orders" value={revenue.totalOrders} accent="bg-mehendi" />
        <StatCard icon={<TrendingUp size={18} />} label="Avg. Order Value" value={`₹${revenue.avgOrderValue}`} accent="bg-marigold" />
        <StatCard icon={<Users size={18} />} label="Total Customers" value={crm.totalCustomers} accent="bg-indigo_ink" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-soft">
          <h3 className="font-display font-bold text-lg text-ink mb-4">Monthly Revenue</h3>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={revenue.monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A1B3D10" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#2A1B3D80' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#2A1B3D80' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => [`₹${v}`, 'Revenue']} contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Line type="monotone" dataKey="revenue" stroke="#D6336C" strokeWidth={3} dot={{ fill: '#D6336C', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-soft">
          <h3 className="font-display font-bold text-lg text-ink mb-4">Top Selling Products</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={revenue.topProducts} layout="vertical" margin={{ left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2A1B3D10" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fill: '#2A1B3D80' }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" width={120} tick={{ fontSize: 11, fill: '#2A1B3D80' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }} />
              <Bar dataKey="unitsSold" fill="#F5A524" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 shadow-soft">
          <h3 className="font-display font-bold text-lg text-ink mb-4 flex items-center gap-2">
            <Cake size={18} className="text-rani" /> Birthdays This Month
          </h3>
          {crm.birthdaysThisMonth.length === 0 ? (
            <p className="text-sm text-ink/40 py-6 text-center">No customer birthdays this month.</p>
          ) : (
            <div className="space-y-2">
              {crm.birthdaysThisMonth.map((u) => (
                <div key={u._id} className="flex items-center justify-between py-2 border-b border-ink/5 last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-ink">{u.name}</p>
                    <p className="text-xs text-ink/40">{u.email}</p>
                  </div>
                  <span className="text-xs font-semibold bg-butter text-marigold-dark px-2.5 py-1 rounded-full">
                    {new Date(u.birthday).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-soft">
          <h3 className="font-display font-bold text-lg text-ink mb-4 flex items-center gap-2">
            <Repeat size={18} className="text-rani" /> Repeat Customers
          </h3>
          {crm.repeatCustomers.length === 0 ? (
            <p className="text-sm text-ink/40 py-6 text-center">No repeat customers yet.</p>
          ) : (
            <div className="space-y-2">
              {crm.repeatCustomers.map((u) => (
                <div key={u._id} className="flex items-center justify-between py-2 border-b border-ink/5 last:border-0">
                  <div>
                    <p className="text-sm font-semibold text-ink">{u.name}</p>
                    <p className="text-xs text-ink/40">{u.email}</p>
                  </div>
                  <span className="text-xs font-semibold bg-mint text-mehendi-dark px-2.5 py-1 rounded-full">{u.orderCount} orders</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
