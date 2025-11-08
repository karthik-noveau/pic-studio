/**
 * Background Removal Utilities
 * Automatic background removal using AI models
 */

import { removeBackground } from '@imgly/background-removal';

/**
 * Remove background from an image automatically
 * Uses AI to detect and remove backgrounds from products, people, animals, etc.
 *
 * @param {string} imageSrc - Image source (data URL or URL)
 * @param {Object} options - Configuration options
 * @returns {Promise<{dataUrl: string, blob: Blob}>}
 */
export async function autoRemoveBackground(imageSrc, options = {}) {
  const {
    onProgress = null,
    model = 'medium', // 'small', 'medium', or 'large'
    debug = false,
  } = options;

  try {
    // Remove background using the library
    const blob = await removeBackground(imageSrc, {
      model,
      progress: onProgress,
      debug,
      output: {
        format: 'image/png',
        quality: 1.0,
        type: 'foreground',
      },
    });

    // Convert blob to data URL
    const dataUrl = await blobToDataUrl(blob);

    return {
      dataUrl,
      blob,
      size: blob.size,
    };
  } catch (error) {
    console.error('Background removal error:', error);
    throw new Error(`Failed to remove background: ${error.message}`);
  }
}

/**
 * Convert blob to data URL
 */
function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Remove background with custom configuration
 * Allows fine-tuning of the removal process
 */
export async function advancedRemoveBackground(imageSrc, config = {}) {
  const {
    model = 'medium',onProgress = null,
  } = config;

  try {
    const blob = await removeBackground(imageSrc, {
      model,
      progress: onProgress,
      output: {
        format: 'image/png',
        quality: 1.0,
        type: 'foreground',
      },
    });

    const dataUrl = await blobToDataUrl(blob);

    return {
      dataUrl,
      blob,
      size: blob.size,
    };
  } catch (error) {
    throw new Error(`Advanced background removal failed: ${error.message}`);
  }
}

/**
 * Check if background removal is supported in current browser
 */
export function isBackgroundRemovalSupported() {
  // Check for WebGL support (required for the AI model)
  try {
    const canvas = document.createElement('canvas');
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext('webgl') || canvas.getContext('experimental-webgl'))
    );
  // eslint-disable-next-line no-unused-vars
  } catch (e) {
    return false;
  }
}

/**
 * Estimate processing time based on image size
 */
export function estimateProcessingTime(imageWidth, imageHeight) {
  const pixels = imageWidth * imageHeight;
  const megapixels = pixels / (1024 * 1024);

  // Rough estimation: ~2-5 seconds per megapixel on average hardware
  const estimatedSeconds = Math.ceil(megapixels * 3);

  if (estimatedSeconds < 5) return 'a few seconds';
  if (estimatedSeconds < 15) return 'about 10-15 seconds';
  if (estimatedSeconds < 30) return 'about 20-30 seconds';
  return 'about 30-60 seconds';
}
