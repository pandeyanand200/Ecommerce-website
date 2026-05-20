import { useState } from 'react';
import { FiMail, FiPhone, FiMapPin, FiClock, FiSend, FiCheckCircle } from 'react-icons/fi';
import { toast } from 'react-toastify';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const contactDetails = [
    {
      icon: <FiPhone className="w-6 h-6 text-accent" />,
      title: 'Call Us Directly',
      info: '+1 (555) 123-4567',
      subInfo: 'Toll-free customer hotline',
    },
    {
      icon: <FiMail className="w-6 h-6 text-accent" />,
      title: 'Email Correspondence',
      info: 'support@luxestore.com',
      subInfo: 'Response within 24 hours guaranteed',
    },
    {
      icon: <FiMapPin className="w-6 h-6 text-accent" />,
      title: 'Headquarters',
      info: '123 Commerce St, Suite 500',
      subInfo: 'Tech City, TC 10101',
    },
    {
      icon: <FiClock className="w-6 h-6 text-accent" />,
      title: 'Operating Hours',
      info: 'Monday - Friday: 9 AM - 6 PM',
      subInfo: 'Saturday Support: 10 AM - 4 PM',
    },
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error('Please fill in all required fields.');
      return;
    }

    try {
      setIsSubmitting(true);
      // Simulate API submit latency
      await new Promise((resolve) => setTimeout(resolve, 1200));
      toast.success('Your message has been received! We will respond shortly.');
      setIsSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-light min-h-screen">
      {/* Hero Header */}
      <section className="relative bg-primary text-white py-20 overflow-hidden text-center">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/80 to-primary z-10"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557200134-90327ee9fafa?q=80&w=1600')] bg-cover bg-center opacity-30"></div>
        
        <div className="container mx-auto px-4 relative z-20">
          <span className="text-accent text-sm font-semibold tracking-widest uppercase mb-3 block">Get In Touch</span>
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Connect with LuxeStore</h1>
          <div className="h-1 w-20 bg-accent mx-auto mt-4 rounded-full"></div>
          <p className="mt-6 text-gray-300 text-lg max-w-xl mx-auto">
            Whether you have a question about our premium collections, shipping, or bespoke services, our team is always ready to provide personalized assistance.
          </p>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            
            {/* Contact Information Panel */}
            <div className="space-y-6 lg:col-span-1">
              <h2 className="text-2xl font-serif font-bold text-darkText mb-6">Support Channels</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
                {contactDetails.map((item, idx) => (
                  <div key={idx} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex gap-4 hover:shadow-md transition-shadow">
                    <div className="bg-accent/10 w-12 h-12 rounded-lg flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-darkText text-md mb-1">{item.title}</h4>
                      <p className="text-accent font-semibold text-sm mb-1">{item.info}</p>
                      <p className="text-gray-400 text-xs">{item.subInfo}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Message Form */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-accent/5 rounded-full translate-x-1/3 -translate-y-1/3"></div>
              
              {isSubmitted ? (
                <div className="h-full flex flex-col items-center justify-center text-center py-12 animate-fadeIn">
                  <FiCheckCircle className="w-16 h-16 text-accent mb-6 animate-bounce" />
                  <h3 className="text-2xl font-serif font-bold text-darkText mb-3">Thank You!</h3>
                  <p className="text-mutedText max-w-md mx-auto mb-8">
                    Your inquiry has been successfully transmitted. One of our dedicated client specialists will reach out to you within the next 24 hours.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="bg-primary text-white px-6 py-2.5 rounded-md font-semibold hover:bg-opacity-95 transition-all shadow-md"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-serif font-bold text-darkText mb-2">Send Us a Message</h2>
                  <p className="text-sm text-gray-500 mb-8">Fields marked with an asterisk (*) are required.</p>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Full Name *</label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all text-sm"
                          placeholder="Enter your name"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email Address *</label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full border border-gray-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all text-sm"
                          placeholder="name@example.com"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Subject</label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all text-sm"
                        placeholder="Inquiry topic"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Your Message *</label>
                      <textarea
                        name="message"
                        required
                        rows={5}
                        value={formData.message}
                        onChange={handleInputChange}
                        className="w-full border border-gray-300 rounded-lg py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all text-sm resize-none"
                        placeholder="Write your request in detail..."
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-primary text-white px-8 py-3 rounded-lg font-bold flex items-center justify-center gap-2 hover:bg-opacity-95 transition-all shadow-md disabled:opacity-75 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>Sending Message...</>
                      ) : (
                        <>
                          <FiSend />
                          <span>Submit Request</span>
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* Decorative Interactive Map Section */}
      <section className="bg-white border-t border-gray-200">
        <div className="w-full h-96 relative overflow-hidden bg-gray-100 flex items-center justify-center">
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-75"></div>
          <div className="z-10 text-center max-w-md p-6 bg-white/80 backdrop-blur-md rounded-2xl shadow-lg border border-gray-200">
            <FiMapPin className="w-8 h-8 text-accent mx-auto mb-3 animate-bounce" />
            <h4 className="font-bold text-darkText mb-1">Our Flagship Boutique</h4>
            <p className="text-sm text-gray-500 mb-4">Visit us physically for a personalized tailoring and styling experience.</p>
            <a
              href="https://maps.google.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-bold text-accent hover:underline uppercase tracking-wider"
            >
              Get Directions on Map
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
