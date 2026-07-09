import type { Area } from 'react-easy-crop';

/** Browser-safe image MIME types accepted for uploads. */
export const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

/** Browser-safe image file extensions accepted for uploads. */
export const ALLOWED_IMAGE_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'] as const;

/** Value for HTML file input `accept` attributes. */
export const ALLOWED_IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp';

/** User-facing list of supported image formats. */
export const ALLOWED_IMAGE_FORMATS_LABEL = 'JPG, PNG, or WebP';

const BLOCKED_IMAGE_MIME_TYPES = new Set(['image/heic', 'image/heif']);
const BLOCKED_IMAGE_EXTENSIONS = new Set(['heic', 'heif']);

/** Default square output size for trainer profile photos. */
export const PROFILE_PHOTO_OUTPUT_SIZE = 400;

/** Default square output size for company logos. */
export const COMPANY_LOGO_OUTPUT_SIZE = 512;

export interface CropImageFileOptions {
  outputSize?: number;
  mimeType?: 'image/jpeg' | 'image/png';
  quality?: number;
}

/**
 * Load an image element from a URL or object URL.
 *
 * @param url - Image source URL.
 * @returns Loaded HTML image element.
 */
export function loadImageElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', () => reject(new Error('Failed to load image')));
    image.crossOrigin = 'anonymous';
    image.src = url;
  });
}

/**
 * Render a cropped region of an image to a JPEG file.
 *
 * @param imageSrc - Source image URL (object URL or remote).
 * @param pixelCrop - Crop rectangle in source pixel coordinates.
 * @param fileName - Output file name.
 * @param outputSize - Square output dimension in pixels.
 * @returns Cropped image file ready for upload.
 */
export async function getCroppedImageFile(
  imageSrc: string,
  pixelCrop: Area,
  fileName: string,
  options: CropImageFileOptions = {}
): Promise<File> {
  const {
    outputSize = PROFILE_PHOTO_OUTPUT_SIZE,
    mimeType = 'image/jpeg',
    quality = mimeType === 'image/png' ? undefined : 0.92,
  } = options;

  const image = await loadImageElement(imageSrc);
  const canvas = document.createElement('canvas');
  canvas.width = outputSize;
  canvas.height = outputSize;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas is not supported in this browser');
  }

  if (mimeType === 'image/png') {
    ctx.clearRect(0, 0, outputSize, outputSize);
  }

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputSize,
    outputSize
  );

  const extension = mimeType === 'image/png' ? 'png' : 'jpg';

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error('Failed to crop image'));
          return;
        }
        const baseName = fileName.replace(/\.[^.]+$/, '') || 'cropped-image';
        resolve(
          new File([blob], `${baseName}.${extension}`, { type: mimeType, lastModified: Date.now() })
        );
      },
      mimeType,
      quality
    );
  });
}

/**
 * Extract lowercase file extension from a filename.
 *
 * @param fileName - Original upload filename.
 * @returns Extension without dot, or empty string.
 */
export function getImageFileExtension(fileName: string): string {
  const match = fileName.trim().toLowerCase().match(/\.([a-z0-9]+)$/);
  return match?.[1] ?? '';
}

/**
 * Whether a selected file uses a browser-safe image format.
 *
 * @param file - Selected file from the file input.
 * @returns True when the file is JPG, PNG, or WebP.
 */
export function isAllowedImageUpload(file: File): boolean {
  const mime = file.type.toLowerCase();
  const extension = getImageFileExtension(file.name);

  if (BLOCKED_IMAGE_MIME_TYPES.has(mime) || BLOCKED_IMAGE_EXTENSIONS.has(extension)) {
    return false;
  }

  if (mime && (ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(mime)) {
    return true;
  }

  return (ALLOWED_IMAGE_EXTENSIONS as readonly string[]).includes(extension);
}

/**
 * Validate that a file is an acceptable image upload before cropping.
 *
 * @param file - Selected file from the file input.
 * @returns Error message or null when valid.
 */
export function validateImageUploadFile(file: File): string | null {
  if (!isAllowedImageUpload(file)) {
    return `Please upload a ${ALLOWED_IMAGE_FORMATS_LABEL} image. HEIC and other formats are not supported.`;
  }
  if (file.size > 5 * 1024 * 1024) {
    return 'File size should be less than 5MB';
  }
  return null;
}

/** @deprecated Use validateImageUploadFile */
export const validateProfilePhotoFile = validateImageUploadFile;
