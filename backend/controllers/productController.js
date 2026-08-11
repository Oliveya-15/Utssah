import Product from '../models/Product.js';
import Review from '../models/Review.js';
import { buildProductQuery, buildSort } from '../utils/apiFeatures.js';

// @desc Get products with search/filter/sort/pagination (public)
// @route GET /api/products
export const getProducts = async (req, res) => {
  try {
    const filter = buildProductQuery(req.query);
    const sort = buildSort(req.query.sort);
    const page = Math.max(1, Number(req.query.page) || 1);
    const limit = Math.min(48, Number(req.query.limit) || 12);
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      Product.find(filter).populate('category', 'name slug').sort(sort).skip(skip).limit(limit),
      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      page,
      pages: Math.ceil(total / limit),
      total,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get single product by slug (public)
// @route GET /api/products/:slug
export const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isHidden: false })
      .populate('category', 'name slug')
      .populate('frequentlyBoughtWith', 'name slug price images availability');
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const similar = await Product.find({
      category: product.category?._id,
      _id: { $ne: product._id },
      isHidden: false,
    }).limit(4);

    const reviews = await Review.find({ product: product._id, isApproved: true })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    res.json({ product, similar, reviews });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Get product by id (admin - includes hidden)
// @route GET /api/products/admin/:id
export const getProductByIdAdmin = async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category', 'name slug');
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
};

// @desc Get all products for admin (includes hidden, no isHidden filter)
// @route GET /api/products/admin/all
export const getAllProductsAdmin = async (req, res) => {
  const products = await Product.find().populate('category', 'name slug').sort({ createdAt: -1 });
  res.json(products);
};

// @desc Create product (admin)
// @route POST /api/products
export const createProduct = async (req, res) => {
  try {
    const body = req.body;
    const images = (req.files || []).map((f) => f.path);

    let specifications = [];
    if (body.specifications) {
      try {
        specifications = JSON.parse(body.specifications);
      } catch {
        specifications = [];
      }
    }
    let tags = [];
    if (body.tags) {
      tags = String(body.tags).split(',').map((t) => t.trim()).filter(Boolean);
    }

    const product = await Product.create({
      name: body.name,
      category: body.category,
      description: body.description,
      specifications,
      price: body.price,
      compareAtPrice: body.compareAtPrice || 0,
      tags,
      images,
      video: body.video || '',
      availability: body.availability || 'available',
      productionDays: body.productionDays || 3,
      isFeatured: body.isFeatured === 'true' || body.isFeatured === true,
      isNewArrival: body.isNewArrival === 'true' || body.isNewArrival === true || body.isNewArrival === undefined,
      isBestSeller: body.isBestSeller === 'true' || body.isBestSeller === true,
      stockNote: body.stockNote || '',
    });
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update product (admin)
// @route PUT /api/products/:id
export const updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    const body = req.body;

    const fields = [
      'name', 'category', 'description', 'price', 'compareAtPrice',
      'video', 'availability', 'productionDays', 'stockNote',
    ];
    fields.forEach((f) => {
      if (body[f] !== undefined) product[f] = body[f];
    });

    ['isFeatured', 'isNewArrival', 'isBestSeller', 'isHidden'].forEach((f) => {
      if (body[f] !== undefined) product[f] = body[f] === 'true' || body[f] === true;
    });

    if (body.tags !== undefined) {
      product.tags = String(body.tags).split(',').map((t) => t.trim()).filter(Boolean);
    }
    if (body.specifications !== undefined) {
      try {
        product.specifications = JSON.parse(body.specifications);
      } catch {
        /* keep existing */
      }
    }

    const newImages = (req.files || []).map((f) => f.path);
    if (newImages.length > 0) {
      // If keepImages provided (existing images to retain), respect it; otherwise append
      if (body.keepImages) {
        let keep = [];
        try {
          keep = JSON.parse(body.keepImages);
        } catch {
          keep = [];
        }
        product.images = [...keep, ...newImages];
      } else {
        product.images = [...product.images, ...newImages];
      }
    } else if (body.keepImages) {
      try {
        product.images = JSON.parse(body.keepImages);
      } catch {
        /* keep existing */
      }
    }

    await product.save();
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete product (admin)
// @route DELETE /api/products/:id
export const deleteProduct = async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json({ message: 'Product removed' });
};

// @desc Toggle hide/show (admin)
// @route PATCH /api/products/:id/toggle-hide
export const toggleHideProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });
  product.isHidden = !product.isHidden;
  await product.save();
  res.json(product);
};

// @desc Homepage collections: featured, new arrivals, best sellers
// @route GET /api/products/home/collections
export const getHomeCollections = async (req, res) => {
  const [featured, newArrivals, bestSellers] = await Promise.all([
    Product.find({ isFeatured: true, isHidden: false }).limit(8),
    Product.find({ isNewArrival: true, isHidden: false }).sort({ createdAt: -1 }).limit(8),
    Product.find({ isBestSeller: true, isHidden: false }).limit(8),
  ]);
  res.json({ featured, newArrivals, bestSellers });
};