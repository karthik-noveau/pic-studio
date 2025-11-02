// Favicon sizes
export const faviconSizes = [
  { size: 16, name: "16x16", description: "Browser tab" },
  { size: 32, name: "32x32", description: "Taskbar" },
  { size: 48, name: "48x48", description: "Desktop" },
  { size: 64, name: "64x64", description: "High DPI" },
  { size: 96, name: "96x96", description: "Android" },
  { size: 128, name: "128x128", description: "Chrome Web Store" },
  { size: 152, name: "152x152", description: "iPad" },
  { size: 180, name: "180x180", description: "iPhone" },
  { size: 192, name: "192x192", description: "Android Chrome" },
  { size: 512, name: "512x512", description: "PWA" },
];

// Format conversion options
export const imageFormats = [
  {
    value: "jpeg",
    label: "JPEG",
    description: "Best for photos",
    supportsTransparency: false,
  },
  {
    value: "png",
    label: "PNG",
    description: "Best for graphics with transparency",
    supportsTransparency: true,
  },
  {
    value: "webp",
    label: "WebP",
    description: "Modern format with excellent compression",
    supportsTransparency: true,
  },
];
