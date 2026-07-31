import express from 'express';
import { protect, admin } from '../middleware/auth.js';
import { uploadProductImages } from '../middleware/upload.js';
import asyncHandler from '../utils/asyncHandler.js';
import {
  getProducts, getProductBySlug, getProductByIdAdmin, getAllProductsAdmin,
  createProduct, updateProduct, deleteProduct, toggleHideProduct, getHomeCollections,
} from '../controllers/productController.js';

const router = express.Router();

router.get('/', asyncHandler(getProducts));
router.get('/home/collections', asyncHandler(getHomeCollections));
router.get('/admin/all', protect, admin, asyncHandler(getAllProductsAdmin));
router.get('/admin/:id', protect, admin, asyncHandler(getProductByIdAdmin));
router.get('/:slug', asyncHandler(getProductBySlug));

router.post('/', protect, admin, uploadProductImages.array('images', 8), asyncHandler(createProduct));
router.put('/:id', protect, admin, uploadProductImages.array('images', 8), asyncHandler(updateProduct));
router.delete('/:id', protect, admin, asyncHandler(deleteProduct));
router.patch('/:id/toggle-hide', protect, admin, asyncHandler(toggleHideProduct));

export default router;
