import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

// Images are uploaded straight to Cloudinary (not local disk) because
// Render's filesystem is ephemeral — anything written to disk at runtime
// is wiped on every redeploy/restart. Cloudinary's free tier gives
// permanent, always-on storage instead, and req.file(.path) comes back as
// a full https URL that the frontend already knows how to use as-is.
const makeStorage = (folder) =>
  new CloudinaryStorage({
    cloudinary,
    params: {
      folder: `utsaah/${folder}`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
      transformation: [{ width: 2000, height: 2000, crop: 'limit' }],
    },
  });

const imageFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif/;
  const mimeOk = allowed.test(file.mimetype);
  if (mimeOk) cb(null, true);
  else cb(new Error('Only image files (jpg, jpeg, png, webp, gif) are allowed'));
};

export const uploadProductImages = multer({
  storage: makeStorage('products'),
  fileFilter: imageFilter,
  limits: { fileSize: 8 * 1024 * 1024 },
});

export const uploadReviewImages = multer({
  storage: makeStorage('reviews'),
  fileFilter: imageFilter,
  limits: { fileSize: 8 * 1024 * 1024 },
});

export const uploadCustomRequestImages = multer({
  storage: makeStorage('custom-requests'),
  fileFilter: imageFilter,
  limits: { fileSize: 8 * 1024 * 1024 },
});

export const uploadCategoryImage = multer({
  storage: makeStorage('categories'),
  fileFilter: imageFilter,
  limits: { fileSize: 8 * 1024 * 1024 },
});