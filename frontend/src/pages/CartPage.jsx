import { Link, useNavigate } from 'react-router-dom';
import { FiTrash2, FiMinus, FiPlus, FiArrowRight, FiShoppingBag } from 'react-icons/fi';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatCurrency';

const CartPage = () => {
  const { cartItems, updateQuantity, removeFromCart, cartTotal } = useCart();
  const { userInfo } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    if (!userInfo) {
      navigate('/login?redirect=/checkout');
    } else {
      navigate('/checkout');
    }
  };

  const tax = cartTotal * 0.18; // 18% GST
  const shipping = cartTotal > 499 ? 0 : 50;
  const grandTotal = cartTotal + tax + shipping;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-light px-4">
        <div className="bg-white p-10 rounded-2xl shadow-sm text-center max-w-md w-full">
          <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <FiShoppingBag size={48} />
          </div>
          <h2 className="text-2xl font-serif font-bold text-darkText mb-3">Your cart is empty</h2>
          <p className="text-gray-500 mb-8">Looks like you haven't added anything to your cart yet.</p>
          <Link 
            to="/shop" 
            className="block w-full bg-primary hover:bg-opacity-90 text-white font-medium py-3 px-6 rounded-md transition-colors"
          >
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-h-screen py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-serif font-bold text-darkText mb-8">Shopping Cart</h1>
        
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Column: Cart Items */}
          <div className="lg:w-2/3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="hidden md:grid grid-cols-6 gap-4 p-4 border-b border-gray-100 bg-gray-50 font-medium text-gray-600 text-sm uppercase tracking-wider">
                <div className="col-span-3">Product</div>
                <div className="text-center">Price</div>
                <div className="text-center">Quantity</div>
                <div className="text-right">Total</div>
              </div>
              
              <div className="divide-y divide-gray-100">
                {cartItems.map((item) => (
                  <div key={item.product._id} className="p-4 sm:p-6 flex flex-col md:grid md:grid-cols-6 gap-4 items-center">
                    {/* Product Info */}
                    <div className="col-span-3 flex w-full gap-4">
                      <Link to={`/product/${item.product._id}`} className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-gray-50 rounded-md border border-gray-100 overflow-hidden">
                        <img 
                          src={item.product.images && item.product.images[0] ? item.product.images[0] : '/placeholder.jpg'} 
                          alt={item.product.name} 
                          className="w-full h-full object-cover"
                        />
                      </Link>
                      <div className="flex flex-col flex-1 justify-center">
                        <div className="text-xs text-accent font-medium mb-1 uppercase tracking-wider">{item.product.category}</div>
                        <Link to={`/product/${item.product._id}`} className="font-serif font-medium text-darkText hover:text-accent transition-colors line-clamp-2">
                          {item.product.name}
                        </Link>
                        <button 
                          onClick={() => removeFromCart(item.product._id)}
                          className="text-red-500 hover:text-red-700 text-sm flex items-center gap-1 mt-2 w-max"
                        >
                          <FiTrash2 size={14} /> Remove
                        </button>
                      </div>
                    </div>
                    
                    {/* Price - Mobile vs Desktop */}
                    <div className="hidden md:block text-center font-medium text-gray-700">
                      {formatCurrency(item.price)}
                    </div>
                    
                    {/* Quantity & Price Mobile layout */}
                    <div className="w-full md:w-auto md:col-span-1 flex justify-between md:justify-center items-center mt-2 md:mt-0">
                      <div className="md:hidden font-medium text-gray-700">
                        {formatCurrency(item.price)}
                      </div>
                      <div className="flex items-center border border-gray-300 rounded-md bg-white">
                        <button 
                          onClick={() => updateQuantity(item.product._id, Math.max(1, item.quantity - 1))}
                          className="p-2 text-gray-600 hover:text-accent hover:bg-gray-50 transition-colors"
                        >
                          <FiMinus size={14} />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.product._id, Math.min(item.product.stock, item.quantity + 1))}
                          className="p-2 text-gray-600 hover:text-accent hover:bg-gray-50 transition-colors"
                        >
                          <FiPlus size={14} />
                        </button>
                      </div>
                    </div>
                    
                    {/* Item Total */}
                    <div className="hidden md:block text-right font-bold text-darkText">
                      {formatCurrency(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Right Column: Order Summary */}
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              <h2 className="text-xl font-bold font-serif text-darkText mb-6 border-b border-gray-100 pb-4">Order Summary</h2>
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal ({cartItems.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
                  <span className="font-medium text-darkText">{formatCurrency(cartTotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping Estimate</span>
                  <span className="font-medium text-darkText">
                    {shipping === 0 ? <span className="text-green-600">Free</span> : formatCurrency(shipping)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Tax (18% GST)</span>
                  <span className="font-medium text-darkText">{formatCurrency(tax)}</span>
                </div>
                <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                  <span className="text-lg font-bold text-darkText">Total</span>
                  <span className="text-2xl font-bold text-accent">{formatCurrency(grandTotal)}</span>
                </div>
              </div>
              
              {/* Promo Code */}
              <div className="mb-6">
                <p className="text-sm text-gray-600 mb-2 font-medium">Promo Code</p>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    placeholder="Enter code" 
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-accent"
                  />
                  <button className="bg-gray-800 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-900 transition-colors">
                    Apply
                  </button>
                </div>
              </div>
              
              <button 
                onClick={handleCheckout}
                className="w-full bg-accent hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-md transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                Proceed to Checkout <FiArrowRight />
              </button>
              
              <div className="mt-4 text-center">
                <Link to="/shop" className="text-sm text-accent hover:underline">
                  or Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
