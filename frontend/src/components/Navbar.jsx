import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiMenu, FiX, FiUser, FiHeart } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import logo from '../assets/logo.png';

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const { userInfo, logout } = useAuth();
  const { cartCount } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      navigate(`/shop?keyword=${searchKeyword}`);
      setIsSearchOpen(false);
    }
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 text-2xl font-serif font-bold text-primary">
            <img src={logo} alt="LuxeStore Logo" className="h-16 w-auto object-contain" />
            <span className="text-accent">Luxe</span>Store
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-darkText hover:text-accent font-medium transition-colors">Home</Link>
            <Link to="/shop" className="text-darkText hover:text-accent font-medium transition-colors">Shop</Link>
            <Link to="/collections" className="text-darkText hover:text-accent font-medium transition-colors">Collections</Link>
            <Link to="/about" className="text-darkText hover:text-accent font-medium transition-colors">About</Link>
            <Link to="/contact" className="text-darkText hover:text-accent font-medium transition-colors">Contact</Link>
          </div>

          {/* Icons */}
          <div className="flex items-center space-x-4 md:space-x-6">
            {isSearchOpen ? (
              <form onSubmit={handleSearch} className="hidden md:flex items-center relative">
                <input
                  type="text"
                  placeholder="Search products..."
                  className="pl-3 pr-10 py-1 border-b-2 border-primary outline-none bg-transparent"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  autoFocus
                />
                <button type="button" onClick={() => setIsSearchOpen(false)} className="absolute right-0 text-gray-500">
                  <FiX />
                </button>
              </form>
            ) : (
              <button onClick={() => setIsSearchOpen(true)} className="text-darkText hover:text-accent transition-colors">
                <FiSearch size={20} />
              </button>
            )}

            <Link to="/wishlist" className="text-darkText hover:text-accent transition-colors relative hidden md:block" title="Wishlist">
              <FiHeart size={20} />
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link to="/cart" className="text-darkText hover:text-accent transition-colors relative">
              <FiShoppingCart size={20} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Menu */}
            {userInfo ? (
              <div className="relative group hidden md:block">
                <button className="flex items-center gap-2 text-darkText hover:text-accent transition-colors">
                  <FiUser size={20} />
                  <span className="text-sm font-medium max-w-[100px] truncate">{userInfo.name}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-100 rounded-md shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  {userInfo.role === 'admin' && (
                    <Link to="/admin/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Dashboard</Link>
                  )}
                  <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</Link>
                  <Link to="/my-orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Orders</Link>
                  <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Logout</button>
                </div>
              </div>
            ) : (
              <Link to="/login" className="hidden md:block text-sm font-medium bg-primary text-white px-4 py-2 rounded hover:bg-opacity-90 transition-all">
                Login
              </Link>
            )}

            {/* Mobile menu button */}
            <button className="md:hidden text-darkText" onClick={toggleMobileMenu}>
              {isMobileMenuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 py-4 absolute w-full left-0 shadow-lg">
          <form onSubmit={handleSearch} className="px-4 mb-4 flex items-center">
            <input
              type="text"
              placeholder="Search..."
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-accent"
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
            />
          </form>
          <div className="flex flex-col space-y-4 px-4">
            <Link to="/" onClick={toggleMobileMenu} className="text-darkText font-medium">Home</Link>
            <Link to="/shop" onClick={toggleMobileMenu} className="text-darkText font-medium">Shop</Link>
            <Link to="/collections" onClick={toggleMobileMenu} className="text-darkText font-medium">Collections</Link>
            <Link to="/wishlist" onClick={toggleMobileMenu} className="text-darkText font-medium flex justify-between items-center">
              <span>Wishlist</span>
              {wishlistCount > 0 && (
                <span className="bg-accent text-white text-[10px] rounded-full px-2 py-0.5 font-bold">
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link to="/contact" onClick={toggleMobileMenu} className="text-darkText font-medium">Contact</Link>
            {userInfo ? (
              <>
                <Link to="/profile" onClick={toggleMobileMenu} className="text-darkText font-medium">Profile</Link>
                <Link to="/my-orders" onClick={toggleMobileMenu} className="text-darkText font-medium">My Orders</Link>
                {userInfo.role === 'admin' && (
                  <Link to="/admin/dashboard" onClick={toggleMobileMenu} className="text-darkText font-medium">Admin Dashboard</Link>
                )}
                <button onClick={() => { logout(); toggleMobileMenu(); }} className="text-left text-red-600 font-medium">Logout</button>
              </>
            ) : (
              <Link to="/login" onClick={toggleMobileMenu} className="text-accent font-medium">Login / Register</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
