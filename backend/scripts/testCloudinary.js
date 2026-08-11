import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

console.log('Testing Cloudinary with:');
console.log('  cloud_name:', process.env.CLOUDINARY_CLOUD_NAME);
console.log('  api_key:   ', process.env.CLOUDINARY_API_KEY);
console.log('  api_secret:', process.env.CLOUDINARY_API_SECRET ? `${process.env.CLOUDINARY_API_SECRET.slice(0, 4)}...(${process.env.CLOUDINARY_API_SECRET.length} chars)` : 'MISSING');
console.log('');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

cloudinary.uploader.upload(
  'https://res.cloudinary.com/demo/image/upload/sample.jpg',
  { folder: 'utsaah/test' },
  (error, result) => {
    if (error) {
      console.error('❌ Cloudinary rejected the upload:\n');
      console.error(error);
    } else {
      console.log('✅ Cloudinary upload succeeded!');
      console.log('URL:', result.secure_url);
    }
    process.exit(error ? 1 : 0);
  }
);