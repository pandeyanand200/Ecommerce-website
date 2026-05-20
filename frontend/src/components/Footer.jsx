import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';

const Footer = () => {
  return (
    <footer className="bg-primary text-light pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center gap-2 text-2xl font-serif font-bold text-accent mb-4">
              <img src={logo} alt="LuxeStore Logo" className="h-8 w-auto object-contain brightness-0 invert" />
              <span>LuxeStore</span>
            </Link>
            <p className="text-gray-300 text-sm leading-relaxed mb-4">
              Discover products you will love. Shop thousands of items across every category with premium quality and service.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/shop" className="hover:text-accent transition-colors">Shop</Link></li>
              <li><Link to="/about" className="hover:text-accent transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-accent transition-colors">Contact</Link></li>
              <li><Link to="/faq" className="hover:text-accent transition-colors">FAQ</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Categories</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li><Link to="/shop?category=Electronics" className="hover:text-accent transition-colors">Electronics</Link></li>
              <li><Link to="/shop?category=Fashion" className="hover:text-accent transition-colors">Fashion</Link></li>
              <li><Link to="/shop?category=Home and Living" className="hover:text-accent transition-colors">Home & Living</Link></li>
              <li><Link to="/shop?category=Beauty" className="hover:text-accent transition-colors">Beauty</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Contact Us</h4>
            <ul className="space-y-2 text-sm text-gray-300">
              <li>123 Commerce St, Tech City</li>
              <li>support@luxestore.com</li>
              <li>+1 (555) 123-4567</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} LuxeStore. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
