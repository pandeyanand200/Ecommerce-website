import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import Loader from '../components/Loader';
import { FiArrowRight, FiSliders, FiEye } from 'react-icons/fi';
import { LuLaptop, LuShirt, LuSofa, LuSparkles, LuDumbbell, LuBookOpen, LuGift } from 'react-icons/lu';

const CollectionsPage = () => {
  const [categories, setCategories] = useState([]);
  const [categoryImages, setCategoryImages] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data: catData } = await api.get('/api/products/categories');
        setCategories(catData);

        // Fetch products to map category images uploaded by admin
        const { data: prodData } = await api.get('/api/products?pageSize=100');
        const imagesMap = {};
        if (prodData && prodData.products) {
          prodData.products.forEach(product => {
            if (!imagesMap[product.category] && product.images && product.images.length > 0) {
              imagesMap[product.category] = product.images[0];
            }
          });
        }
        setCategoryImages(imagesMap);
      } catch (error) {
        console.error('Error fetching categories:', error);
        // Fallback static categories in case of API issues
        setCategories(['Electronics', 'Fashion', 'Home and Living', 'Beauty', 'Sports', 'Books']);
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  // Premium static layout & visual configuration mapping for known categories
  const categoryDetails = {
    'Electronics': {
      image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?q=80&w=800',
      description: 'Next-gen devices, premium audio, smart solutions, and cutting-edge tech.',
      tagline: 'Futuristic & Smart',
      icon: LuLaptop,
      textColor: 'text-blue-600',
      itemCount: '120+ Products'
    },
    'Fashion': {
      image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=800',
      description: 'Luxury garments, designer shoes, watches, and refined style accessories.',
      tagline: 'Elegant & Bold',
      icon: LuShirt,
      textColor: 'text-pink-600',
      itemCount: '300+ Products'
    },
    'Home and Living': {
      image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?q=80&w=800',
      description: 'Curated premium furniture, lighting solutions, textiles, and home accents.',
      tagline: 'Modern & Comfortable',
      icon: LuSofa,
      textColor: 'text-green-600',
      itemCount: '150+ Products'
    },
    'Beauty': {
      image: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=800',
      description: 'Organic skincare, premium cosmetics, fragrances, and expert wellness products.',
      tagline: 'Pure & Radiant',
      icon: LuSparkles,
      textColor: 'text-purple-600',
      itemCount: '80+ Products'
    },
    'Sports': {
      image: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=800',
      description: 'High-performance athletic wear, fitness tracking, and premium sports gear.',
      tagline: 'Dynamic & Strong',
      icon: LuDumbbell,
      textColor: 'text-orange-600',
      itemCount: '90+ Products'
    },
    'Books': {
      image: 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?q=80&w=800',
      description: 'Rare editions, bestselling fiction, intellectual non-fiction, and coffee table assets.',
      tagline: 'Inspiring & Deep',
      icon: LuBookOpen,
      textColor: 'text-yellow-700',
      itemCount: '200+ Products'
    }
  };

  const getCategoryMeta = (name) => {
    const staticMeta = categoryDetails[name] || {
      description: `Explore our custom collection of hand-picked premium ${name} products.`,
      tagline: 'Exclusive & Curated',
      icon: LuGift,
      textColor: 'text-accent',
      itemCount: '40+ Products'
    };

    // Use the dynamically mapped admin-uploaded image if it exists, otherwise fall back to static image
    return {
      ...staticMeta,
      image: categoryImages[name] || staticMeta.image || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=800'
    };
  };

  // Curated capsule showcase to make the page extremely premium
  const capsuleShowcases = [
    {
      title: 'The Monochrome Atelier',
      tagline: 'SUMMER CAPSULE',
      image: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=800',
      description: 'Sleek dark silhouettes, fine silks, and structured outerwear designed for pure minimalist elegance.',
      categoryLink: 'Fashion'
    },
    {
      title: 'Nordic Sanctuary',
      tagline: 'HOME EDIT',
      image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=800',
      description: 'Handcrafted light oak pieces, natural linen drapery, and soft ceramic decors that turn homes into sanctuaries.',
      categoryLink: 'Home and Living'
    }
  ];

  if (loading) return <Loader />;

  return (
    <div className="bg-light min-h-screen py-12">
      <div className="container mx-auto px-4">
        {/* Breadcrumb & Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-sm text-mutedText mb-2">Home / Collections</p>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-darkText mb-4">Our Curated Collections</h1>
          <p className="text-mutedText leading-relaxed">
            Browse through our premium categories curated by lifestyle experts. Each collection represents the pinnacle of craftsmanship, aesthetics, and modern utility.
          </p>
          <div className="h-1 w-20 bg-accent mx-auto mt-6 rounded-full"></div>
        </div>

        {/* Premium Capsule Showcases Section (Magazine Style) */}
        <section className="mb-20">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-darkText mb-8 flex items-center gap-3">
            <span className="w-8 h-[1px] bg-accent"></span> Limited Edition Capsules
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {capsuleShowcases.map((capsule, idx) => (
              <div 
                key={idx}
                className="group relative h-[450px] rounded-2xl overflow-hidden shadow-lg border border-gray-100 flex flex-col justify-end text-white p-8 cursor-pointer"
                onClick={() => navigate(`/shop?category=${capsule.categoryLink}`)}
              >
                {/* Background Image and overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/60 to-transparent z-10 transition-all duration-300 group-hover:via-primary/75"></div>
                <img 
                  src={capsule.image} 
                  alt={capsule.title} 
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Content */}
                <div className="relative z-20 space-y-3 max-w-lg transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <span className="bg-accent text-white text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded">
                    {capsule.tagline}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-serif font-bold leading-tight group-hover:text-accent transition-colors">
                    {capsule.title}
                  </h3>
                  <p className="text-gray-300 text-sm font-light leading-relaxed opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    {capsule.description}
                  </p>
                  <div className="flex items-center gap-2 text-white font-medium text-sm pt-2">
                    <span>Explore Capsule</span>
                    <FiArrowRight className="group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Dynamic Collections Grid */}
        <section>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-darkText mb-8 flex items-center gap-3">
            <span className="w-8 h-[1px] bg-accent"></span> Categories Directory
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((category) => {
              const meta = getCategoryMeta(category);
              return (
                <div 
                  key={category}
                  className="group bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 flex flex-col h-full cursor-pointer hover:-translate-y-1"
                  onClick={() => navigate(`/shop?category=${category}`)}
                >
                  {/* Category Image Area */}
                  <div className="relative h-60 overflow-hidden bg-gray-100">
                    <img 
                      src={meta.image} 
                      alt={category} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-primary/10 group-hover:bg-primary/20 transition-all duration-300"></div>
                    
                    {/* Floating badge */}
                    <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm px-3.5 py-1.5 rounded-full shadow-md text-xs font-semibold text-primary flex items-center gap-2">
                      {meta.icon && <meta.icon className={meta.textColor} size={16} />}
                      <span>{category}</span>
                    </div>

                    <div className="absolute top-4 right-4 bg-primary text-white text-[10px] font-bold px-2.5 py-1.5 rounded-full shadow-md uppercase tracking-wider">
                      {meta.itemCount}
                    </div>
                  </div>

                  {/* Category Details */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <span className="text-accent text-[11px] font-semibold tracking-wider uppercase mb-1 block">
                        {meta.tagline}
                      </span>
                      <h3 className="text-2xl font-serif font-bold text-darkText mb-3 group-hover:text-accent transition-colors">
                        {category}
                      </h3>
                      <p className="text-mutedText text-sm leading-relaxed mb-6 font-light">
                        {meta.description}
                      </p>
                    </div>

                    {/* Footer / Link */}
                    <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-auto">
                      <span className="text-sm font-medium text-darkText group-hover:text-accent transition-colors flex items-center gap-2">
                        Shop Collection <FiArrowRight className="group-hover:translate-x-1.5 transition-transform" />
                      </span>
                      <div className="w-8 h-8 rounded-full bg-light text-mutedText group-hover:bg-accent group-hover:text-white transition-all flex items-center justify-center">
                        <FiEye size={16} />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default CollectionsPage;
