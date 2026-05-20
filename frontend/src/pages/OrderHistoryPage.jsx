import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { formatCurrency } from '../utils/formatCurrency';
import Loader from '../components/Loader';
import { FiPackage, FiExternalLink } from 'react-icons/fi';
import { toast } from 'react-toastify';

const OrderHistoryPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const { data } = await api.get('/api/orders/my-orders');
        setOrders(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleCancelOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await api.put(`/api/orders/${orderId}/cancel`);
        toast.success('Order cancelled successfully');
        // Refresh orders list
        const { data } = await api.get('/api/orders/my-orders');
        setOrders(data);
      } catch (error) {
        console.error(error);
        const errMsg = error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : 'Failed to cancel order';
        toast.error(errMsg);
      }
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to remove this order from your history? This action cannot be undone.')) {
      try {
        await api.delete(`/api/orders/${orderId}`);
        toast.success('Order history deleted successfully');
        // Refresh orders list
        const { data } = await api.get('/api/orders/my-orders');
        setOrders(data);
      } catch (error) {
        console.error(error);
        const errMsg = error.response && error.response.data && error.response.data.message
          ? error.response.data.message
          : 'Failed to delete order history';
        toast.error(errMsg);
      }
    }
  };

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
    <div className="bg-light min-h-screen py-10">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="text-3xl font-serif font-bold text-darkText mb-8">My Orders</h1>

        {orders.length === 0 ? (
          <div className="bg-white p-10 rounded-xl shadow-sm border border-gray-100 text-center py-20">
            <div className="w-20 h-20 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiPackage size={40} />
            </div>
            <h2 className="text-2xl font-bold text-darkText mb-4">No orders yet</h2>
            <p className="text-gray-500 mb-8">You haven't placed any orders with us yet.</p>
            <Link to="/shop" className="bg-primary text-white px-8 py-3 rounded font-medium hover:bg-opacity-90">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Order Header */}
                <div className="bg-gray-50 border-b border-gray-100 p-4 md:p-6 flex flex-wrap justify-between items-center gap-4">
                  <div className="flex flex-wrap gap-8">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Order Placed</p>
                      <p className="font-medium text-darkText">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total</p>
                      <p className="font-medium text-darkText">{formatCurrency(order.totalPrice)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Ship To</p>
                      <p className="font-medium text-darkText">{order.shippingAddress?.name}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Order #</p>
                      <p className="font-medium text-darkText">{order._id}</p>
                    </div>
                  </div>
                  
                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="p-4 md:p-6">
                  <div className="space-y-4">
                    {order.orderItems.map((item, index) => (
                      <div key={index} className="flex gap-4 items-center">
                        <Link to={`/product/${item.product}`}>
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-20 h-20 object-cover rounded border border-gray-200"
                          />
                        </Link>
                        <div className="flex-1">
                          <Link to={`/product/${item.product}`} className="font-medium text-darkText hover:text-accent font-serif line-clamp-2">
                            {item.name}
                          </Link>
                          <div className="text-sm text-gray-500 mt-1">
                            Qty: {item.qty} • {formatCurrency(item.price)}
                          </div>
                        </div>
                        <div className="text-right font-bold text-darkText hidden sm:block">
                          {formatCurrency(item.qty * item.price)}
                        </div>
                        <div className="hidden md:block">
                          <button className="text-primary hover:text-accent font-medium text-sm border border-gray-300 px-4 py-2 rounded">
                            Write Review
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Action Footer (Cancel / Delete) */}
                {(order.status === 'pending' || order.status === 'processing' || order.status === 'cancelled' || order.status === 'delivered') && (
                  <div className="bg-gray-50 border-t border-gray-100 p-4 flex justify-end gap-3">
                    {(order.status === 'pending' || order.status === 'processing') && (
                      <button
                        onClick={() => handleCancelOrder(order._id)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 font-medium text-sm border border-red-200 px-4 py-2 rounded-md transition-colors"
                      >
                        Cancel Order
                      </button>
                    )}
                    {(order.status === 'cancelled' || order.status === 'delivered') && (
                      <button
                        onClick={() => handleDeleteOrder(order._id)}
                        className="bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-700 font-medium text-sm border border-gray-300 px-4 py-2 rounded-md transition-colors"
                        title="Remove this order from your history"
                      >
                        Remove Order History
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistoryPage;
