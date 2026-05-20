import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiDollarSign, 
  FiShoppingBag, 
  FiPackage, 
  FiUsers,
  FiArrowUp,
  FiArrowDown
} from 'react-icons/fi';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/formatCurrency';
import Loader from '../../components/Loader';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/api/admin/dashboard');
        setStats(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <Loader />;

  return (
    <div className="bg-light min-h-screen py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-serif font-bold text-darkText">Dashboard Overview</h1>
          <div className="flex gap-4">
            <Link to="/admin/products/add" className="bg-primary text-white px-4 py-2 rounded shadow-sm hover:bg-opacity-90">
              Add Product
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Total Revenue</p>
              <h3 className="text-2xl font-bold text-darkText">{formatCurrency(stats?.totalRevenue || 0)}</h3>
              <p className="text-sm text-green-500 flex items-center gap-1 mt-2">
                <FiArrowUp /> 12.5% <span className="text-gray-400 ml-1">vs last month</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
              <FiDollarSign size={24} />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Total Orders</p>
              <h3 className="text-2xl font-bold text-darkText">{stats?.totalOrders || 0}</h3>
              <p className="text-sm text-green-500 flex items-center gap-1 mt-2">
                <FiArrowUp /> 8.2% <span className="text-gray-400 ml-1">vs last month</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <FiShoppingBag size={24} />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Total Products</p>
              <h3 className="text-2xl font-bold text-darkText">{stats?.totalProducts || 0}</h3>
              <p className="text-sm text-gray-400 flex items-center gap-1 mt-2">
                Across all categories
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center">
              <FiPackage size={24} />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Total Customers</p>
              <h3 className="text-2xl font-bold text-darkText">{stats?.totalCustomers || 0}</h3>
              <p className="text-sm text-red-500 flex items-center gap-1 mt-2">
                <FiArrowDown /> 2.1% <span className="text-gray-400 ml-1">vs last month</span>
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center">
              <FiUsers size={24} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-bold text-darkText mb-6">Revenue Over Time (Last 6 Months)</h3>
            <div className="h-80">
              {stats?.chartData && stats.chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#888', fontSize: 12}} dy={10} />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#888', fontSize: 12}} 
                      tickFormatter={(value) => `₹${value/1000}k`}
                    />
                    <Tooltip 
                      formatter={(value) => [`₹${value}`, 'Revenue']}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                    />
                    <Line type="monotone" dataKey="revenue" stroke="#0F172A" strokeWidth={3} dot={{r: 4, strokeWidth: 2}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-gray-400">Not enough data to display chart</div>
              )}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-darkText">Recent Orders</h3>
              <Link to="/admin/orders" className="text-sm text-accent hover:underline">View All</Link>
            </div>
            
            <div className="space-y-4">
              {stats?.recentOrders && stats.recentOrders.length > 0 ? (
                stats.recentOrders.map(order => (
                  <div key={order._id} className="flex justify-between items-center border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                    <div>
                      <p className="font-medium text-darkText text-sm">{order.user?.name || 'Guest User'}</p>
                      <p className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-darkText text-sm">{formatCurrency(order.totalPrice)}</p>
                      <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                        order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'shipped' ? 'bg-purple-100 text-purple-800' :
                        order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No recent orders</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
