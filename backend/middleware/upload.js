import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const makeStorage = (subfolder) => {
  const dest = path.join(__dirname, '..', 'uploads', subfolder);
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  return multer.diskStorage({
    destination: (req, file, cb) => cb(null, dest),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9-_]/g, '');
      cb(null, `${base}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
    },
  });
};

const imageFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|webp|gif/;
  const extOk = allowed.test(path.extname(file.originalname).toLowerCase());
  const mimeOk = allowed.test(file.mimetype);
  if (extOk && mimeOk) cb(null, true);
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
