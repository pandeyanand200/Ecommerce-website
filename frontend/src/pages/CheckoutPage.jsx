import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCheckCircle, FiTruck, FiCreditCard } from 'react-icons/fi';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatCurrency';
import { toast } from 'react-toastify';

const CheckoutPage = () => {
  const [step, setStep] = useState(1);
  const { cartItems, cartTotal, clearCart } = useCart();
  const { userInfo } = useAuth();
  const navigate = useNavigate();

  // Step 1: Address State
  const [shippingAddress, setShippingAddress] = useState({
    name: userInfo?.name || '',
    email: userInfo?.email || '',
    phone: userInfo?.phone || '',
    street: userInfo?.address?.street || '',
    city: userInfo?.address?.city || '',
    state: userInfo?.address?.state || '',
    pincode: userInfo?.address?.pincode || '',
    country: userInfo?.address?.country || 'India',
  });

  // Step 2: Payment Method
  const [paymentMethod, setPaymentMethod] = useState('razorpay');

  // Step 3: Order Confirmation
  const [orderId, setOrderId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cartItems.length === 0 && step !== 3) {
      navigate('/cart');
    }
  }, [cartItems, navigate, step]);

  const taxPrice = cartTotal * 0.18;
  const shippingPrice = cartTotal > 499 ? 0 : 50;
  const totalPrice = cartTotal + taxPrice + shippingPrice;

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const submitAddress = (e) => {
    e.preventDefault();
    setStep(2);
  };

  const placeOrder = async () => {
    try {
      setLoading(true);
      const orderItems = cartItems.map((item) => ({
        name: item.product.name,
        qty: item.quantity,
        image: item.product.images[0],
        price: item.price,
        product: item.product._id,
      }));

      const { data } = await api.post('/api/orders', {
        orderItems,
        shippingAddress,
        paymentMethod,
        itemsPrice: cartTotal,
        taxPrice,
        shippingPrice,
        totalPrice,
      });

      if (paymentMethod === 'razorpay') {
        handleRazorpayPayment(data);
      } else {
        // COD logic
        await clearCart();
        setOrderId(data._id);
        setStep(3);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error placing order');
    } finally {
      setLoading(false);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleRazorpayPayment = async (order) => {
    const res = await loadRazorpayScript();

    if (!res) {
      toast.error('Razorpay SDK failed to load. Are you online?');
      return;
    }

    try {
      const { data: razorpayOrder } = await api.post('/api/orders/razorpay/create', {
        amount: totalPrice,
      });

      const options = {
        key: 'your_razorpay_key_id', // Needs to come from env ideally, or public endpoint
        amount: razorpayOrder.amount,
        currency: 'INR',
        name: 'LuxeStore',
        description: 'Payment for your order',
        order_id: razorpayOrder.id,
        handler: async function (response) {
          try {
            await api.post('/api/orders/razorpay/verify', {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderId: order._id,
            });

            await clearCart();
            setOrderId(order._id);
            setStep(3);
            toast.success('Payment successful!');
          } catch (error) {
            toast.error('Payment verification failed');
          }
        },
        prefill: {
          name: shippingAddress.name,
          email: shippingAddress.email,
          contact: shippingAddress.phone,
        },
        theme: {
          color: '#0F172A',
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      toast.error('Could not create Razorpay order');
    }
  };

  return (
    <div className="bg-light min-h-screen py-10">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Progress Bar */}
        <div className="mb-10">
          <div className="flex items-center justify-between relative">
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-gray-200 z-0 rounded-full"></div>
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-accent z-0 rounded-full transition-all duration-500"
              style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : '100%' }}
            ></div>
            
            <div className={`relative z-10 flex flex-col items-center ${step >= 1 ? 'text-accent' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-colors ${step >= 1 ? 'bg-accent text-white' : 'bg-gray-200 text-gray-500'}`}>
                {step > 1 ? <FiCheckCircle size={20} /> : 1}
              </div>
              <span className="text-sm font-medium">Delivery</span>
            </div>
            
            <div className={`relative z-10 flex flex-col items-center ${step >= 2 ? 'text-accent' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-colors ${step >= 2 ? 'bg-accent text-white' : 'bg-gray-200 text-gray-500'}`}>
                {step > 2 ? <FiCheckCircle size={20} /> : 2}
              </div>
              <span className="text-sm font-medium">Payment</span>
            </div>
            
            <div className={`relative z-10 flex flex-col items-center ${step >= 3 ? 'text-accent' : 'text-gray-400'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold mb-2 transition-colors ${step >= 3 ? 'bg-accent text-white' : 'bg-gray-200 text-gray-500'}`}>
                3
              </div>
              <span className="text-sm font-medium">Confirmation</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Step 1: Delivery Address */}
          {step === 1 && (
            <div className="p-6 md:p-10">
              <h2 className="text-2xl font-serif font-bold text-darkText mb-6 flex items-center gap-3">
                <FiTruck className="text-accent" /> Shipping Address
              </h2>
              
              <form onSubmit={submitAddress}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input 
                      type="text" required name="name"
                      value={shippingAddress.name} onChange={handleAddressChange}
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input 
                      type="email" required name="email"
                      value={shippingAddress.email} onChange={handleAddressChange}
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                    <input 
                      type="tel" required name="phone"
                      value={shippingAddress.phone} onChange={handleAddressChange}
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                    <select 
                      name="country" value={shippingAddress.country} onChange={handleAddressChange}
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                    >
                      <option value="India">India</option>
                      <option value="USA">USA</option>
                      <option value="UK">UK</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
                    <input 
                      type="text" required name="street"
                      value={shippingAddress.street} onChange={handleAddressChange}
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <input 
                      type="text" required name="city"
                      value={shippingAddress.city} onChange={handleAddressChange}
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State / Province</label>
                    <input 
                      type="text" required name="state"
                      value={shippingAddress.state} onChange={handleAddressChange}
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pincode / Zip</label>
                    <input 
                      type="text" required name="pincode"
                      value={shippingAddress.pincode} onChange={handleAddressChange}
                      className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end pt-4 border-t border-gray-100">
                  <button 
                    type="submit"
                    className="bg-primary text-white font-medium py-3 px-8 rounded-md hover:bg-opacity-90 transition-colors"
                  >
                    Continue to Payment
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Step 2: Payment */}
          {step === 2 && (
            <div className="flex flex-col md:flex-row">
              <div className="p-6 md:p-10 flex-1 border-r border-gray-100">
                <h2 className="text-2xl font-serif font-bold text-darkText mb-6 flex items-center gap-3">
                  <FiCreditCard className="text-accent" /> Payment Method
                </h2>
                
                <div className="space-y-4 mb-8">
                  <label className={`block border rounded-lg p-4 cursor-pointer transition-colors ${paymentMethod === 'razorpay' ? 'border-accent bg-yellow-50/50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="flex items-center gap-4">
                      <input 
                        type="radio" 
                        name="payment" 
                        value="razorpay"
                        checked={paymentMethod === 'razorpay'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5 text-accent focus:ring-accent"
                      />
                      <div className="flex-1">
                        <p className="font-bold text-darkText">Razorpay</p>
                        <p className="text-sm text-gray-500">Pay via UPI, Cards, NetBanking, Wallets</p>
                      </div>
                      <div className="flex gap-1">
                        <div className="w-8 h-5 bg-gray-200 rounded"></div>
                        <div className="w-8 h-5 bg-gray-200 rounded"></div>
                        <div className="w-8 h-5 bg-gray-200 rounded"></div>
                      </div>
                    </div>
                  </label>
                  
                  <label className={`block border rounded-lg p-4 cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-accent bg-yellow-50/50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="flex items-center gap-4">
                      <input 
                        type="radio" 
                        name="payment" 
                        value="cod"
                        checked={paymentMethod === 'cod'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        className="w-5 h-5 text-accent focus:ring-accent"
                      />
                      <div className="flex-1">
                        <p className="font-bold text-darkText">Cash on Delivery</p>
                        <p className="text-sm text-gray-500">Pay when your order arrives</p>
                      </div>
                    </div>
                  </label>
                </div>

                <div className="flex justify-between pt-4 border-t border-gray-100">
                  <button 
                    onClick={() => setStep(1)}
                    className="text-gray-600 font-medium py-3 px-6 hover:text-darkText transition-colors"
                  >
                    Back to Address
                  </button>
                  <button 
                    onClick={placeOrder}
                    disabled={loading}
                    className="bg-accent hover:bg-yellow-600 text-white font-bold py-3 px-8 rounded-md transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Processing...' : 'Place Order'}
                  </button>
                </div>
              </div>
              
              {/* Order Summary Sidebar */}
              <div className="p-6 md:p-10 w-full md:w-80 bg-gray-50">
                <h3 className="font-bold font-serif text-lg mb-4 text-darkText">Order Summary</h3>
                <div className="space-y-4 mb-6 max-h-60 overflow-y-auto pr-2">
                  {cartItems.map((item) => (
                    <div key={item.product._id} className="flex gap-3">
                      <img src={item.product.images[0]} alt={item.product.name} className="w-12 h-12 object-cover rounded border border-gray-200" />
                      <div className="flex-1 text-sm">
                        <p className="font-medium text-darkText line-clamp-1">{item.product.name}</p>
                        <p className="text-gray-500 text-xs">Qty: {item.quantity}</p>
                        <p className="font-medium text-darkText">{formatCurrency(item.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="space-y-2 text-sm border-t border-gray-200 pt-4 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">{formatCurrency(cartTotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">{shippingPrice === 0 ? 'Free' : formatCurrency(shippingPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">{formatCurrency(taxPrice)}</span>
                  </div>
                </div>
                
                <div className="flex justify-between border-t border-gray-200 pt-4">
                  <span className="font-bold text-lg text-darkText">Total</span>
                  <span className="font-bold text-xl text-accent">{formatCurrency(totalPrice)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && (
            <div className="p-10 text-center">
              <div className="w-20 h-20 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiCheckCircle size={40} />
              </div>
              <h2 className="text-3xl font-serif font-bold text-darkText mb-2">Order Confirmed!</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Thank you for your purchase. We've received your order and will process it shortly.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-6 max-w-sm mx-auto mb-8 border border-gray-100">
                <p className="text-sm text-gray-500 mb-1">Order Reference ID</p>
                <p className="font-mono font-bold text-lg text-darkText">{orderId}</p>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button 
                  onClick={() => navigate('/my-orders')}
                  className="bg-primary text-white font-medium py-3 px-6 rounded-md hover:bg-opacity-90 transition-colors"
                >
                  View My Orders
                </button>
                <button 
                  onClick={() => navigate('/shop')}
                  className="bg-white border border-gray-300 text-darkText font-medium py-3 px-6 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
