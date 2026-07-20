const { Readable } = require('stream');
const { v2: cloudinary } = require('cloudinary');

function configureCloudinary() {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    return false;
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });

  return true;
}

function isConfigured() {
  return Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );
}

/**
 * Upload a buffer (from multer memoryStorage) to Cloudinary.
 * @returns {Promise<{ url: string, publicId: string, width?: number, height?: number, format?: string }>}
 */
function uploadBuffer(buffer, options = {}) {
  if (!isConfigured()) {
    const err = new Error('Cloudinary is not configured');
    err.status = 503;
    return Promise.reject(err);
  }

  configureCloudinary();

  const folder = options.folder || process.env.CLOUDINARY_FOLDER || 'portfolio';

  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({
          url: result.secure_url,
          publicId: result.public_id,
          width: result.width,
          height: result.height,
          format: result.format,
        });
      }
    );

    Readable.from(buffer).pipe(stream);
  });
}

module.exports = {
  cloudinary,
  configureCloudinary,
  isConfigured,
  uploadBuffer,
};
