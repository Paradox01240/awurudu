import { v2 as cloudinary } from 'cloudinary';

// Cloudinary configuration
const cloudName = process.env.CLOUDINARY_CLOUD_NAME || 'dcwjw0xwr';
const apiKey = process.env.CLOUDINARY_API_KEY || '116942431838945';
const apiSecret = process.env.CLOUDINARY_API_SECRET || 'PjpXDet3EfDtq9bHmoqq5VL3OXE';

// Configure Cloudinary v2
const cloudinaryConfig = cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dcwjw0xwr',
  api_key: process.env.CLOUDINARY_API_KEY || '116942431838945',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'PjpXDet3EfDtq9bHmoqq5VL3OXE',
  secure: true, // optional, but recommended
});;

console.log('Cloudinary configured:', { cloudName, apiKey: apiKey ? '***' : 'missing', apiSecret: apiSecret ? '***' : 'missing' });

// Upload image to Cloudinary
export async function uploadImageToCloudinary(
  base64Data: string, 
  category: 'kumara' | 'kumari'
): Promise<string> {
  try {
    // Extract base64 content
    const matches = base64Data.match(/^data:(.+?);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      throw new Error('Invalid base64 image data');
    }

    const mimeType = matches[1];
    const base64Content = matches[2];

    // Generate unique filename
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const publicId = `${category}_${timestamp}_${random}`;

    // Upload to Cloudinary v2
    const result = await cloudinary.uploader.upload(
      `data:${mimeType};base64,${base64Content}`,
      {
        public_id: publicId,
        folder: 'awurudu-candidates',
        resource_type: 'image',
        format: 'auto',
        quality: 'auto:good',
        fetch_format: 'auto',
        allowed_formats: ['jpg', 'png', 'gif', 'webp'],
        max_file_size: 5000000, // 5MB
        transformation: [
          { width: 800, height: 800, crop: 'limit', quality: 'auto' }
        ]
      }
    );

    if (!result.secure_url) {
      throw new Error('Failed to upload image to Cloudinary');
    }

    console.log('Image uploaded to Cloudinary:', result.secure_url);
    return result.secure_url;

  } catch (error) {
    console.error('Cloudinary upload error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Failed to upload image: ${errorMessage}`);
  }
}

// Delete image from Cloudinary v2
export async function deleteImageFromCloudinary(imageUrl: string): Promise<void> {
  try {
    // Extract public_id from URL
    const urlParts = imageUrl.split('/');
    const filename = urlParts[urlParts.length - 1];
    const publicId = filename.split('.')[0];

    await cloudinary.uploader.destroy(publicId);
    console.log('Image deleted from Cloudinary:', publicId);
  } catch (error) {
    console.error('Cloudinary delete error:', error instanceof Error ? error.message : error);
  }
}

// Get image info from Cloudinary URL
export function getImageInfoFromUrl(imageUrl: string): { publicId: string } | null {
  try {
    const urlParts = imageUrl.split('/');
    const filename = urlParts[urlParts.length - 1];
    const publicId = filename.split('.')[0];
    
    return { publicId };
  } catch (error) {
    console.error('Error extracting image info:', error instanceof Error ? error.message : error);
    return null;
  }
}

// Validate image before upload
export function validateImage(base64Data: string): { valid: boolean; error?: string } {
  try {
    const matches = base64Data.match(/^data:(.+?);base64,(.+)$/);
    if (!matches || matches.length !== 3) {
      return { valid: false, error: 'Invalid image format' };
    }

    const mimeType = matches[1];
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    
    if (!allowedTypes.includes(mimeType)) {
      return { valid: false, error: 'Only JPEG, PNG, GIF, and WebP images are allowed' };
    }

    // Check file size (base64 length * 0.75 ≈ bytes)
    const base64Content = matches[2];
    const estimatedSize = base64Content.length * 0.75;
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (estimatedSize > maxSize) {
      return { valid: false, error: 'Image size must be less than 5MB' };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
