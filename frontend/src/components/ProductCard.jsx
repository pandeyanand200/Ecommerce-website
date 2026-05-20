import { Link } from 'react-router-dom';
import { FiHeart, FiShoppingCart } from 'react-icons/fi';
import StarRating from './StarRating';
import { formatCurrency } from '../utils/formatCurrency';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { toast } from 'react-toastify';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const isLiked = isInWishlist(product._id);

  const handleAddToCart = (e) => {
    e.preventDefault();
    if (product.stock > 0) {
      addToCart(product, 1);
      toast.success(`${product.name} added to cart`);
    } else {
      toast.error('Product is out of stock');
    }
  };

  const handleToggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist(product);
    if (isLiked) {
      toast.info(`${product.name} removed from wishlist`);
    } else {
      toast.success(`${product.name} added to wishlist!`);
    }
  };

  const discountPercentage = product.originalPrice && product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <div className="group bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 relative">
      {discountPercentage > 0 && (
        <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded z-10">
          -{discountPercentage}%
        </div>
      )}
      <button
        onClick={handleToggleWishlist}
        className={`absolute top-3 right-3 p-2 bg-white rounded-full shadow-sm transition-all duration-300 z-10 ${
          isLiked ? 'opacity-100 text-red-500' : 'opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500'
        }`}
        title={isLiked ? "Remove from Wishlist" : "Add to Wishlist"}
      >
        <FiHeart size={18} className={isLiked ? 'fill-red-500' : ''} />
      </button>

      <Link to={`/product/${product._id}`} className="block relative overflow-hidden pt-[100%]">
        <img
          src={product.images && product.images.length > 0 ? product.images[0] : '/placeholder.jpg'}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
        />
      </Link>

      <div className="p-4">
        <div className="text-xs text-accent font-medium mb-1 uppercase tracking-wider">{product.category}</div>
        <Link to={`/product/${product._id}`}>
          <h3 className="text-darkText font-serif font-medium mb-2 line-clamp-1 hover:text-accent transition-colors">
            {product.name}
          </h3>
        </Link>
        <div className="mb-2">
          <StarRating value={product.ratings} text={`(${product.numReviews})`} />
        </div>
        <div className="flex items-center justify-between mt-4">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-darkText">{formatCurrency(product.price)}</span>
            {product.originalPrice && product.originalPrice > product.price && (
              <span className="text-xs text-mutedText line-through">{formatCurrency(product.originalPrice)}</span>
            )}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.stock === 0}
            className={`p-2 rounded-full flex items-center justify-center transition-colors ${
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
};

export default ProductCard;
