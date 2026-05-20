import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiUploadCloud, FiX } from 'react-icons/fi';
import api from '../../utils/api';
import Loader from '../../components/Loader';
import { toast } from 'react-toastify';

const AdminEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [manualImageUrl, setManualImageUrl] = useState('');

  const handleAddManualUrl = () => {
    if (manualImageUrl.trim()) {
      setExistingImages(prev => [...prev, manualImageUrl.trim()]);
      setManualImageUrl('');
      toast.success('Image URL added successfully');
    }
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

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/api/products/${id}`);
        setFormData({
          name: data.name,
          price: data.price,
          originalPrice: data.originalPrice || '',
          description: data.description,
          category: data.category,
          subcategory: data.subcategory || '',
          stock: data.stock,
          tags: data.tags?.join(', ') || '',
          isFeatured: data.isFeatured,
          isActive: data.isActive,
        });
        setExistingImages(data.images || []);
      } catch (error) {
        toast.error('Product not found');
        navigate('/admin/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newPreviewUrls = files.map(file => URL.createObjectURL(file));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
    setImageFiles(prev => [...prev, ...files]);
  };

  const removeNewImage = (index) => {
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (url) => {
    setExistingImages(prev => prev.filter(img => img !== url));
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
      throw error;
    }
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      
      // Upload new images
      const newImageUrls = await uploadImagesToCloudinary();
      
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
        images: [...existingImages, ...newImageUrls],
      };

      if (formData.originalPrice) {
        productData.originalPrice = Number(formData.originalPrice);
      }

      await api.put(`/api/admin/products/${id}`, productData);
      toast.success('Product updated successfully');
      navigate('/admin/products');
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Error updating product';
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="bg-light min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin/products" className="p-2 bg-white rounded-md border border-gray-200 text-gray-600 hover:text-primary hover:bg-gray-50">
            <FiArrowLeft size={20} />
          </Link>
          <h1 className="text-3xl font-serif font-bold text-darkText">Edit Product</h1>
        </div>

        <form onSubmit={submitHandler} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              required
              rows="4"
              value={formData.description}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent"
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
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent"
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
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent"
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
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent"
              >
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
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent"
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
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-accent"
                placeholder="Comma separated"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isFeatured"
                checked={formData.isFeatured}
                onChange={handleChange}
                className="w-4 h-4 text-accent rounded focus:ring-accent"
              />
              <span className="text-sm font-medium text-gray-700">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleChange}
                className="w-4 h-4 text-accent rounded focus:ring-accent"
              />
              <span className="text-sm font-medium text-gray-700">Active</span>
            </label>
          </div>

          <div className="pt-6 flex justify-end gap-4">
            <Link to="/admin/products" className="px-6 py-2 border border-gray-300 rounded font-medium text-gray-700 hover:bg-gray-50">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="bg-primary text-white px-8 py-2 rounded font-medium hover:bg-opacity-90 disabled:opacity-50"
            >
              {saving ? 'Updating...' : 'Update Product'}
            </button>
          </div>
        </form>

        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
          <h2 className="text-xl font-bold mb-4">Product Images</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload New Images</label>
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors mb-4">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer flex flex-col items-center">
                  <FiUploadCloud size={24} className="text-gray-400 mb-2" />
                  <span className="text-sm font-medium">Click to add images</span>
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

              {previewUrls.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Selected Files to Upload</h4>
                  <div className="grid grid-cols-3 gap-2">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative aspect-square rounded border border-gray-200 overflow-hidden group">
                        <img src={url} alt="New" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <FiX size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Existing Images</label>
              <div className="grid grid-cols-3 gap-2">
                {existingImages.map((url, index) => (
                  <div key={index} className="relative aspect-square rounded border border-gray-200 overflow-hidden group">
                    <img src={url} alt="Existing" className="w-full h-full object-cover" />
                    <button
                      onClick={() => removeExistingImage(url)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FiX size={12} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminEditProduct;
