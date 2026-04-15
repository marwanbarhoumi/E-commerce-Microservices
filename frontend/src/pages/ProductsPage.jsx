import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

const user = JSON.parse(localStorage.getItem('user') || '{}');
const isAdmin = user.role === 'admin';

const emptyForm = { name: '', description: '', price: '', stock: '', imageUrl: '' };

export default function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState([]);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  // Admin state
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [editId, setEditId] = useState(null);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchProducts = async (searchTerm = '') => {
    setLoading(true);
    try {
      const { data } = await api.get(`/products${searchTerm ? `?search=${searchTerm}` : ''}`);
      setProducts(data.products);
    } catch {
      setError('خطأ في جلب المنتجات');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ── Cart ──────────────────────────────────────────────────
  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((i) => i.productId === product._id);
      if (exists) {
        return prev.map((i) =>
          i.productId === product._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [
        ...prev,
        {
          productId: product._id,
          name: product.name,
          price: product.price,
          quantity: 1,
        },
      ];
    });
  };

  const placeOrder = async () => {
    if (cart.length === 0) return alert('السلة فارغة!');
    try {
      await api.post('/orders', { items: cart });
      alert('✅ تم إنشاء الطلبية بنجاح!');
      setCart([]);
      navigate('/orders');
    } catch (err) {
      alert(err.response?.data?.message || 'خطأ في إنشاء الطلبية');
    }
  };

  // ── Admin CRUD ────────────────────────────────────────────
  const openAdd = () => {
    setEditId(null);
    setFormData(emptyForm);
    setImageFile(null);
    setImagePreview('');
    setFormError('');
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditId(p._id);
    setFormData({
      name: p.name,
      description: p.description,
      price: p.price,
      stock: p.stock,
      imageUrl: p.imageUrl || '',
    });
    setImageFile(null);
    setImagePreview(p.imageUrl || '');
    setFormError('');
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce produit ?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur suppression');
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price || !formData.stock) {
      setFormError('Nom, prix et stock sont obligatoires');
      return;
    }

    setSaving(true);
    try {
      let imageUrl = formData.imageUrl || '';

      // upload image awwel lukan 3andna fichier jdid
      if (imageFile) {
        const fd = new FormData();
        fd.append('image', imageFile);

        const { data } = await api.post('/products/upload-image', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        imageUrl = data.imageUrl;
      }

      const payload = { ...formData, imageUrl };

      if (editId) {
        await api.put(`/products/${editId}`, payload);
      } else {
        await api.post('/products', payload);
      }

      setShowForm(false);
      fetchProducts();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Erreur sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const total = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Search + Add */}
      <div className="flex gap-3 mb-6">
        <input
          className="flex-1 border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          placeholder="🔍 ابحث عن منتج..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchProducts(search)}
        />
        <button
          className="px-5 py-2 bg-gray-900 text-white rounded-xl text-sm hover:bg-gray-700 transition"
          onClick={() => fetchProducts(search)}
        >
          بحث
        </button>

        {isAdmin && (
          <button
            className="px-5 py-2 bg-green-600 text-white rounded-xl text-sm hover:bg-green-700 transition"
            onClick={openAdd}
          >
            + Ajouter
          </button>
        )}
      </div>

      {/* Modal form admin */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              {editId ? 'Modifier le produit' : 'Ajouter un produit'}
            </h3>

            {formError && (
              <div className="bg-red-50 text-red-500 text-sm rounded-lg px-4 py-2 mb-4">
                {formError}
              </div>
            )}

            <div className="space-y-3">
              {[
                { key: 'name', label: 'Nom', type: 'text' },
                { key: 'description', label: 'Description', type: 'text' },
                { key: 'price', label: 'Prix (TND)', type: 'number' },
                { key: 'stock', label: 'Stock', type: 'number' },
              ].map(({ key, label, type }) => (
                <input
                  key={key}
                  type={type}
                  placeholder={label}
                  value={formData[key]}
                  onChange={(e) => setFormData({ ...formData, [key]: e.target.value })}
                  className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
                />
              ))}

              {/* Image upload */}
              <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center">
                {imagePreview ? (
                  <div className="relative">
                    <img
                      src={
                        imagePreview.startsWith('/uploads')
                          ? `http://localhost:3002${imagePreview}`
                          : imagePreview
                      }
                      alt="preview"
                      className="w-full h-32 object-cover rounded-lg mb-2"
                    />
                    <button
                      onClick={() => {
                        setImageFile(null);
                        setImagePreview('');
                        setFormData({ ...formData, imageUrl: '' });
                      }}
                      className="text-xs text-red-400 hover:text-red-600"
                    >
                      Supprimer
                    </button>
                  </div>
                ) : (
                  <label className="cursor-pointer">
                    <div className="text-gray-400 text-sm mb-1">
                      📷 Cliquer pour ajouter une image
                    </div>
                    <div className="text-xs text-gray-300">
                      jpeg, png, webp — max 5MB
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setImageFile(file);
                          setImagePreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-5">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-gray-900 text-white py-2 rounded-xl text-sm hover:bg-gray-700 transition disabled:opacity-60"
              >
                {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 border border-gray-200 text-gray-600 py-2 rounded-xl text-sm hover:bg-gray-50 transition"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-6">
        {/* Products grid */}
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">المنتجات</h2>
          {loading && <p className="text-gray-400 text-sm">جاري التحميل...</p>}
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {products.map((p) => (
              <div key={p._id} className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
                {p.imageUrl && (
                  <img
                    src={`http://localhost:3002${p.imageUrl}`}
                    alt={p.name}
                    className="w-full h-32 object-cover rounded-xl mb-3"
                  />
                )}

                <h3 className="font-medium text-gray-800 mb-1">{p.name}</h3>
                <p className="text-xs text-gray-400 mb-2">{p.description}</p>
                <p className="text-lg font-semibold text-red-500 mb-1">{p.price} د.ت</p>
                <p className="text-xs text-gray-400 mb-3">المخزون: {p.stock}</p>

                {isAdmin ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => openEdit(p)}
                      className="flex-1 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs hover:bg-blue-100 transition"
                    >
                      ✏️ Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(p._id)}
                      className="flex-1 py-1.5 bg-red-50 text-red-500 rounded-lg text-xs hover:bg-red-100 transition"
                    >
                      🗑 Supprimer
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => addToCart(p)}
                    disabled={p.stock === 0}
                    className="w-full py-2 bg-red-500 text-white rounded-xl text-sm hover:bg-red-600 transition disabled:opacity-50"
                  >
                    {p.stock === 0 ? 'نفد المخزون' : '🛒 أضف للسلة'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Cart — users only */}
        {!isAdmin && (
          <div className="w-72 bg-white rounded-2xl p-5 border border-gray-100 shadow-sm h-fit">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">🛒 السلة</h2>
            {cart.length === 0 ? (
              <p className="text-gray-400 text-sm">السلة فارغة</p>
            ) : (
              <>
                {cart.map((item) => (
                  <div
                    key={item.productId}
                    className="flex justify-between text-sm py-2 border-b border-gray-50"
                  >
                    <span className="text-gray-700">{item.name}</span>
                    <span className="text-gray-400">×{item.quantity}</span>
                    <span className="text-gray-800 font-medium">
                      {item.price * item.quantity} د.ت
                    </span>
                  </div>
                ))}

                <div className="font-semibold text-gray-800 py-3">الإجمالي: {total} د.ت</div>

                <button
                  onClick={placeOrder}
                  className="w-full py-2.5 bg-gray-900 text-white rounded-xl text-sm hover:bg-gray-700 transition"
                >
                  ✅ اطلب الآن
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}