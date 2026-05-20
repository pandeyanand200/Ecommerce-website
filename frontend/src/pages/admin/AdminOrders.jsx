import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiSearch, FiChevronDown } from 'react-icons/fi';
import api from '../../utils/api';
import { formatCurrency } from '../../utils/formatCurrency';
import Loader from '../../components/Loader';
import { toast } from 'react-toastify';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data } = await api.get('/api/admin/orders');
      setOrders(data);
    } catch (error) {
      console.error(error);
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await api.put(`/api/admin/orders/${id}/status`, { status });
      toast.success(`Order status updated to ${status}`);
      fetchOrders();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filteredOrders = filter === 'all' 
    ? orders 
    : orders.filter(order => order.status === filter);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="bg-light min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-serif font-bold text-darkText">Orders Management</h1>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Toolbar */}
          <div className="p-4 border-b border-gray-100 flex flex-wrap justify-between items-center gap-4 bg-gray-50">
            <div className="flex gap-2">
              <button 
                onClick={() => setFilter('all')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'all' ? 'bg-primary text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                All
              </button>
              <button 
                onClick={() => setFilter('pending')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'pending' ? 'bg-yellow-500 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                Pending
              </button>
              <button 
                onClick={() => setFilter('processing')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'processing' ? 'bg-blue-500 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                Processing
              </button>
              <button 
                onClick={() => setFilter('delivered')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filter === 'delivered' ? 'bg-green-500 text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                Delivered
              </button>
            </div>
            
            <div className="relative w-full sm:w-64">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <FiSearch />
              </div>
              <input
                type="text"
                placeholder="Search order ID..."
                className="pl-10 w-full border border-gray-300 rounded-md py-2 px-3 text-sm focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-200 text-sm text-gray-500 uppercase tracking-wider">
                  <th className="p-4 font-medium">Order ID</th>
                  <th className="p-4 font-medium">Customer</th>
                  <th className="p-4 font-medium">Date</th>
                  <th className="p-4 font-medium">Amount</th>
                  <th className="p-4 font-medium">Payment</th>
                  <th className="p-4 font-medium text-center">Status</th>
                  <th className="p-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredOrders.length > 0 ? (
                  filteredOrders.map((order) => (
                    <tr key={order._id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <span className="font-mono text-sm text-darkText font-medium">
                          {order._id.substring(order._id.length - 8).toUpperCase()}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">{order.orderItems?.length || 0} items</p>
                      </td>
                      <td className="p-4">
                        <p className="font-medium text-darkText">{order.user?.name || order.shippingAddress?.name || 'Guest'}</p>
                        <p className="text-xs text-gray-500">{order.user?.email || 'N/A'}</p>
                      </td>
                      <td className="p-4 text-gray-600 text-sm">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="p-4 font-bold text-darkText">
                        {formatCurrency(order.totalPrice)}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                          order.isPaid ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {order.isPaid ? 'Paid' : 'Unpaid'}
                        </span>
                        <p className="text-[10px] text-gray-400 mt-1">{order.paymentMethod}</p>
                      </td>
                      <td className="p-4 text-center">
                        <div className="relative inline-block text-left group">
                          <button className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 ${getStatusColor(order.status)}`}>
                            {order.status} <FiChevronDown />
                          </button>
                          <div className="origin-top-right absolute right-0 mt-2 w-36 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all">
                            <div className="py-1">
                              {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => (
                                <button
                                  key={s}
                                  onClick={() => updateStatus(order._id, s)}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 capitalize"
                                >
                                  {s}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <button className="p-2 text-primary hover:bg-blue-50 rounded transition-colors border border-gray-200" title="View Details">
                          <FiEye size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="p-8 text-center text-gray-500">
                      No orders found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
