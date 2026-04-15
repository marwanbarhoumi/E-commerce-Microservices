const Product = require('../models/product.model');

exports.getAll = async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category, minPrice, maxPrice } = req.query;
    const filter = { isActive: true };
    if (search) filter['$text'] = { '$search': search };
    if (category) filter.category = category;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price['$gte'] = Number(minPrice);
      if (maxPrice) filter.price['$lte'] = Number(maxPrice);
    }
    const total = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });
    res.json({ products, pagination: { total, page: Number(page), pages: Math.ceil(total / limit), limit: Number(limit) } });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product || !product.isActive)
      return res.status(404).json({ message: 'المنتج غير موجود' });
    res.json(product);
  } catch (err) {
    if (err.name === 'CastError')
      return res.status(400).json({ message: 'ID غير صالح' });
    res.status(500).json({ message: 'خطأ في السيرفر', error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, price } = req.body;
    if (!name || price === undefined)
      return res.status(400).json({ message: 'الاسم والسعر مطلوبان' });
    const product = await Product.create(req.body);
    res.status(201).json({ message: 'تم إضافة المنتج بنجاح', product });
  } catch (err) {
    res.status(400).json({ message: 'خطأ في البيانات', error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!product)
      return res.status(404).json({ message: 'المنتج غير موجود' });
    res.json({ message: 'تم تعديل المنتج بنجاح', product });
  } catch (err) {
    res.status(400).json({ message: 'خطأ في البيانات', error: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
    if (!product)
      return res.status(404).json({ message: 'المنتج غير موجود' });
    res.json({ message: 'تم حذف المنتج بنجاح' });
  } catch (err) {
    res.status(500).json({ message: 'خطأ في السيرفر', error: err.message });
  }
};

// ── uploadImage ───────────────────────────────────────────────
exports.uploadImage = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'Aucun fichier envoyé' });
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ imageUrl });
  } catch (err) {
    res.status(500).json({ message: 'Erreur upload', error: err.message });
  }
};