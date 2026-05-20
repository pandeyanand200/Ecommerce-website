import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiUploadCloud, FiX } from 'react-icons/fi';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const AdminAddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [manualUrls, setManualUrls] = useState([]);
  const [manualImageUrl, setManualImageUrl] = useState('');

  const handleAddManualUrl = () => {
    if (manualImageUrl.trim()) {
      setManualUrls(prev => [...prev, manualImageUrl.trim()]);
      setManualImageUrl('');
    }
  };

  const removeManualUrl = (index) => {
    setManualUrls(prev => prev.filter((_, i) => i !== index));
  };

  const [formData, setFormData] = useState({
    name: '',
    price: '',
    originalPrice: '',
    description: '',
    category: '',
    subcategory: '',
    stock: '',
    tags: '',
    isFeatured: false,
    isActive: true,
  });

  const categories = ['Electronics', 'Fashion', 'Home and Living', 'Beauty', 'Sports', 'Books'];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Create preview URLs
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    setImageFiles(prev => [...prev, ...files]);
  };

  const removeImage = (index) => {
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadImagesToCloudinary = async () => {
    try {
      const uploadPromises = imageFiles.map(async (file) => {
        const form = new FormData();
        form.append('image', file);
        const { data } = await api.post('/api/upload', form);
        return data.url;
      });
      
      const uploadedUrls = await Promise.all(uploadPromises);
      return uploadedUrls.filter(Boolean);
    } catch (error) {
      console.error('Error uploading images:', error);
      throw error; // Pass the original error through
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Upload images first
      const uploadedUrls = await uploadImagesToCloudinary();
      
      // Combine manual URLs and uploaded URLs
      const finalImageUrls = [...manualUrls, ...uploadedUrls];
      
      // If no images were uploaded or pasted, use a placeholder
      const finalUrls = finalImageUrls.length > 0 
        ? finalImageUrls 
        : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'];

      const productData = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        category: formData.category,
        subcategory: formData.subcategory || undefined,
        stock: Number(formData.stock),
        isFeatured: formData.isFeatured,
        isActive: formData.isActive,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        images: finalUrls,
      };

      if (formData.originalPrice) {
        productData.originalPrice = Number(formData.originalPrice);
      }

      await api.post('/api/admin/products', productData);
      toast.success('Product created successfully');
      navigate('/admin/products');
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error creating product';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-light min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin/products" className="p-2 bg-white rounded-md border border-gray-200 text-gray-600 hover:text-primary hover:bg-gray-50">
            <FiArrowLeft size={20} />
          </Link>
          <h1 className="text-3xl font-serif font-bold text-darkText">Add New Product</h1>
        </div>

        <form onSubmit={submitHandler} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Left Column - Basic Info */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                  placeholder="e.g. Sony WH-1000XM4"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  required
                  rows="5"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                  placeholder="Detailed product description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹)</label>
                  <input
                    type="number"
                    name="price"
                    required
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    name="originalPrice"
                    min="0"
                    value={formData.originalPrice}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                  >
                    <option value="" disabled>Select category</option>
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
                  <input
                    type="text"
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                    placeholder="Optional"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    name="stock"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
                  <input
                    type="text"
                    name="tags"
                    value={formData.tags}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent"
                    placeholder="Comma separated"
                  />
                </div>
              </div>
            </div>

            {/* Right Column - Images & Settings */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Images (Upload)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition-colors mb-4">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                    <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                      <FiUploadCloud size={32} />
                    </div>
                    <span className="font-medium text-darkText mb-1">Click to upload images</span>
                    <span className="text-xs text-gray-500">PNG, JPG, WEBP up to 5MB</span>
                  </label>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Or Paste Manually Uploaded Image URL</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={manualImageUrl}
                      onChange={(e) => setManualImageUrl(e.target.value)}
                      placeholder="e.g. https://res.cloudinary.com/..."
                      className="flex-1 border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleAddManualUrl}
                      className="bg-accent text-white px-4 py-2 rounded hover:bg-opacity-90 font-medium text-sm transition-colors"
                    >
                      Add URL
                    </button>
                  </div>
                </div>

                {/* Combined Previews */}
                {(previewUrls.length > 0 || manualUrls.length > 0) && (
                  <div>
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Image Gallery Previews</h4>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                      {/* Manual pasted URLs */}
                      {manualUrls.map((url, index) => (
                        <div key={`manual-${index}`} className="relative aspect-square rounded-md border border-accent/30 overflow-hidden group shadow-sm">
                          <img src={url} alt={`Manual ${index}`} className="w-full h-full object-cover" />
                          <div className="absolute top-1 left-1 bg-accent text-white text-[9px] px-1 rounded font-bold shadow-sm">URL</div>
                          <button
                            type="button"
                            onClick={() => removeManualUrl(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      ))}
                      {/* Upload files */}
                      {previewUrls.map((url, index) => (
                        <div key={`file-${index}`} className="relative aspect-square rounded-md border border-gray-200 overflow-hidden group shadow-sm">
                          <img src={url} alt={`File ${index}`} className="w-full h-full object-cover" />
                          <div className="absolute top-1 left-1 bg-blue-500 text-white text-[9px] px-1 rounded font-bold shadow-sm">File</div>
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <FiX size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                <h3 className="font-medium text-darkText border-b border-gray-200 pb-2">Product Settings</h3>
                
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isFeatured"
                    checked={formData.isFeatured}
                    onChange={handleChange}
                    className="w-5 h-5 text-accent rounded border-gray-300 focus:ring-accent"
                  />
                  <div>
                    <span className="block font-medium text-darkText">Featured Product</span>
                    <span className="block text-xs text-gray-500">Show this product on the home page</span>
                  </div>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="w-5 h-5 text-accent rounded border-gray-300 focus:ring-accent"
                  />
                  <div>
                    <span className="block font-medium text-darkText">Active Status</span>
                    <span className="block text-xs text-gray-500">Product will be visible to customers</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-100 pt-6 flex justify-end gap-4">
            <Link to="/admin/products" className="px-6 py-2 border border-gray-300 rounded font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="bg-primary text-white px-8 py-2 rounded font-medium hover:bg-opacity-90 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Product'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default AdminAddProduct;
