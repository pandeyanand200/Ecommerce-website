import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiMinus, FiPlus, FiHeart, FiShare2, FiShield, FiTruck, FiRefreshCw } from 'react-icons/fi';
import api from '../utils/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/formatCurrency';
import StarRating from '../components/StarRating';
import Loader from '../components/Loader';
import ProductCard from '../components/ProductCard';
import { toast } from 'react-toastify';

const ProductDetailPage = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState('');
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  
  // Review form
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);

  const { addToCart } = useCart();
  const { userInfo } = useAuth();

  useEffect(() => {
    fetchProductDetails();
    // eslint-disable-next-line
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);
      const { data } = await api.get(`/api/products/${id}`);
      setProduct(data);
      if (data.images && data.images.length > 0) {
        setMainImage(data.images[0]);
      }
      
      // Fetch related products (same category)
      const { data: related } = await api.get(`/api/products?category=${data.category}`);
      setRelatedProducts(related.products.filter(p => p._id !== data._id).slice(0, 4));
      
    } catch (error) {
      console.error(error);
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    addToCart(product, qty);
    toast.success(`${product.name} added to cart`);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!userInfo) {
      toast.error('Please login to submit a review');
      return;
    }
    
    try {
      setReviewLoading(true);
      await api.post(`/api/products/${id}/review`, { rating, comment });
      toast.success('Review submitted successfully');
      setRating(5);
      setComment('');
      fetchProductDetails(); // Refresh product to show new review
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error submitting review');
    } finally {
      setReviewLoading(false);
    }
  };

  if (loading) return <Loader />;
  if (!product) return <div className="text-center py-20 text-xl font-medium">Product not found</div>;

  const discountPercentage = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-light py-4 border-b border-gray-200">
        <div className="container mx-auto px-4 text-sm text-gray-500 flex flex-wrap items-center gap-2">
          <Link to="/" className="hover:text-accent">Home</Link>
          <span>/</span>
          <Link to={`/shop?category=${product.category}`} className="hover:text-accent">{product.category}</Link>
          <span>/</span>
          <span className="text-darkText font-medium truncate">{product.name}</span>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16">
          
          {/* Left Side: Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-50 rounded-xl overflow-hidden border border-gray-100 relative">
              {discountPercentage > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white font-bold px-3 py-1 rounded-md z-10 shadow-sm">
                  {discountPercentage}% OFF
                </div>
              )}
              <img 
                src={mainImage || '/placeholder.jpg'} 
                alt={product.name} 
                className="w-full h-full object-contain p-4"
              />
            </div>
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {product.images.map((img, index) => (
                  <button 
                    key={index} 
                    onClick={() => setMainImage(img)}
                    className={`aspect-square rounded-lg border-2 overflow-hidden bg-gray-50 transition-all ${
                      mainImage === img ? 'border-accent opacity-100' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${index}`} className="w-full h-full object-contain p-2" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Side: Product Info */}
          <div className="flex flex-col">
            <div className="text-sm font-medium text-accent tracking-widest uppercase mb-2">{product.category}</div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-darkText mb-4 leading-tight">{product.name}</h1>
            
            <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
              <StarRating value={product.ratings} text={`${product.numReviews} Reviews`} />
              <div className="w-px h-4 bg-gray-300"></div>
              <span className={`${product.stock > 0 ? 'text-green-600' : 'text-red-600'} font-medium`}>
                {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
              </span>
            </div>

            <div className="mb-6 flex items-baseline gap-4">
              <span className="text-4xl font-bold text-darkText">{formatCurrency(product.price)}</span>
              {product.originalPrice && product.originalPrice > product.price && (
                <span className="text-xl text-gray-400 line-through">{formatCurrency(product.originalPrice)}</span>
              )}
            </div>

            <p className="text-gray-600 mb-8 leading-relaxed">
              {product.description}
            </p>

            {/* Quantity & Actions */}
            <div className="flex flex-wrap items-center gap-4 mb-8">
              <div className="flex items-center border border-gray-300 rounded-md bg-white">
                <button 
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-4 py-3 text-gray-600 hover:text-accent hover:bg-gray-50 transition-colors"
                >
                  <FiMinus />
                </button>
                <span className="px-4 py-2 font-medium w-12 text-center">{qty}</span>
                <button 
                  onClick={() => setQty(Math.min(product.stock, qty + 1))}
                  className="px-4 py-3 text-gray-600 hover:text-accent hover:bg-gray-50 transition-colors"
                >
                  <FiPlus />
                </button>
              </div>

              <button 
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className="flex-1 bg-accent hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
              >
                Add to Cart
              </button>

              <button className="p-3 border border-gray-300 rounded-md text-gray-600 hover:text-red-500 hover:border-red-500 transition-colors bg-white">
                <FiHeart size={20} />
              </button>
              <button className="p-3 border border-gray-300 rounded-md text-gray-600 hover:text-primary hover:border-primary transition-colors bg-white">
                <FiShare2 size={20} />
              </button>
            </div>

            <button 
              disabled={product.stock === 0}
              className="w-full bg-primary hover:bg-opacity-90 text-white font-bold py-3 px-6 rounded-md transition-colors mb-8 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Buy Now
            </button>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-100">
              <div className="flex items-center gap-3">
                <div className="text-accent"><FiTruck size={24} /></div>
                <div className="text-sm">
                  <p className="font-bold text-darkText">Free Shipping</p>
                  <p className="text-mutedText">Orders over ₹499</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-accent"><FiShield size={24} /></div>
                <div className="text-sm">
                  <p className="font-bold text-darkText">Secure Payment</p>
                  <p className="text-mutedText">100% Secure Checkout</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-accent"><FiRefreshCw size={24} /></div>
                <div className="text-sm">
                  <p className="font-bold text-darkText">Easy Returns</p>
                  <p className="text-mutedText">7 Days Return Policy</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="bg-light py-12 border-t border-b border-gray-200 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap border-b border-gray-300 mb-8">
            <button 
              className={`pb-4 px-6 font-medium text-lg border-b-2 transition-colors ${activeTab === 'description' ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button 
              className={`pb-4 px-6 font-medium text-lg border-b-2 transition-colors ${activeTab === 'specifications' ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
              onClick={() => setActiveTab('specifications')}
            >
              Specifications
            </button>
            <button 
              className={`pb-4 px-6 font-medium text-lg border-b-2 transition-colors ${activeTab === 'reviews' ? 'border-accent text-accent' : 'border-transparent text-gray-500 hover:text-gray-800'}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews ({product.numReviews})
            </button>
          </div>

          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            {activeTab === 'description' && (
              <div className="prose max-w-none text-gray-600">
                <p>{product.description}</p>
                <p className="mt-4">Elevate your lifestyle with this premium product from LuxeStore. Designed with attention to detail and crafted from high-quality materials to ensure longevity and satisfaction. Whether you are buying for yourself or as a gift, this item represents excellent value and style.</p>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div>
                <table className="w-full text-left border-collapse">
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <th className="py-3 font-medium text-darkText w-1/3 bg-gray-50 px-4">Category</th>
                      <td className="py-3 text-gray-600 px-4">{product.category}</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <th className="py-3 font-medium text-darkText w-1/3 bg-gray-50 px-4">Brand</th>
                      <td className="py-3 text-gray-600 px-4">LuxeStore Exclusives</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <th className="py-3 font-medium text-darkText w-1/3 bg-gray-50 px-4">Stock Status</th>
                      <td className="py-3 text-gray-600 px-4">{product.stock > 0 ? 'Available' : 'Out of Stock'}</td>
                    </tr>
                    <tr>
                      <th className="py-3 font-medium text-darkText w-1/3 bg-gray-50 px-4">Tags</th>
                      <td className="py-3 text-gray-600 px-4">{product.tags?.join(', ') || 'None'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-8">
                  {product.reviews.length === 0 ? (
                    <p className="text-gray-500 italic">No reviews yet. Be the first to review this product!</p>
                  ) : (
                    product.reviews.map(review => (
                      <div key={review._id} className="border-b border-gray-100 pb-6 last:border-0">
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold">
                              {review.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-bold text-darkText">{review.name}</p>
                              <div className="flex items-center gap-2">
                                <StarRating value={review.rating} />
                                <span className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <p className="text-gray-600 mt-3">{review.comment}</p>
                      </div>
                    ))
                  )}
                </div>

                <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 h-max">
                  <h3 className="text-xl font-bold text-darkText mb-4">Write a Review</h3>
                  {userInfo ? (
                    <form onSubmit={submitReview}>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                        <select 
                          value={rating} 
                          onChange={(e) => setRating(Number(e.target.value))}
                          className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-accent"
                        >
                          <option value="5">5 - Excellent</option>
                          <option value="4">4 - Very Good</option>
                          <option value="3">3 - Good</option>
                          <option value="2">2 - Fair</option>
                          <option value="1">1 - Poor</option>
                        </select>
                      </div>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                        <textarea 
                          rows="4" 
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          required
                          className="w-full border border-gray-300 rounded p-2 focus:outline-none focus:border-accent"
                          placeholder="What did you like or dislike?"
                        ></textarea>
                      </div>
                      <button 
                        type="submit" 
                        disabled={reviewLoading}
                        className="w-full bg-primary text-white py-2 rounded hover:bg-opacity-90 font-medium transition-colors disabled:opacity-50"
                      >
                        {reviewLoading ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </form>
                  ) : (
                    <div className="text-center p-4 bg-white rounded border border-gray-200">
                      <p className="mb-3 text-sm text-gray-600">Please sign in to write a review</p>
                      <Link to={`/login?redirect=/product/${id}`} className="block w-full bg-primary text-white py-2 rounded text-sm font-medium">
                        Login Now
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="container mx-auto px-4 py-16">
          <h2 className="text-3xl font-serif font-bold text-center mb-10 text-darkText">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map(prod => (
              <ProductCard key={prod._id} product={prod} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetailPage;
