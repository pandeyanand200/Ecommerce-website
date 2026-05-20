import { Link } from 'react-router-dom';
import { FiHeart, FiTrash2, FiShoppingCart } from 'react-icons/fi';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/formatCurrency';
import { toast } from 'react-toastify';

const WishlistPage = () => {
  const { wishlistItems, removeFromWishlist, clearWishlist } = useWishlist();
  const { addToCart } = useCart();

  const handleAddToCart = (product) => {
    if (product.stock > 0) {
      addToCart(product, 1);
      toast.success(`${product.name} added to cart!`);
    } else {
      toast.error('This product is currently out of stock.');
    }
  };

  return (
    <div className="bg-light min-h-screen py-12">
      <div className="container mx-auto px-4">
        
        {/* Header Block */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 pb-6 border-b border-gray-200 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-serif font-bold text-darkText mb-2">My Wishlist</h1>
            <p className="text-sm text-gray-500">
              Keep track of the premium products you love and want to secure later.
            </p>
          </div>
          {wishlistItems.length > 0 && (
            <button
              onClick={clearWishlist}
              className="text-xs uppercase tracking-wider text-red-500 hover:text-red-700 font-bold border border-red-200 hover:border-red-500 rounded px-4 py-2 bg-white transition-all shadow-sm"
            >
              Clear Entire Wishlist
            </button>
          )}
        </div>

        {/* Wishlist Items List */}
        {wishlistItems.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center max-w-xl mx-auto shadow-sm border border-gray-100 py-16">
            <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiHeart className="w-10 h-10 text-accent" />
            </div>
            <h2 className="text-2xl font-serif font-bold text-darkText mb-3">Your Wishlist is Empty</h2>
            <p className="text-gray-500 text-sm max-w-md mx-auto mb-8 leading-relaxed">
              Explore our boutique collections and tap the heart icon on any product to save it here for later.
            </p>
            <Link
              to="/shop"
              className="bg-primary text-white px-8 py-3 rounded-lg font-bold hover:bg-opacity-95 transition-all shadow-md inline-block"
            >
              Discover Products
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {wishlistItems.map((product) => {
              const discountPercentage = product.originalPrice && product.originalPrice > product.price
                ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                : 0;

              return (
                <div key={product._id} className="group bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 relative flex flex-col h-full">
                  
                  {/* Discount Badge */}
                  {discountPercentage > 0 && (
                    <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
                      -{discountPercentage}%
                    </div>
                  )}

                  {/* Remove Button */}
                  <button
                    onClick={() => {
                      removeFromWishlist(product._id);
                      toast.info(`${product.name} removed from wishlist.`);
                    }}
                    className="absolute top-3 right-3 p-2 bg-white rounded-full text-gray-400 hover:text-red-500 hover:bg-red-50 shadow-sm transition-all z-10"
                    title="Remove from Wishlist"
                  >
                    <FiTrash2 size={16} />
                  </button>

                  {/* Product Image Link */}
                  <Link to={`/product/${product._id}`} className="block relative overflow-hidden pt-[100%] bg-gray-50">
                    <img
                      src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder.jpg'}
                      alt={product.name}
                      className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>

                  {/* Product Info Block */}
                  <div className="p-5 flex flex-col flex-grow">
                    <span className="text-xs text-accent font-medium uppercase tracking-wider mb-1">
                      {product.category}
                    </span>
                    
                    <Link to={`/product/${product._id}`}>
                      <h3 className="text-darkText font-serif font-bold text-md mb-2 line-clamp-1 hover:text-accent transition-colors">
                        {product.name}
                      </h3>
                    </Link>

                    {/* Stock Status */}
                    <div className="mb-4">
                      {product.stock > 0 ? (
                        <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded">In Stock</span>
                      ) : (
                        <span className="text-xs text-red-500 font-semibold bg-red-50 px-2 py-1 rounded">Out of Stock</span>
                      )}
                    </div>

                    {/* Price and Cart Buttons */}
                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
                      <div className="flex flex-col">
                        <span className="text-lg font-bold text-darkText">{formatCurrency(product.price)}</span>
                        {product.originalPrice && product.originalPrice > product.price && (
                          <span className="text-xs text-mutedText line-through">{formatCurrency(product.originalPrice)}</span>
                        )}
                      </div>

                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        className={`p-2.5 rounded-full flex items-center justify-center transition-colors shadow-sm ${
                          product.stock > 0
                            ? 'bg-primary text-white hover:bg-accent'
                            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        }`}
                        title={product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                      >
                        <FiShoppingCart size={18} />
                      </button>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};

export default WishlistPage;
