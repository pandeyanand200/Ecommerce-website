import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FiFilter, FiX, FiGrid, FiList } from 'react-icons/fi';
import api from '../utils/api';
import ProductCard from '../components/ProductCard';
import Loader from '../components/Loader';

const ShopPage = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);
  
  // View mode
  const [viewMode, setViewMode] = useState('grid');
  
  // Mobile filter toggle
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const keyword = searchParams.get('keyword') || '';
  const queryCategory = searchParams.get('category') || '';

  // Initialize selectedCategory directly from URL parameter to avoid double-fetch & race conditions on mount
  const [selectedCategory, setSelectedCategory] = useState(queryCategory);
  const [priceRange, setPriceRange] = useState(50000);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');

  // Sync state with URL if it changes (e.g. from nav clicks)
  useEffect(() => {
    setSelectedCategory(queryCategory);
  }, [queryCategory]);

  const handleCategoryChange = (catName) => {
    const params = new URLSearchParams(location.search);
    if (catName) {
      params.set('category', catName);
    } else {
      params.delete('category');
    }
    setPage(1);
    navigate(`/shop?${params.toString()}`);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line
  }, [keyword, selectedCategory, sortBy, page]);

  const fetchCategories = async () => {
    try {
      const { data } = await api.get('/api/products/categories');
      setCategories(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = `/api/products?pageNumber=${page}&sort=${sortBy}`;
      if (keyword) url += `&keyword=${keyword}`;
      if (selectedCategory) url += `&category=${selectedCategory}`;

      const { data } = await api.get(url);
      setProducts(data.products);
      setPages(data.pages);
      setPage(data.page);
      setTotalProducts(data.count);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Local filtering for price, rating, and stock since API doesn't fully support it yet in my backend code (except category and keyword)
  const filteredProducts = products.filter(product => {
    if (product.price > priceRange) return false;
    if (product.ratings < minRating) return false;
    if (inStockOnly && product.stock === 0) return false;
    return true;
  });

  const clearFilters = () => {
    setSelectedCategory('');
    setPriceRange(50000);
    setMinRating(0);
    setInStockOnly(false);
    navigate('/shop'); // clear keyword/category from url
  };

  return (
    <div className="bg-light min-h-screen py-8">
      <div className="container mx-auto px-4">
        {/* Header & Breadcrumb */}
        <div className="mb-8">
          <h1 className="text-3xl font-serif font-bold text-darkText mb-2">Shop</h1>
          <p className="text-sm text-mutedText">Home / Shop {keyword && `/ Search: ${keyword}`}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Mobile Filter Toggle Button */}
          <button 
            className="lg:hidden flex items-center gap-2 bg-white px-4 py-2 border border-gray-200 rounded-md shadow-sm text-darkText font-medium w-max"
            onClick={() => setIsFilterOpen(true)}
          >
            <FiFilter /> Filters
          </button>

          {/* Left Sidebar (Filters) */}
          <div className={`
            fixed inset-y-0 left-0 z-50 w-80 bg-white shadow-2xl transform transition-transform duration-300 ease-in-out
            lg:relative lg:w-1/4 lg:translate-x-0 lg:shadow-none lg:bg-transparent lg:z-0
            ${isFilterOpen ? 'translate-x-0' : '-translate-x-full'}
          `}>
            <div className="h-full overflow-y-auto p-6 lg:p-0">
              <div className="flex justify-between items-center lg:hidden mb-6">
                <h2 className="text-xl font-bold font-serif">Filters</h2>
                <button onClick={() => setIsFilterOpen(false)} className="text-gray-500 hover:text-red-500">
                  <FiX size={24} />
                </button>
              </div>

              <div className="bg-white lg:p-6 lg:rounded-xl lg:shadow-sm lg:border lg:border-gray-100 space-y-8">
                {/* Category Filter */}
                <div>
                  <h3 className="font-bold text-darkText mb-4 border-b pb-2">Categories</h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input 
                        type="radio" 
                        name="category"
                        checked={selectedCategory === ''} 
                        onChange={() => handleCategoryChange('')}
                        className="w-4 h-4 text-accent border-gray-300 focus:ring-accent"
                      />
                      <span className="text-gray-700">All Categories</span>
                    </label>
                    {categories.map((c, i) => (
                      <label key={i} className="flex items-center gap-3 cursor-pointer">
                        <input 
                          type="radio" 
                          name="category"
                          checked={selectedCategory === c} 
                          onChange={() => handleCategoryChange(c)}
                          className="w-4 h-4 text-accent border-gray-300 focus:ring-accent"
                        />
                        <span className="text-gray-700">{c}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="font-bold text-darkText mb-4 border-b pb-2">Price Range</h3>
                  <input 
                    type="range" 
                    min="0" 
                    max="50000" 
                    step="500"
                    value={priceRange} 
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                    className="w-full accent-accent"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-2">
                    <span>₹0</span>
                    <span>₹{priceRange}</span>
                  </div>
                </div>

                {/* Rating Filter */}
                <div>
                  <h3 className="font-bold text-darkText mb-4 border-b pb-2">Minimum Rating</h3>
                  <div className="space-y-2">
                    {[4, 3, 2, 1].map(rating => (
                      <label key={rating} className="flex items-center gap-3 cursor-pointer">
                        <input 
                          type="radio" 
                          name="rating"
                          checked={minRating === rating} 
                          onChange={() => setMinRating(rating)}
                          className="w-4 h-4 text-accent border-gray-300 focus:ring-accent"
                        />
                        <span className="text-gray-700 flex text-accent">
                          {'★'.repeat(rating)}{'☆'.repeat(5-rating)} & Up
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Availability Filter */}
                <div>
                  <h3 className="font-bold text-darkText mb-4 border-b pb-2">Availability</h3>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={inStockOnly} 
                      onChange={(e) => setInStockOnly(e.target.checked)}
                      className="w-4 h-4 text-accent rounded border-gray-300 focus:ring-accent"
                    />
                    <span className="text-gray-700">In Stock Only</span>
                  </label>
                </div>

                <button 
                  onClick={clearFilters}
                  className="w-full py-2 bg-gray-100 text-darkText rounded font-medium hover:bg-gray-200 transition-colors"
                >
                  Clear All Filters
                </button>
              </div>
            </div>
          </div>

          {/* Overlay for mobile filter */}
          {isFilterOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setIsFilterOpen(false)}
            ></div>
          )}

          {/* Main Content Area */}
          <div className="lg:w-3/4">
            {/* Top Toolbar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap justify-between items-center mb-6 gap-4">
              <div className="text-sm text-mutedText font-medium">
                Showing {filteredProducts.length} of {totalProducts} products
              </div>
              
              <div className="flex items-center gap-4">
                {/* Sort Dropdown */}
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-500">Sort by:</span>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="text-sm border border-gray-300 rounded-md py-1.5 px-3 focus:outline-none focus:border-accent"
                  >
                    <option value="newest">Newest First</option>
                    <option value="priceAsc">Price: Low to High</option>
                    <option value="priceDesc">Price: High to Low</option>
                  </select>
                </div>

                {/* View Toggles */}
                <div className="hidden sm:flex border border-gray-200 rounded overflow-hidden">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100 text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <FiGrid size={18} />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-gray-100 text-primary' : 'text-gray-400 hover:text-gray-600'}`}
                  >
                    <FiList size={18} />
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid/List */}
            {loading ? (
              <Loader />
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white p-10 rounded-xl shadow-sm text-center">
                <p className="text-gray-500 text-lg">No products found matching your criteria.</p>
                <button onClick={clearFilters} className="mt-4 text-accent font-medium hover:underline">Clear Filters</button>
              </div>
            ) : (
              <>
                <div className={
                  viewMode === 'grid' 
                    ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
                    : "flex flex-col gap-4"
                }>
                  {filteredProducts.map(product => (
                    viewMode === 'grid' ? (
                      <ProductCard key={product._id} product={product} />
                    ) : (
                      // List View Card
                      <div key={product._id} className="bg-white rounded-lg border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-all flex h-48">
                        <div className="w-48 flex-shrink-0 bg-gray-50">
                          <img 
                            src={product.images && product.images[0] ? product.images[0] : '/placeholder.jpg'} 
                            alt={product.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="p-4 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="text-xs text-accent font-medium mb-1 uppercase tracking-wider">{product.category}</div>
                            <h3 className="text-lg font-serif font-medium text-darkText mb-1">{product.name}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2 mb-2">{product.description}</p>
                          </div>
                          <div className="flex justify-between items-end">
                            <span className="text-xl font-bold text-darkText">₹{product.price}</span>
                            <button className="bg-primary text-white px-4 py-2 rounded text-sm hover:bg-accent transition-colors">Add to Cart</button>
                          </div>
                        </div>
                      </div>
                    )
                  ))}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                  <div className="flex justify-center mt-10">
                    <nav className="flex items-center gap-1">
                      <button 
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="px-3 py-1 rounded border border-gray-300 text-gray-600 disabled:opacity-50 hover:bg-gray-50"
                      >
                        Prev
                      </button>
                      {[...Array(pages).keys()].map(x => (
                        <button
                          key={x + 1}
                          onClick={() => setPage(x + 1)}
                          className={`w-8 h-8 rounded flex items-center justify-center font-medium ${
                            page === x + 1 
                              ? 'bg-accent text-white' 
                              : 'border border-gray-300 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {x + 1}
                        </button>
                      ))}
                      <button 
                        onClick={() => setPage(p => Math.min(pages, p + 1))}
                        disabled={page === pages}
                        className="px-3 py-1 rounded border border-gray-300 text-gray-600 disabled:opacity-50 hover:bg-gray-50"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopPage;
