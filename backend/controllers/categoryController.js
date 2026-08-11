import Category from '../models/Category.js';
import Product from '../models/Product.js';

// @desc Get all active categories (public)
// @route GET /api/categories
export const getCategories = async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ displayOrder: 1, name: 1 });
  res.json(categories);
};

// @desc Get all categories including inactive (admin)
// @route GET /api/categories/admin/all
export const getAllCategoriesAdmin = async (req, res) => {
  const categories = await Category.find().sort({ displayOrder: 1, name: 1 });
  res.json(categories);
};

// @desc Create category (admin)
// @route POST /api/categories
export const createCategory = async (req, res) => {
  try {
    const { name, description, icon, displayOrder } = req.body;
    const image = req.file ? req.file.path : '';
    const category = await Category.create({ name, description, icon, displayOrder, image });
    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Update category (admin)
// @route PUT /api/categories/:id
export const updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: 'Category not found' });
    const { name, description, icon, displayOrder, isActive } = req.body;
    if (name) category.name = name;
    if (description !== undefined) category.description = description;
    if (icon !== undefined) category.icon = icon;
    if (displayOrder !== undefined) category.displayOrder = displayOrder;
    if (isActive !== undefined) category.isActive = isActive;
    if (req.file) category.image = req.file.path;
    await category.save();
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc Delete category (admin)
// @route DELETE /api/categories/:id
export const deleteCategory = async (req, res) => {
  const inUse = await Product.countDocuments({ category: req.params.id });
  if (inUse > 0) {
    return res.status(400).json({ message: `Cannot delete: ${inUse} product(s) use this category. Hide it instead or reassign products.` });
  }
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) return res.status(404).json({ message: 'Category not found' });
  res.json({ message: 'Category removed' });
};