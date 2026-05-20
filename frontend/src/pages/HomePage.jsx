import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiTruck, FiShield, FiRefreshCw, FiHeadphones } from 'react-icons/fi';
import { LuLaptop, LuShirt, LuSofa, LuSparkles, LuDumbbell, LuBookOpen } from 'react-icons/lu';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';

const HomePage = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Countdown timer state
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data: featured } = await api.get('/api/products/featured');
        setFeaturedProducts(featured);
        
        const { data: all } = await api.get('/api/products?sort=newest&pageSize=6');
        setNewArrivals(all.products);
      } catch (error) {
        console.error('Error fetching products', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();

    // Set countdown target to 7 days from now
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 7);

    const timer = setInterval(() => {
      const now = new Date();
      const difference = targetDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const categories = [
    { name: 'Electronics', icon: LuLaptop, count: '120+ Products', color: 'bg-blue-100', textColor: 'text-blue-600' },
    { name: 'Fashion', icon: LuShirt, count: '300+ Products', color: 'bg-pink-100', textColor: 'text-pink-600' },
    { name: 'Home and Living', icon: LuSofa, count: '150+ Products', color: 'bg-green-100', textColor: 'text-green-600' },
    { name: 'Beauty', icon: LuSparkles, count: '80+ Products', color: 'bg-purple-100', textColor: 'text-purple-600' },
    { name: 'Sports', icon: LuDumbbell, count: '90+ Products', color: 'bg-orange-100', textColor: 'text-orange-600' },
    { name: 'Books', icon: LuBookOpen, count: '200+ Products', color: 'bg-yellow-100', textColor: 'text-yellow-700' },
  ];

  const reviews = [
    {
      id: 1,
      rating: 5,
      text: "The quality of the products I received exceeded my expectations. Fast shipping and excellent customer service!",
      name: "Sarah Johnson",
      city: "New York",
      initials: "SJ"
    },
    {
      id: 2,
      rating: 5,
      text: "I've been shopping here for months. They always have the best electronics deals. Highly recommended.",
      name: "Michael Chen",
      city: "San Francisco",
      initials: "MC"
    },
    {
      id: 3,
      rating: 5,
      text: "Beautiful fashion collection and the checkout process was incredibly smooth. Will definitely buy again.",
      name: "Emma Davis",
      city: "Chicago",
      initials: "ED"
    }
  ];

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-light">
      {/* Section 1 - Hero Banner */}
      <section className="relative bg-primary text-white overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/90 to-transparent z-10"></div>
        {/* Placeholder for background image */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-50"></div>
        
        <div className="container mx-auto px-4 py-24 md:py-32 relative z-20">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-6xl font-serif font-bold leading-tight mb-6">
              Discover Products <br/><span className="text-accent">You Will Love</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 mb-8 font-light">
              Shop thousands of products across every category. Experience premium quality and exceptional service.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/shop" className="bg-accent text-white px-8 py-3 rounded-md font-medium hover:bg-opacity-90 transition-all shadow-lg">
                Shop Now
              </Link>
              <Link to="/collections" className="bg-transparent border border-white text-white px-8 py-3 rounded-md font-medium hover:bg-white hover:text-primary transition-all">
                View Collections
              </Link>
            </div>
          </div>
        </div>
        
        <div className="hidden md:block absolute bottom-8 right-8 z-20 bg-white p-4 rounded-lg shadow-xl text-darkText animate-bounce">
          <div className="flex items-center gap-3">
            <div className="bg-accent/20 p-2 rounded-full text-accent">
              <FiTruck size={24} />
            </div>
            <div>
              <p className="font-bold text-sm">Free Shipping</p>
              <p className="text-xs text-mutedText">on orders above ₹499</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2 - Category Grid */}
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-3xl font-serif font-bold text-center mb-10 text-darkText">Shop By Category</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((cat, idx) => (
            <div 
              key={idx} 
              onClick={() => navigate(`/shop?category=${cat.name}`)}
              className={`${cat.color} rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-md transition-all transform hover:-translate-y-1`}
            >
              <cat.icon className={`mb-3 ${cat.textColor}`} size={40} />
              <h3 className="font-medium text-darkText mb-1">{cat.name}</h3>
              <p className="text-xs text-mutedText">{cat.count}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Section 3 - Featured Products */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-10">
            <h2 className="text-3xl font-serif font-bold text-darkText">Featured Products</h2>
            <Link to="/shop" className="text-accent font-medium hover:underline">View All</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Section 4 - Promotional Banner */}
      <section className="bg-primary text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4">Summer Sale — Up to 50% Off</h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">Don't miss out on our biggest sale of the year. Grab your favorite items before they are gone!</p>
          
          <div className="flex justify-center gap-4 mb-8">
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 min-w-[80px]">
              <div className="text-3xl font-bold text-accent">{timeLeft.days}</div>
              <div className="text-xs uppercase tracking-wider">Days</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 min-w-[80px]">
              <div className="text-3xl font-bold text-accent">{timeLeft.hours}</div>
              <div className="text-xs uppercase tracking-wider">Hours</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 min-w-[80px]">
              <div className="text-3xl font-bold text-accent">{timeLeft.minutes}</div>
              <div className="text-xs uppercase tracking-wider">Mins</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 min-w-[80px]">
              <div className="text-3xl font-bold text-accent">{timeLeft.seconds}</div>
              <div className="text-xs uppercase tracking-wider">Secs</div>
            </div>
          </div>
          
          <Link to="/shop" className="inline-block bg-white text-primary px-8 py-3 rounded-md font-bold hover:bg-accent hover:text-white transition-colors">
            Shop the Sale
          </Link>
        </div>
      </section>

      {/* Section 5 - New Arrivals */}
      <section className="py-16 container mx-auto px-4">
        <h2 className="text-3xl font-serif font-bold mb-10 text-darkText">New Arrivals</h2>
        <div className="flex overflow-x-auto gap-6 pb-6 snap-x hide-scrollbar">
          {newArrivals.map((product) => (
            <div key={product._id} className="min-w-[280px] sm:min-w-[300px] snap-start">
              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>

      {/* Section 6 - Why Shop With Us */}
      <section className="py-16 bg-white border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-4">
                <FiTruck size={32} />
              </div>
              <h3 className="text-lg font-bold text-darkText mb-2">Free Shipping</h3>
              <p className="text-mutedText">On all orders above ₹499</p>
            </div>
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-4">
                <FiShield size={32} />
              </div>
              <h3 className="text-lg font-bold text-darkText mb-2">Secure Payments</h3>
              <p className="text-mutedText">100 percent safe and encrypted</p>
            </div>
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center text-orange-600 mb-4">
                <FiRefreshCw size={32} />
              </div>
              <h3 className="text-lg font-bold text-darkText mb-2">Easy Returns</h3>
              <p className="text-mutedText">7-day hassle-free returns</p>
            </div>
            <div className="flex flex-col items-center text-center p-6">
              <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 mb-4">
                <FiHeadphones size={32} />
              </div>
              <h3 className="text-lg font-bold text-darkText mb-2">24x7 Support</h3>
              <p className="text-mutedText">We are always here to help</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 7 - Customer Reviews */}
      <section className="py-16 bg-light">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-serif font-bold text-center mb-12 text-darkText">What Our Customers Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map(review => (
              <div key={review.id} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 relative">
                <div className="flex text-accent mb-4">
                  {[...Array(review.rating)].map((_, i) => <span key={i}>★</span>)}
                </div>
                <p className="text-gray-600 italic mb-6">"{review.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                    {review.initials}
                  </div>
                  <div>
                    <h4 className="font-bold text-darkText">{review.name}</h4>
                    <p className="text-xs text-mutedText">{review.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 8 - Newsletter */}
      <section className="py-20 bg-accent relative overflow-hidden">
        {/* Decor shapes */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary opacity-10 rounded-full translate-x-1/3 translate-y-1/3"></div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-white mb-4">Stay in the Loop</h2>
          <p className="text-primary/80 font-medium mb-8">Join 50,000 happy customers. No spam, ever.</p>
          <form className="max-w-md mx-auto flex flex-col sm:flex-row gap-3">
            <input 
              type="email" 
              placeholder="Enter your email address" 
              required
              className="flex-1 px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-primary shadow-inner"
            />
            <button type="submit" className="bg-primary text-white px-6 py-3 rounded-md font-bold hover:bg-opacity-90 transition-colors shadow-md whitespace-nowrap">
              Subscribe
            </button>
          </form>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
