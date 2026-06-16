import type { Area } from 'react-easy-crop';

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
 * Validate that a file is an acceptable image upload before cropping.
 *
 * @param file - Selected file from the file input.
 * @returns Error message or null when valid.
 */
export function validateImageUploadFile(file: File): string | null {
  if (!file.type.startsWith('image/')) {
    return 'Please select an image file';
  }
  if (file.size > 5 * 1024 * 1024) {
    return 'File size should be less than 5MB';
  }
  return null;
}

/** @deprecated Use validateImageUploadFile */
export const validateProfilePhotoFile = validateImageUploadFile;
