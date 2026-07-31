import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import { uploadCategoryImage } from '../middleware/upload.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  getCategories, getAllCategoriesAdmin, createCategory, updateCategory, deleteCategory,
} from '../controllers/categoryController.js';

const router = express.Router();

router.get('/', asyncHandler(getCategories));
router.get('/admin/all', protect, admin, asyncHandler(getAllCategoriesAdmin));
router.post('/', protect, admin, uploadCategoryImage.single('image'), asyncHandler(createCategory));
router.put('/:id', protect, admin, uploadCategoryImage.single('image'), asyncHandler(updateCategory));
router.delete('/:id', protect, admin, asyncHandler(deleteCategory));

export default router;
