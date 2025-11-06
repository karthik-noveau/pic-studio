/**
 * Formats file size in bytes to human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size (e.g., "2.5 MB")
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return (
    Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  );
}

/**
 * Greatest common divisor using Euclidean algorithm
 * @param {number} a - First number
 * @param {number} b - Second number
 * @returns {number} GCD of a and b
 */
export function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

/**
 * Simplifies aspect ratio to lowest terms
 * @param {number} width - Width in pixels
 * @param {number} height - Height in pixels
 * @returns {string} Simplified ratio (e.g., "16:9")
 */
export function simplifyRatio(width, height) {
  const divisor = gcd(width, height);
  return `${width / divisor}:${height / divisor}`;
}

/**
 * Gets the common name for an aspect ratio
 * @param {number} ratio - Aspect ratio as decimal
 * @param {Array} commonAspectRatios - Array of common aspect ratios
 * @returns {string|undefined} Name of the ratio or undefined
 */
export function getCommonRatioName(ratio, commonAspectRatios) {
  const tolerance = 0.01;
  return commonAspectRatios.find(
    (cr) => Math.abs(cr.ratio - ratio) < tolerance
  )?.name;
}
