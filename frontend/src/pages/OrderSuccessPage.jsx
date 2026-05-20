import { Link } from 'react-router-dom';
import { FiCheckCircle } from 'react-icons/fi';

const OrderSuccessPage = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-light px-4">
      <div className="bg-white p-10 rounded-2xl shadow-sm border border-gray-100 text-center max-w-md w-full">
        <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
          <FiCheckCircle size={40} />
        </div>
        <h2 className="text-3xl font-serif font-bold text-darkText mb-2">Order Successful!</h2>
        <p className="text-gray-500 mb-8">
          Thank you for shopping with LuxeStore. Your order has been placed successfully.
        </p>
        
        <div className="flex flex-col gap-3">
          <Link 
            to="/my-orders" 
            className="w-full bg-primary hover:bg-opacity-90 text-white font-medium py-3 px-6 rounded-md transition-colors"
          >
            View My Orders
          </Link>
          <Link 
            to="/shop" 
            className="w-full bg-white border border-gray-300 hover:bg-gray-50 text-darkText font-medium py-3 px-6 rounded-md transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
