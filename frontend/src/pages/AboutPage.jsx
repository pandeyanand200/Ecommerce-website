import { Link } from 'react-router-dom';
import { FiCheckCircle, FiAward, FiShield, FiHeart, FiCompass, FiUsers } from 'react-icons/fi';
import Anand from '../assets/anand.png';
import Lagan from '../assets/lagan.png';
import sharyesh from '../assets/sharyesh.png';
import nitin from '../assets/nitin.png';
const AboutPage = () => {
  const stats = [
    { label: 'Happy Customers', value: '50K+' },
    { label: 'Premium Brands', value: '150+' },
    { label: 'Global Cities', value: '25+' },
    { label: 'Awards Won', value: '12+' },
  ];

  const values = [
    {
      icon: <FiShield className="w-8 h-8 text-accent" />,
      title: 'Uncompromised Quality',
      description: 'We source only from verified premium brands, ensuring every stitch, pixel, and material meets our rigorous luxury standards.'
    },
    {
      icon: <FiCompass className="w-8 h-8 text-accent" />,
      title: 'Curated Elegance',
      description: 'We don\'t just sell products; we curate experiences. Our experts hand-select each piece to ensure it elevates your lifestyle.'
    },
    {
      icon: <FiHeart className="w-8 h-8 text-accent" />,
      title: 'Customer Centricity',
      description: 'Your satisfaction is our north star. We offer round-the-clock white-glove support and a seamless premium post-purchase journey.'
    },
    {
      icon: <FiAward className="w-8 h-8 text-accent" />,
      title: 'Authenticity Guaranteed',
      description: 'Every product is 100% genuine and comes with verified certificate stickers and full direct brand warranties.'
    }
  ];

  const team = [
    { 
      name: 'Anand Kumar Pandey',
      role: 'Fullstack Developer',
      image: Anand,
      bio:'Passionate Fullstack Developer focused on building modern, scalable, and user friendly web applications with clean design and secure backend architecture.'
    },
    {
      name: 'Lagan Singh',
      role: 'Backend Developer',
      image: Lagan,
      bio: 'Passionate Backend Developer focused on building modern, scalable, and user friendly web applications with clean design and secure backend architecture.'
    },
    {
      name: 'Sharyesh Ranjan',
      role: 'UI/UX Designer',
      image: sharyesh,
      bio: 'Passionate UI/UX Designer focused on building modern, scalable, and user friendly web applications with clean design and secure backend architecture.'
    },
    {
      name: 'Nitin',
      role: 'deployment Head',
      image: nitin,
      bio: 'Passionate deployment Head focused on building modern, scalable, and user friendly web applications with clean design and secure backend architecture.'
    }
  ];

  return (
    <div className="bg-light min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-primary text-white overflow-hidden py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-transparent z-10"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1441986300917-64674bd600d8?q=80&w=1600')] bg-cover bg-center opacity-40"></div>
        
        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-3xl">
            <span className="text-accent text-sm font-semibold tracking-widest uppercase mb-3 block">Our Heritage</span>
            <h1 className="text-4xl md:text-6xl font-serif font-bold mb-6 leading-tight">
              Redefining the <br />
              <span className="text-accent italic">Art of Shopping</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 font-light leading-relaxed mb-8">
              At LuxeStore, we believe shopping should be more than a transaction. It should be a refined exploration of craftsmanship, aesthetics, and elite design.
            </p>
            <Link to="/shop" className="bg-accent text-white px-8 py-3 rounded-md font-medium hover:bg-opacity-90 transition-all shadow-lg inline-block">
              Explore Our Collection
            </Link>
          </div>
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-32 h-32 bg-accent/10 rounded-lg -z-10"></div>
              <img 
                src="https://images.unsplash.com/photo-1664455340023-214c33a9d0bd?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8ZWNvbW1lcmNlJTIwd2Vic2l0ZXxlbnwwfHwwfHx8MA%3D%3D" 
                alt="Luxury Fashion Curation" 
                className="rounded-lg shadow-2xl object-cover w-full h-[450px]"
              />
              <div className="absolute -bottom-6 -right-6 bg-primary text-white p-6 rounded-lg shadow-xl hidden md:block max-w-[250px]">
                <p className="font-serif text-2xl font-bold text-accent mb-1">Since 2026</p>
                <p className="text-sm text-gray-300 font-light">Crafting the world's most elegant digital storefront.</p>
              </div>
            </div>

            <div className="lg:pl-8">
              <span className="text-accent font-semibold tracking-wider text-xs uppercase mb-2 block">The LuxeStore Vision</span>
              <h2 className="text-3xl md:text-4xl font-serif font-bold text-darkText mb-6">Born from a passion for exquisite craftsmanship</h2>
              <div className="space-y-4 text-mutedText leading-relaxed">
                <p>
                  LuxeStore was established in 2026 under a simple premise: finding high-quality, authentic premium products online shouldn't feel like searching for a needle in a haystack. 
                </p>
                <p>
                  We recognized that discerning buyers seek trust, visual excellence, and curation. To deliver this, we built directly certified partnerships with elite design houses, tech innovators, and lifestyle creators worldwide.
                </p>
                <p>
                  Every listing is vetted, every piece is inspected, and every order is treated as a priority. From the moment you load our storefront to the premium unboxing experience, we promise absolute quality.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Banner */}
      <section className="bg-primary text-white py-16 border-y border-white/10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 text-center">
            {stats.map((stat, idx) => (
              <div key={idx} className="space-y-2">
                <div className="text-4xl md:text-5xl font-serif font-bold text-accent">{stat.value}</div>
                <div className="text-sm text-gray-300 font-light uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Values Section */}
      <section className="py-20 bg-light">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-accent font-semibold tracking-wider text-xs uppercase mb-2 block">Our Pillars</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-darkText">The Values that Guide Us</h2>
            <div className="h-1 w-20 bg-accent mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((v, i) => (
              <div key={i} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="bg-accent/10 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                  {v.icon}
                </div>
                <h3 className="text-xl font-bold text-darkText mb-3">{v.title}</h3>
                <p className="text-mutedText text-sm leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-accent font-semibold tracking-wider text-xs uppercase mb-2 block">Creative Minds</span>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-darkText">Meet the Curation Team</h2>
            <div className="h-1 w-20 bg-accent mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {team.map((member, idx) => (
              <div key={idx} className="group bg-light rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300">
                <div className="relative overflow-hidden h-72">
                  <img 
                    src={member.image} 
                    alt={member.name} 
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                    {/* Visual social placeholders for luxury premium theme */}
                    <div className="w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center font-bold shadow-md cursor-pointer hover:bg-accent hover:text-white transition-colors">in</div>
                    <div className="w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center font-bold shadow-md cursor-pointer hover:bg-accent hover:text-white transition-colors">tw</div>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-darkText mb-1">{member.name}</h3>
                  <p className="text-accent font-medium text-sm mb-4">{member.role}</p>
                  <p className="text-mutedText text-sm leading-relaxed">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-accent relative overflow-hidden text-center text-white">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary opacity-10 rounded-full translate-x-1/3 translate-y-1/3"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <h2 className="text-3xl md:text-5xl font-serif font-bold mb-4">Experience True Luxury</h2>
          <p className="text-primary font-medium text-lg mb-8 max-w-2xl mx-auto">Explore carefully curated collections that bring unmatched premium comfort and utility directly to you.</p>
          <Link to="/shop" className="bg-primary text-white px-8 py-3 rounded-md font-bold hover:bg-opacity-90 transition-colors shadow-xl inline-block">
            Start Exploring
          </Link>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
