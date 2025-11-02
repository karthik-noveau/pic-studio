import { useState, useRef, useCallback, useEffect } from "react";
import {
  Button,
  Tabs,
  Switch,
  message,
  Tag,
  Typography,
  Divider,
  Slider,
  Modal,
} from "antd";
import {
  Upload,
  Link,
  Crop,
  RotateCw,
  Star,
  CornerUpRight,
  Paintbrush,
  Minimize,
  RefreshCw,
  RotateCcw,
  Sparkles,
  Zap,
  Settings,
  Eye,
  X,
  Images,
  Maximize,
} from "lucide-react";
import styles from "./style.module.css";

const { Text } = Typography;

// Import extracted modules
import { faviconSizes, imageFormats } from "../common";
import { commonAspectRatios } from "../common/aspectRatios";
import { analyzeImage, getImageFormat } from "../common/imageAnalysis";
import {
  formatFileSize,
  simplifyRatio,
  getCommonRatioName,
} from "../common/formatters";
import { debounce } from "../common/helpers";

// Import tab components
import UploadTab from "./upload";
import UrlInputTab from "./url-input";
import AnalysisTab from "./tabs/analysis";
import CropTab from "./tabs/crop";
import RotateTab from "./tabs/rotate";
import FaviconTab from "./tabs/favicon";
import BorderRadiusTab from "./tabs/border-radius";
import BackgroundTab from "./tabs/background";
import CompressTab from "./tabs/compress";
import ConvertTab from "./tabs/convert";

export default function AspectRatioCalculator() {
  // Multiple images state
  const [images, setImages] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");

  // Add discard modal state
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Fullscreen modal state
  const [showFullscreenModal, setShowFullscreenModal] = useState(false);
  const [fullscreenImageIndex, setFullscreenImageIndex] = useState(0);

  // Computed active image data
  const imageData = images[activeImageIndex] || null;

  // Computed processed image with all cumulative transformations
  const [processedImageSrc, setProcessedImageSrc] = useState(null);

  // Crop tool states - now per image
  const [cropArea, setCropArea] = useState({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  });
  const [showGrid, setShowGrid] = useState(true);

  // Enhanced crop states
  const [cropInputMode, setCropInputMode] = useState("input");

  // Favicon generator states
  const [selectedFaviconSizes, setSelectedFaviconSizes] = useState([
    16, 32, 48,
  ]);
  const [customFaviconSize, setCustomFaviconSize] = useState("");

  // Border radius editor states
  const [cornerRadius, setCornerRadius] = useState({
    topLeft: 0,
    topRight: 0,
    bottomLeft: 0,
    bottomRight: 0,
  });
  const [uniformRadius, setUniformRadius] = useState(true);

  // Background changer states
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [removeBackground, setRemoveBackground] = useState(false);

  // File size reducer states
  const [compressionQuality, setCompressionQuality] = useState(80);

  // Format conversion states
  const [selectedFormat, setSelectedFormat] = useState("webp");
  const [conversionQuality, setConversionQuality] = useState(85);

  // Add rotation state after other states
  const [rotation, setRotation] = useState(0);

  // Default settings for comparison
  const [defaultSettings, setDefaultSettings] = useState({
    cropArea: { x: 0, y: 0, width: 100, height: 100 },
    cornerRadius: { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 },
    backgroundColor: "#ffffff",
    removeBackground: false,
    compressionQuality: 80,
    selectedFormat: "jpeg",
    conversionQuality: 85,
    rotation: 0,
  });

  // Master settings that apply to all tools
  const [masterSettings, setMasterSettings] = useState({
    applyCrop: false,
    applyBorderRadius: false,
    applyBackground: false,
    applyCompression: false,
    convertFormat: false,
    applyRotation: false,
  });

  // Effect to load settings when active image changes
  useEffect(() => {
    if (imageData && imageData.settings) {
      setCropArea(imageData.settings.cropArea);
      setRotation(imageData.settings.rotation);
      setCornerRadius(imageData.settings.cornerRadius);
      setBackgroundColor(imageData.settings.backgroundColor);
      setRemoveBackground(imageData.settings.removeBackground);
      setCompressionQuality(imageData.settings.compressionQuality);
      setSelectedFormat(imageData.settings.selectedFormat);
      setConversionQuality(imageData.settings.conversionQuality);

      // Only set default cropArea when switching images, not on every imageData change
      setDefaultSettings((prev) => {
        // Check if this is actually a different image (width/height changed)
        const isDifferentImage =
          prev.cropArea.width !== imageData.width ||
          prev.cropArea.height !== imageData.height;

        if (isDifferentImage) {
          return {
            ...prev,
            cropArea: imageData.settings.cropArea,
          };
        }
        return prev;
      });
    }
  }, [activeImageIndex, imageData]);

  // Effect to save settings back to the active image whenever they change
  useEffect(() => {
    if (imageData) {
      setImages((prev) =>
        prev.map((img, idx) => {
          if (idx === activeImageIndex) {
            return {
              ...img,
              settings: {
                cropArea,
                rotation,
                cornerRadius,
                backgroundColor,
                removeBackground,
                compressionQuality,
                selectedFormat,
                conversionQuality,
              },
            };
          }
          return img;
        })
      );
    }
  }, [
    cropArea,
    rotation,
    cornerRadius,
    backgroundColor,
    removeBackground,
    compressionQuality,
    selectedFormat,
    conversionQuality,
  ]);

  // Add localStorage functionality
  const STORAGE_KEY = "image-studio-data";

  // Load from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Only restore if we have a URL to reload the image from
        if (parsed.imageUrl && parsed.timestamp) {
          // Check if data is less than 24 hours old
          const isRecent = Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000;
          if (isRecent) {
            // Reload image from URL
            setImageUrl(parsed.imageUrl);

            // Restore settings if available
            if (parsed.settings) {
              setCropArea(parsed.settings.cropArea || cropArea);
              setCornerRadius(parsed.settings.cornerRadius || cornerRadius);
              setBackgroundColor(
                parsed.settings.backgroundColor || backgroundColor
              );
              setRotation(parsed.settings.rotation || 0);
              if (parsed.settings.compressionQuality) {
                setCompressionQuality(parsed.settings.compressionQuality);
              }
              if (parsed.settings.selectedFormat) {
                setSelectedFormat(parsed.settings.selectedFormat);
              }
            }

            message.success(
              "Previous settings restored. Your last image URL and settings have been restored."
            );
          } else {
            // Data is old, clear it
            localStorage.removeItem(STORAGE_KEY);
          }
        }
      } catch (error) {
        console.error("Error loading from localStorage:", error);
        // If there's an error, clear potentially corrupted data
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Save to localStorage whenever imageData changes
  useEffect(() => {
    if (imageData) {
      try {
        // Don't store the actual image data (too large), only store metadata and settings
        const dataToSave = {
          imageMetadata: {
            width: imageData.width,
            height: imageData.height,
            aspectRatio: imageData.aspectRatio,
            simplifiedRatio: imageData.simplifiedRatio,
            commonName: imageData.commonName,
            fileSize: imageData.fileSize,
            fileName: imageData.fileName,
          },
          imageUrl: imageUrl || null,
          settings: {
            cropArea,
            cornerRadius,
            backgroundColor,
            rotation,
            compressionQuality,
            selectedFormat,
          },
          timestamp: Date.now(),
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      } catch (error) {
        // Handle QuotaExceededError or other localStorage errors
        console.warn("Could not save to localStorage:", error.message);
        // Optionally clear old data and retry
        if (error.name === "QuotaExceededError") {
          try {
            localStorage.removeItem(STORAGE_KEY);
          } catch (e) {
            // If we can't even remove, localStorage might be disabled
            console.warn("localStorage appears to be disabled or full");
          }
        }
      }
    }
  }, [
    imageData,
    imageUrl,
    cropArea,
    cornerRadius,
    backgroundColor,
    rotation,
    compressionQuality,
    selectedFormat,
  ]);

  // Clear localStorage when resetting
  const clearStoredData = () => {
    localStorage.removeItem(STORAGE_KEY);
  };

  const fileInputRef = useRef(null);
  const canvasRef = useRef(null);
  const cropCanvasRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const cropContainerRef = useRef(null);

  // Check if settings have changed from defaults
  const hasSettingsChanged = useCallback(() => {
    const cropChanged =
      cropArea.x !== defaultSettings.cropArea.x ||
      cropArea.y !== defaultSettings.cropArea.y ||
      cropArea.width !== defaultSettings.cropArea.width ||
      cropArea.height !== defaultSettings.cropArea.height;

    const borderChanged =
      cornerRadius.topLeft !== defaultSettings.cornerRadius.topLeft ||
      cornerRadius.topRight !== defaultSettings.cornerRadius.topRight ||
      cornerRadius.bottomLeft !== defaultSettings.cornerRadius.bottomLeft ||
      cornerRadius.bottomRight !== defaultSettings.cornerRadius.bottomRight;

    const backgroundChanged =
      backgroundColor !== defaultSettings.backgroundColor ||
      removeBackground !== defaultSettings.removeBackground;

    const compressionChanged =
      compressionQuality !== defaultSettings.compressionQuality;

    const formatChanged =
      selectedFormat !== defaultSettings.selectedFormat ||
      conversionQuality !== defaultSettings.conversionQuality;

    const rotationChanged = rotation !== defaultSettings.rotation;

    return {
      crop: cropChanged,
      border: borderChanged,
      background: backgroundChanged,
      compression: compressionChanged,
      format: formatChanged,
      rotation: rotationChanged,
    };
  }, [
    cropArea,
    cornerRadius,
    backgroundColor,
    removeBackground,
    compressionQuality,
    selectedFormat,
    conversionQuality,
    rotation,
    defaultSettings,
  ]);

  // Auto-update master settings based on changes
  useEffect(() => {
    const changes = hasSettingsChanged();
    setMasterSettings((prev) => ({
      ...prev,
      applyCrop: changes.crop,
      applyBorderRadius: changes.border,
      applyBackground: changes.background,
      applyCompression: changes.compression,
      convertFormat: changes.format,
      applyRotation: changes.rotation,
    }));
  }, [
    cropArea,
    cornerRadius,
    backgroundColor,
    removeBackground,
    compressionQuality,
    selectedFormat,
    conversionQuality,
    rotation,
    defaultSettings,
    hasSettingsChanged,
  ]);

  // Generate processed image with cumulative transformations for tab sync
  useEffect(() => {
    if (!imageData || !canvasRef.current) {
      setProcessedImageSrc(null);
      return;
    }

    // Check if any transformations are applied
    const hasTransformations =
      masterSettings.applyCrop ||
      masterSettings.applyRotation ||
      masterSettings.applyBackground ||
      masterSettings.applyBorderRadius;

    if (!hasTransformations) {
      // No transformations, use original
      setProcessedImageSrc(imageData.src);
      return;
    }

    // Apply all transformations
    const canvas = canvasRef.current;
    let workingCanvas = document.createElement('canvas');
    let workingCtx = workingCanvas.getContext('2d');

    if (!workingCtx) {
      setProcessedImageSrc(imageData.src);
      return;
    }

    try {
      // Start with original
      workingCanvas.width = canvas.width;
      workingCanvas.height = canvas.height;
      workingCtx.drawImage(canvas, 0, 0);

      // Apply crop
      if (masterSettings.applyCrop) {
        const croppedCanvas = document.createElement('canvas');
        const croppedCtx = croppedCanvas.getContext('2d');
        if (croppedCtx) {
          croppedCanvas.width = cropArea.width;
          croppedCanvas.height = cropArea.height;
          croppedCtx.imageSmoothingEnabled = true;
          croppedCtx.imageSmoothingQuality = 'high';
          croppedCtx.drawImage(
            workingCanvas,
            cropArea.x,
            cropArea.y,
            cropArea.width,
            cropArea.height,
            0,
            0,
            cropArea.width,
            cropArea.height
          );
          workingCanvas = croppedCanvas;
          workingCtx = croppedCtx;
        }
      }

      // Apply rotation
      if (masterSettings.applyRotation && rotation !== 0) {
        const rotatedCanvas = document.createElement('canvas');
        const rotatedCtx = rotatedCanvas.getContext('2d');
        if (rotatedCtx) {
          const angle = (rotation * Math.PI) / 180;
          const cos = Math.abs(Math.cos(angle));
          const sin = Math.abs(Math.sin(angle));
          rotatedCanvas.width = workingCanvas.width * cos + workingCanvas.height * sin;
          rotatedCanvas.height = workingCanvas.width * sin + workingCanvas.height * cos;
          rotatedCtx.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);
          rotatedCtx.rotate(angle);
          rotatedCtx.drawImage(workingCanvas, -workingCanvas.width / 2, -workingCanvas.height / 2);
          workingCanvas = rotatedCanvas;
          workingCtx = rotatedCtx;
        }
      }

      // Apply background
      if (masterSettings.applyBackground) {
        const bgCanvas = document.createElement('canvas');
        const bgCtx = bgCanvas.getContext('2d');
        if (bgCtx) {
          bgCanvas.width = workingCanvas.width;
          bgCanvas.height = workingCanvas.height;
          if (!removeBackground) {
            bgCtx.fillStyle = backgroundColor;
            bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
          }
          bgCtx.drawImage(workingCanvas, 0, 0);
          workingCanvas = bgCanvas;
          workingCtx = bgCtx;
        }
      }

      // Apply border radius
      if (masterSettings.applyBorderRadius) {
        const radiusCanvas = document.createElement('canvas');
        const radiusCtx = radiusCanvas.getContext('2d');
        if (radiusCtx) {
          radiusCanvas.width = workingCanvas.width;
          radiusCanvas.height = workingCanvas.height;
          const { topLeft, topRight, bottomLeft, bottomRight } = cornerRadius;
          const maxRadius = Math.min(workingCanvas.width, workingCanvas.height) * 0.5;
          const tl = (topLeft / 100) * maxRadius;
          const tr = (topRight / 100) * maxRadius;
          const bl = (bottomLeft / 100) * maxRadius;
          const br = (bottomRight / 100) * maxRadius;

          radiusCtx.beginPath();
          radiusCtx.moveTo(tl, 0);
          radiusCtx.lineTo(workingCanvas.width - tr, 0);
          radiusCtx.quadraticCurveTo(workingCanvas.width, 0, workingCanvas.width, tr);
          radiusCtx.lineTo(workingCanvas.width, workingCanvas.height - br);
          radiusCtx.quadraticCurveTo(workingCanvas.width, workingCanvas.height, workingCanvas.width - br, workingCanvas.height);
          radiusCtx.lineTo(bl, workingCanvas.height);
          radiusCtx.quadraticCurveTo(0, workingCanvas.height, 0, workingCanvas.height - bl);
          radiusCtx.lineTo(0, tl);
          radiusCtx.quadraticCurveTo(0, 0, tl, 0);
          radiusCtx.closePath();
          radiusCtx.clip();
          radiusCtx.drawImage(workingCanvas, 0, 0);
          workingCanvas = radiusCanvas;
          workingCtx = radiusCtx;
        }
      }

      // Convert to data URL
      const dataUrl = workingCanvas.toDataURL('image/png');
      setProcessedImageSrc(dataUrl);
    } catch (error) {
      console.error('Error generating processed image:', error);
      setProcessedImageSrc(imageData.src);
    }
  }, [
    imageData,
    masterSettings,
    cropArea,
    rotation,
    backgroundColor,
    removeBackground,
    cornerRadius,
  ]);

  const analyzeImageData = useCallback((img, file) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    ctx.drawImage(img, 0, 0);

    const analysis = analyzeImage(canvas, ctx);
    analysis.format = file ? getImageFormat(file) : "Unknown";

    return analysis;
  }, []);

  const processImage = useCallback(
    (img, src, fileSize, fileName, file) => {
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      const aspectRatio = width / height;
      const simplifiedRatio = simplifyRatio(width, height);
      const commonName = getCommonRatioName(aspectRatio, commonAspectRatios);
      const analysis = analyzeImageData(img, file);

      // Initialize crop area to full image size
      const initialCropArea = {
        x: 0,
        y: 0,
        width: width,
        height: height,
      };

      // Create new image object with its own settings
      const newImage = {
        id: Date.now() + Math.random(),
        src,
        width,
        height,
        aspectRatio,
        simplifiedRatio,
        commonName,
        fileSize,
        fileName,
        analysis,
        source: file ? "upload" : "url", // Track source
        settings: {
          cropArea: initialCropArea,
          rotation: 0,
          cornerRadius: {
            topLeft: 0,
            topRight: 0,
            bottomLeft: 0,
            bottomRight: 0,
          },
          backgroundColor: "#ffffff",
          removeBackground: false,
          compressionQuality: 80,
          selectedFormat: "jpeg",
          conversionQuality: 85,
        },
      };

      return newImage;
    },
    [analyzeImageData]
  );

  // Add discard modal function
  const handleNewImageAction = useCallback(
    (action) => {
      if (imageData) {
        setPendingAction(() => action);
        setShowDiscardModal(true);
      } else {
        action();
      }
    },
    [imageData]
  );

  const handleFileUpload = useCallback(
    (event) => {
      const files = Array.from(event.target.files || []);
      if (files.length === 0) return;

      // Validate all files are images
      const invalidFiles = files.filter(
        (file) => !file.type.startsWith("image/")
      );
      if (invalidFiles.length > 0) {
        message.error("Invalid file type. Please upload only image files.");
        return;
      }

      setIsLoading(true);
      const newImages = [];
      let loadedCount = 0;

      files.forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const newImage = processImage(
              img,
              e.target?.result,
              file.size,
              file.name,
              file
            );
            newImages.push(newImage);
            loadedCount++;

            if (loadedCount === files.length) {
              // All images loaded - ADD to existing images
              setImages((prev) => [...prev, ...newImages]);

              // If this is the first upload, set active index to 0
              // Otherwise keep the current active image
              setActiveImageIndex((prev) => prev);

              setIsLoading(false);
              message.success(
                `${files.length} image${
                  files.length > 1 ? "s" : ""
                } uploaded successfully`
              );

              // Force a re-render to show crop tool
              setTimeout(() => {
                if (cropContainerRef.current) {
                  cropContainerRef.current.style.display = "block";
                }
              }, 100);
            }
          };
          img.onerror = () => {
            loadedCount++;
            if (loadedCount === files.length) {
              setIsLoading(false);
            }
            message.error(`Error loading image: ${file.name}`);
          };
          img.src = e.target?.result;
        };
        reader.readAsDataURL(file);
      });
    },
    [processImage]
  );

  // Handle paste events for copying images from clipboard
  useEffect(() => {
    const handlePaste = async (e) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const imageFiles = [];
      for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            imageFiles.push(file);
          }
        }
      }

      if (imageFiles.length > 0) {
        e.preventDefault();
        setIsLoading(true);
        const newImages = [];
        let loadedCount = 0;

        imageFiles.forEach((file) => {
          const reader = new FileReader();
          reader.onload = (readerEvent) => {
            const img = new Image();
            img.onload = () => {
              const newImage = processImage(
                img,
                readerEvent.target?.result,
                file.size,
                file.name || `pasted-image-${Date.now()}.png`,
                file
              );
              newImages.push(newImage);
              loadedCount++;

              if (loadedCount === imageFiles.length) {
                setImages((prev) => [...prev, ...newImages]);

                if (images.length === 0) {
                  setActiveImageIndex(0);
                }

                setIsLoading(false);
                message.success(
                  `${imageFiles.length} image${
                    imageFiles.length > 1 ? "s" : ""
                  } pasted successfully`
                );
              }
            };
            img.onerror = () => {
              loadedCount++;
              if (loadedCount === imageFiles.length) {
                setIsLoading(false);
                message.error("Failed to load pasted image");
              }
            };
            img.src = readerEvent.target?.result;
          };
          reader.readAsDataURL(file);
        });
      }
    };

    document.addEventListener("paste", handlePaste);
    return () => {
      document.removeEventListener("paste", handlePaste);
    };
  }, [processImage, images.length]);

  const handleUrlSubmit = useCallback(() => {
    const action = async () => {
      if (!imageUrl.trim()) return;

      try {
        new URL(imageUrl);
      } catch {
        message.error("Invalid URL. Please enter a valid image URL.");
        return;
      }

      setIsLoading(true);

      // Helper to load image through fetch and convert to blob
      const loadWithFetch = async (url) => {
        const corsProxies = [
          (u) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
          (u) => `https://cors-anywhere.herokuapp.com/${u}`,
          (u) =>
            `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
        ];

        // Try fetch with each proxy
        for (const proxyFn of corsProxies) {
          try {
            const proxyUrl = proxyFn(url);
            console.log(`Trying fetch with proxy: ${proxyUrl}`);

            const response = await fetch(proxyUrl, {
              method: "GET",
              headers: {
                Accept: "image/*",
              },
            });

            if (!response.ok) {
              console.log(`Proxy returned status: ${response.status}`);
              continue;
            }

            const blob = await response.blob();

            // Convert blob to data URL
            return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = () => {
                const dataUrl = reader.result;

                // Load as image to get dimensions
                const img = new Image();
                img.onload = () => {
                  const estimatedSize = blob.size;
                  resolve({ img, dataUrl, estimatedSize });
                };
                img.onerror = reject;
                img.src = dataUrl;
              };
              reader.onerror = reject;
              reader.readAsDataURL(blob);
            });
          } catch (e) {
            console.log(`Fetch proxy failed:`, e.message);
          }
        }

        throw new Error("All proxy methods failed");
      };

      // Try direct load first (no CORS)
      const tryDirectLoad = () => {
        return new Promise((resolve, reject) => {
          const img = new Image();

          const timeout = setTimeout(() => {
            reject(new Error("TIMEOUT"));
          }, 10000); // 10 second timeout

          img.onload = () => {
            clearTimeout(timeout);

            // Try to use canvas - if it works, CORS is allowed
            try {
              const canvas = document.createElement("canvas");
              canvas.width = img.naturalWidth;
              canvas.height = img.naturalHeight;
              const ctx = canvas.getContext("2d");
              ctx.drawImage(img, 0, 0);
              const dataUrl = canvas.toDataURL("image/png");
              const estimatedSize = Math.round((dataUrl.length * 3) / 4);
              resolve({ img, dataUrl, estimatedSize, method: "direct" });
            } catch (canvasError) {
              // CORS blocked canvas access, need proxy
              reject(new Error("CORS_BLOCKED"));
            }
          };

          img.onerror = () => {
            clearTimeout(timeout);
            reject(new Error("LOAD_FAILED"));
          };

          img.src = imageUrl;
        });
      };

      try {
        let result;
        let method = "direct";

        try {
          // Try direct load first
          result = await tryDirectLoad();
          method = result.method;
        } catch (error) {
          if (
            error.message === "CORS_BLOCKED" ||
            error.message === "LOAD_FAILED"
          ) {
            console.log("Direct load failed, using proxy...");
            message.info("Loading image via proxy server...", 3);

            try {
              result = await loadWithFetch(imageUrl);
              method = "proxy";
            } catch (proxyError) {
              throw new Error(
                'Unable to load image. Please try: 1) Right-click and "Save image as" then upload the file, or 2) Use a different image URL.'
              );
            }
          } else {
            throw error;
          }
        }

        const fileName =
          imageUrl.split("/").pop()?.split("?")[0] || "image-from-url.png";
        const newImage = processImage(
          result.img,
          result.dataUrl,
          result.estimatedSize,
          fileName,
          null
        );

        // Add to images array
        setImages((prev) => [...prev, newImage]);

        // If this is the first image, set it as active
        if (images.length === 0) {
          setActiveImageIndex(0);
        }

        setIsLoading(false);
        if (method === "proxy") {
          message.success("Image loaded via CORS proxy successfully!");
        } else {
          message.success("Image loaded from URL successfully");
        }
        setImageUrl(""); // Clear the URL input
      } catch (error) {
        console.error("URL loading error:", error);
        setIsLoading(false);
        message.error(
          error.message ||
            "Failed to load image from URL. Please check if the URL is correct and the image is accessible."
        );
      }
    };

    action();
  }, [imageUrl, processImage, images.length]);

  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      message.success(`Copied to clipboard: ${text}`);
    });
  }, []);

  // Revert functions
  const revertCrop = useCallback(() => {
    setCropArea(defaultSettings.cropArea);
    message.success(
      "Crop settings reverted. Crop area has been reset to defaults."
    );
  }, [defaultSettings]);

  const revertBorderRadius = useCallback(() => {
    setCornerRadius(defaultSettings.cornerRadius);
    message.success(
      "Border radius reverted. All corner radius values have been reset to 0%."
    );
  }, [defaultSettings]);

  const revertBackground = useCallback(() => {
    setBackgroundColor(defaultSettings.backgroundColor);
    setRemoveBackground(defaultSettings.removeBackground);
    message.success(
      "Background settings reverted. Background color and transparency settings have been reset."
    );
  }, [defaultSettings]);

  const revertCompression = useCallback(() => {
    setCompressionQuality(defaultSettings.compressionQuality);
    message.success(
      "Compression reverted. Compression quality has been reset to 80%."
    );
  }, [defaultSettings]);

  const revertFormat = useCallback(() => {
    setSelectedFormat(defaultSettings.selectedFormat);
    setConversionQuality(defaultSettings.conversionQuality);
    message.success(
      "Format settings reverted. Format and quality settings have been reset."
    );
  }, [defaultSettings]);

  const revertRotation = useCallback(() => {
    setRotation(defaultSettings.rotation);
    message.success("Rotation reverted. Image rotation has been reset to 0°.");
  }, [defaultSettings]);

  // Apply all changes function
  const applyAllChanges = useCallback(
    (includeScale = true) => {
      if (!imageData || !canvasRef.current) return null;

      const canvas = canvasRef.current;
      let workingCanvas = document.createElement("canvas");
      let workingCtx = workingCanvas.getContext("2d");
      if (!workingCtx) return null;

      // Start with original image
      workingCanvas.width = canvas.width;
      workingCanvas.height = canvas.height;
      workingCtx.drawImage(canvas, 0, 0);

      // Step 1: Apply crop if enabled
      if (masterSettings.applyCrop) {
        const croppedCanvas = document.createElement("canvas");
        const croppedCtx = croppedCanvas.getContext("2d");
        if (!croppedCtx) return null;

        const finalWidth = Math.round(cropArea.width);
        const finalHeight = Math.round(cropArea.height);

        croppedCanvas.width = finalWidth;
        croppedCanvas.height = finalHeight;
        croppedCtx.imageSmoothingEnabled = true;
        croppedCtx.imageSmoothingQuality = "high";

        croppedCtx.drawImage(
          workingCanvas,
          cropArea.x,
          cropArea.y,
          cropArea.width,
          cropArea.height,
          0,
          0,
          finalWidth,
          finalHeight
        );

        workingCanvas = croppedCanvas;
        workingCtx = croppedCtx;
      }

      // Step 1.5: Apply rotation if enabled
      if (masterSettings.applyRotation && rotation !== 0) {
        const rotatedCanvas = document.createElement("canvas");
        const rotatedCtx = rotatedCanvas.getContext("2d");
        if (!rotatedCtx) return null;

        const angle = (rotation * Math.PI) / 180;
        const cos = Math.abs(Math.cos(angle));
        const sin = Math.abs(Math.sin(angle));

        rotatedCanvas.width =
          workingCanvas.width * cos + workingCanvas.height * sin;
        rotatedCanvas.height =
          workingCanvas.width * sin + workingCanvas.height * cos;

        rotatedCtx.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);
        rotatedCtx.rotate(angle);
        rotatedCtx.drawImage(
          workingCanvas,
          -workingCanvas.width / 2,
          -workingCanvas.height / 2
        );

        workingCanvas = rotatedCanvas;
        workingCtx = rotatedCtx;
      }

      // Step 2: Apply background changes if enabled
      if (masterSettings.applyBackground) {
        const bgCanvas = document.createElement("canvas");
        const bgCtx = bgCanvas.getContext("2d");
        if (!bgCtx) return null;

        bgCanvas.width = workingCanvas.width;
        bgCanvas.height = workingCanvas.height;

        if (!removeBackground) {
          bgCtx.fillStyle = backgroundColor;
          bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
        }

        bgCtx.drawImage(workingCanvas, 0, 0);
        workingCanvas = bgCanvas;
        workingCtx = bgCtx;
      }

      // Step 3: Apply border radius if enabled
      if (masterSettings.applyBorderRadius) {
        const radiusCanvas = document.createElement("canvas");
        const radiusCtx = radiusCanvas.getContext("2d");
        if (!radiusCtx) return null;

        radiusCanvas.width = workingCanvas.width;
        radiusCanvas.height = workingCanvas.height;

        const { topLeft, topRight, bottomLeft, bottomRight } = cornerRadius;
        const maxRadius =
          Math.min(workingCanvas.width, workingCanvas.height) * 0.5;

        const tl = (topLeft / 100) * maxRadius;
        const tr = (topRight / 100) * maxRadius;
        const bl = (bottomLeft / 100) * maxRadius;
        const br = (bottomRight / 100) * maxRadius;

        radiusCtx.beginPath();
        radiusCtx.moveTo(tl, 0);
        radiusCtx.lineTo(workingCanvas.width - tr, 0);
        radiusCtx.quadraticCurveTo(
          workingCanvas.width,
          0,
          workingCanvas.width,
          tr
        );
        radiusCtx.lineTo(workingCanvas.width, workingCanvas.height - br);
        radiusCtx.quadraticCurveTo(
          workingCanvas.width,
          workingCanvas.height,
          workingCanvas.width - br,
          workingCanvas.height
        );
        radiusCtx.lineTo(bl, workingCanvas.height);
        radiusCtx.quadraticCurveTo(
          0,
          workingCanvas.height,
          0,
          workingCanvas.height - bl
        );
        radiusCtx.lineTo(0, tl);
        radiusCtx.quadraticCurveTo(0, 0, tl, 0);
        radiusCtx.closePath();
        radiusCtx.clip();

        radiusCtx.drawImage(workingCanvas, 0, 0);
        workingCanvas = radiusCanvas;
        workingCtx = radiusCtx;
      }

      return workingCanvas;
    },
    [
      imageData,
      masterSettings,
      cropArea,
      backgroundColor,
      removeBackground,
      cornerRadius,
      rotation,
    ]
  );

  // Master export function - now handles batch export
  const exportWithAllChanges = useCallback(() => {
    if (images.length === 0) return;

    setIsDownloading(true);
    // Show progress message for multiple images
    if (images.length > 1) {
      message.info(`Exporting ${images.length} images...`);
    }

    let exportedCount = 0;

    images.forEach((image, index) => {
      // Temporarily set the active image to process
      const savedActiveIndex = activeImageIndex;

      // We need to process each image with its own settings
      setTimeout(() => {
        const processedCanvas = applyAllChanges();
        if (!processedCanvas) return;

        // Apply format conversion and compression
        let mimeType = "image/png";
        let extension = "png";
        let quality = 0.9;

        if (masterSettings.convertFormat) {
          mimeType =
            image.settings.selectedFormat === "jpeg"
              ? "image/jpeg"
              : `image/${image.settings.selectedFormat}`;
          extension =
            image.settings.selectedFormat === "jpeg"
              ? "jpg"
              : image.settings.selectedFormat;
        }

        if (masterSettings.applyCompression) {
          quality = image.settings.compressionQuality / 100;
        }

        const dataUrl = processedCanvas.toDataURL(mimeType, quality);

        // Generate descriptive filename with image number
        const changes = [];
        if (masterSettings.applyCrop) changes.push("cropped");
        if (masterSettings.applyBorderRadius) changes.push("rounded");
        if (masterSettings.applyBackground) changes.push("bg-changed");
        if (masterSettings.applyCompression)
          changes.push(`${image.settings.compressionQuality}q`);
        if (masterSettings.convertFormat)
          changes.push(image.settings.selectedFormat);
        if (masterSettings.applyRotation)
          changes.push(`rotated-${image.settings.rotation}deg`);

        const changesStr = changes.length > 0 ? `-${changes.join("-")}` : "";
        const imageNumber = images.length > 1 ? `-${index + 1}` : "";
        const filename = `processed${imageNumber}${changesStr}-${
          image.fileName || "image"
        }.${extension}`;

        downloadImage(dataUrl, filename);

        exportedCount++;

        if (exportedCount === images.length) {
          if (images.length > 1) {
            message.success(
              `All ${images.length} images exported successfully!`
            );
          } else {
            message.success(
              `Image exported successfully! Downloaded ${processedCanvas.width}×${processedCanvas.height}px image with ${changes.length} modifications.`
            );
          }
          setIsDownloading(false);
        }
      }, index * 100); // Stagger exports slightly
    });
  }, [images, activeImageIndex, applyAllChanges, masterSettings]);

  // Crop functionality
  const applyCrop = useCallback(() => {
    if (!imageData || !canvasRef.current || !cropCanvasRef.current) return;

    setIsDownloading(true);

    // Use setTimeout to allow React to render the loading state
    setTimeout(() => {
      try {
        const canvas = canvasRef.current;
        const cropCanvas = cropCanvasRef.current;
        const ctx = cropCanvas.getContext("2d");
        if (!ctx) return;

        const finalWidth = Math.round(cropArea.width);
        const finalHeight = Math.round(cropArea.height);

        cropCanvas.width = finalWidth;
        cropCanvas.height = finalHeight;

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";

        ctx.drawImage(
          canvas,
          cropArea.x,
          cropArea.y,
          cropArea.width,
          cropArea.height,
          0,
          0,
          finalWidth,
          finalHeight
        );

        const croppedDataUrl = cropCanvas.toDataURL("image/png");
        downloadImage(
          croppedDataUrl,
          `cropped-${finalWidth}x${finalHeight}-${
            imageData.fileName || "image"
          }.png`
        );

        message.success(
          `Image cropped successfully. Downloaded ${finalWidth}×${finalHeight}px cropped image.`
        );
      } finally {
        setIsDownloading(false);
      }
    }, 100);
  }, [imageData, cropArea]);

  // Favicon generation
  const generateFavicons = useCallback(() => {
    setIsDownloading(true);

    // Use setTimeout to allow React to render the loading state
    setTimeout(() => {
      try {
        selectedFaviconSizes.forEach((size) => {
          // Get processed canvas with all current settings
          const processedCanvas = applyAllChanges(false); // Don't apply scale for favicons
          if (!processedCanvas) return;

          const faviconCanvas = document.createElement("canvas");
          const ctx = faviconCanvas.getContext("2d");
          if (!ctx) return;

          faviconCanvas.width = size;
          faviconCanvas.height = size;

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";

          // Scale the processed image to fit favicon size
          const minDimension = Math.min(
            processedCanvas.width,
            processedCanvas.height
          );
          const offsetX = (processedCanvas.width - minDimension) / 2;
          const offsetY = (processedCanvas.height - minDimension) / 2;

          ctx.drawImage(
            processedCanvas,
            offsetX,
            offsetY,
            minDimension,
            minDimension,
            0,
            0,
            size,
            size
          );

          const dataUrl = faviconCanvas.toDataURL("image/png");

          // Generate descriptive favicon filename
          const changes = [];
          if (masterSettings.applyCrop) changes.push("cropped");
          if (masterSettings.applyBorderRadius) changes.push("rounded");
          if (masterSettings.applyBackground) changes.push("bg");
          const changesStr = changes.length > 0 ? `-${changes.join("-")}` : "";

          downloadImage(dataUrl, `favicon${changesStr}-${size}x${size}.png`);
        });

        message.success(
          `Favicons generated with all settings! Generated ${selectedFaviconSizes.length} favicon sizes with current settings.`
        );
      } finally {
        setIsDownloading(false);
      }
    }, 100);
  }, [selectedFaviconSizes, applyAllChanges, masterSettings]);

  // Border radius
  const applyBorderRadius = useCallback(() => {
    if (!imageData || !canvasRef.current || !previewCanvasRef.current) return;

    setIsDownloading(true);

    // Use setTimeout to allow React to render the loading state
    setTimeout(() => {
      try {
        const canvas = canvasRef.current;
        const previewCanvas = previewCanvasRef.current;
        const ctx = previewCanvas.getContext("2d");
        if (!ctx) return;

        previewCanvas.width = canvas.width;
        previewCanvas.height = canvas.height;

        const { topLeft, topRight, bottomLeft, bottomRight } = cornerRadius;
        const maxRadius = Math.min(canvas.width, canvas.height) * 0.5;

        const tl = (topLeft / 100) * maxRadius;
        const tr = (topRight / 100) * maxRadius;
        const bl = (bottomLeft / 100) * maxRadius;
        const br = (bottomRight / 100) * maxRadius;

        ctx.beginPath();
        ctx.moveTo(tl, 0);
        ctx.lineTo(canvas.width - tr, 0);
        ctx.quadraticCurveTo(canvas.width, 0, canvas.width, tr);
        ctx.lineTo(canvas.width, canvas.height - br);
        ctx.quadraticCurveTo(
          canvas.width,
          canvas.height,
          canvas.width - br,
          canvas.height
        );
        ctx.lineTo(bl, canvas.height);
        ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - bl);
        ctx.lineTo(0, tl);
        ctx.quadraticCurveTo(0, 0, tl, 0);
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(canvas, 0, 0);

        const dataUrl = previewCanvas.toDataURL("image/png");
        downloadImage(dataUrl, `rounded-${imageData.fileName || "image"}.png`);

        message.success(
          "Border radius applied. Rounded image downloaded successfully."
        );
      } finally {
        setIsDownloading(false);
      }
    }, 100);
  }, [imageData, cornerRadius]);

  // Background changer
  const changeBackground = useCallback(() => {
    if (!imageData || !canvasRef.current || !previewCanvasRef.current) return;

    setIsDownloading(true);

    // Use setTimeout to allow React to render the loading state
    setTimeout(() => {
      try {
        const canvas = canvasRef.current;
        const previewCanvas = previewCanvasRef.current;
        const ctx = previewCanvas.getContext("2d");
        if (!ctx) return;

        previewCanvas.width = canvas.width;
        previewCanvas.height = canvas.height;

        if (!removeBackground) {
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        ctx.drawImage(canvas, 0, 0);

        const format = removeBackground ? "image/png" : "image/jpeg";
        const dataUrl = previewCanvas.toDataURL(format, 0.9);
        const extension = removeBackground ? "png" : "jpg";
        downloadImage(
          dataUrl,
          `background-changed-${imageData.fileName || "image"}.${extension}`
        );

        message.success(
          "Background changed. Image with new background downloaded successfully."
        );
      } finally {
        setIsDownloading(false);
      }
    }, 100);
  }, [imageData, backgroundColor, removeBackground]);

  // File size reducer
  const reduceFileSize = useCallback(() => {
    if (!imageData || !canvasRef.current) return;

    setIsDownloading(true);

    // Use setTimeout to allow React to render the loading state
    setTimeout(() => {
      try {
        const canvas = canvasRef.current;
        const quality = compressionQuality / 100;

        const formats = [
          { type: "image/jpeg", ext: "jpg", quality: quality },
          { type: "image/webp", ext: "webp", quality: quality },
        ];

        let bestResult = {
          dataUrl: "",
          size: Number.POSITIVE_INFINITY,
          format: "",
          quality: 0,
        };

        formats.forEach(({ type, ext, quality: q }) => {
          try {
            const dataUrl = canvas.toDataURL(type, q);
            const size = Math.round((dataUrl.length * 3) / 4);

            if (size < bestResult.size) {
              bestResult = {
                dataUrl,
                size,
                format: ext,
                quality: compressionQuality,
              };
            }
          } catch (error) {
            console.log(`Format ${type} not supported`);
          }
        });

        const compressionRatio = imageData.fileSize
          ? ((imageData.fileSize - bestResult.size) / imageData.fileSize) * 100
          : 0;

        // Update the image with compressed size
        setImages((prev) =>
          prev.map((img, idx) => {
            if (idx === activeImageIndex) {
              return {
                ...img,
                compressedSize: bestResult.size,
                compressionRatio: compressionRatio,
              };
            }
            return img;
          })
        );

        downloadImage(
          bestResult.dataUrl,
          `compressed-${compressionQuality}q-${imageData.fileName || "image"}.${
            bestResult.format
          }`
        );

        message.success(
          `File compressed. Reduced by ${compressionRatio.toFixed(
            1
          )}% to ${formatFileSize(bestResult.size)}`
        );
      } finally {
        setIsDownloading(false);
      }
    }, 100);
  }, [imageData, compressionQuality, activeImageIndex]);

  // Format conversion
  const convertFormat = useCallback(() => {
    if (!imageData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const fileName = imageData.fileName?.split(".")[0] || "image";

    setIsDownloading(true);

    // Use setTimeout to allow React to render the loading state
    setTimeout(() => {
      try {
        // Handle raster formats (PNG, JPEG, WebP)
        let mimeType = `image/${selectedFormat}`;
        let extension = selectedFormat;

        if (selectedFormat === "jpeg") {
          mimeType = "image/jpeg";
          extension = "jpg";
        }

        const dataUrl = canvas.toDataURL(mimeType, 0.9);
        downloadImage(dataUrl, `converted-${fileName}.${extension}`);

        message.success(
          `Format converted. Successfully converted to ${selectedFormat.toUpperCase()}`
        );
      } catch (error) {
        console.error("Conversion error:", error);
        message.error(
          `Conversion failed. ${selectedFormat.toUpperCase()} format conversion encountered an error`
        );
      } finally {
        setIsDownloading(false);
      }
    }, 100);
  }, [imageData, selectedFormat]);

  const downloadImage = (dataUrl, filename) => {
    const link = document.createElement("a");
    link.download = filename;
    link.href = dataUrl;
    link.click();
  };

  const resetAllSettings = useCallback(() => {
    setCropArea(defaultSettings.cropArea);
    setCornerRadius(defaultSettings.cornerRadius);
    setBackgroundColor(defaultSettings.backgroundColor);
    setRemoveBackground(defaultSettings.removeBackground);
    setCompressionQuality(defaultSettings.compressionQuality);
    setSelectedFormat(defaultSettings.selectedFormat);
    setConversionQuality(defaultSettings.conversionQuality);
    setRotation(defaultSettings.rotation);
    setMasterSettings({
      applyCrop: false,
      applyBorderRadius: false,
      applyBackground: false,
      applyCompression: false,
      convertFormat: false,
      applyRotation: false,
    });
    message.success(
      "All settings reset. All modifications have been reverted to defaults."
    );
  }, [defaultSettings]);

  const resetCalculator = () => {
    setImages([]);
    setActiveImageIndex(0);
    setImageUrl("");
    resetAllSettings();
    clearStoredData();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Add debounced slider handlers
  const debouncedSetRotation = useCallback(
    debounce((value) => setRotation(value), 100),
    []
  );

  const debouncedSetCompressionQuality = useCallback(
    debounce((value) => setCompressionQuality(value), 100),
    []
  );

  // Delete image function
  const deleteImage = useCallback(
    (indexToDelete) => {
      setImages((prev) => {
        const newImages = prev.filter((_, idx) => idx !== indexToDelete);

        // Adjust active index if needed
        if (newImages.length === 0) {
          setActiveImageIndex(0);
        } else if (indexToDelete === activeImageIndex) {
          // If deleting active image, switch to previous or first
          setActiveImageIndex(Math.max(0, activeImageIndex - 1));
        } else if (indexToDelete < activeImageIndex) {
          // If deleting before active, adjust index
          setActiveImageIndex(activeImageIndex - 1);
        }

        return newImages;
      });
      message.success("Image deleted successfully");
    },
    [activeImageIndex]
  );

  // Switch active image function
  const switchToImage = useCallback(
    (index) => {
      if (index >= 0 && index < images.length) {
        setActiveImageIndex(index);
      }
    },
    [images.length]
  );

  // Open fullscreen modal for active image
  const openFullscreen = useCallback(
    (imageIndex = activeImageIndex) => {
      setFullscreenImageIndex(imageIndex);
      setShowFullscreenModal(true);
    },
    [activeImageIndex]
  );

  return (
    <div className={styles.appContainer}>
      <div className={styles.maxWidthContainer}>
        <div className={styles.spaceY8}>
          <canvas ref={canvasRef} className={styles.hiddenCanvas} />
          <canvas ref={cropCanvasRef} className={styles.hiddenCanvas} />
          <canvas ref={previewCanvasRef} className={styles.hiddenCanvas} />

          {/* Hidden file input for Add More button */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={(e) => {
              handleFileUpload(e);
              // Reset the input value
              if (fileInputRef.current) {
                fileInputRef.current.value = "";
              }
            }}
            style={{ display: "none" }}
          />

          {/* Modern Header */}
          <div className={styles.headerSection}>
            <div className={styles.headerInner}>
              <div className={styles.iconContainer}>
                <Sparkles
                  style={{ width: "2rem", height: "2rem", color: "white" }}
                />
              </div>
              <div className={styles.headerTextContainer}>
                <h1 className={styles.headerTitle}>Advanced Image Studio</h1>
                <p className={styles.headerSubtitle}>
                  Professional-grade image processing & optimization
                </p>
              </div>
            </div>
          </div>

          {/* Modern Input Card */}
          <div className={styles.uploadCard}>
            <div className={styles.cardHeader}>
              <div className={styles.uploadCardHeader}>
                <div className={styles.uploadIconContainer}>
                  <Upload
                    style={{
                      width: "1.25rem",
                      height: "1.25rem",
                      color: "#2563eb",
                    }}
                  />
                </div>
                <div className={styles.uploadHeaderText}>
                  <div>Image Input</div>
                  <div className={styles.uploadHeaderSubtitle}>
                    Choose your preferred method to upload your image
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.cardContent}>
              <Tabs
                activeKey={activeTab}
                onChange={setActiveTab}
                items={[
                  {
                    key: "upload",
                    label: (
                      <span className={styles.tabLabel}>
                        <Upload style={{ width: "1rem", height: "1rem" }} />
                        Upload File
                      </span>
                    ),
                    children: (
                      <UploadTab
                        handleFileUpload={handleFileUpload}
                        fileInputRef={fileInputRef}
                      />
                    ),
                  },
                  {
                    key: "url",
                    label: (
                      <span className={styles.tabLabel}>
                        <Link style={{ width: "1rem", height: "1rem" }} />
                        From URL
                      </span>
                    ),
                    children: (
                      <UrlInputTab
                        imageUrl={imageUrl}
                        setImageUrl={setImageUrl}
                        handleUrlSubmit={handleUrlSubmit}
                        isLoading={isLoading}
                      />
                    ),
                  },
                ]}
              />
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className={styles.loadingCard}>
              <div className={styles.loadingContent}>
                <div className={styles.loadingInner}>
                  <div className={styles.spinner} />
                  <div className={styles.loadingTextContainer}>
                    <p className={styles.loadingPrimaryText}>
                      Processing your image...
                    </p>
                    <p className={styles.loadingSecondaryText}>
                      Analyzing with advanced algorithms
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Image Gallery */}
          {images.length > 0 && (
            <div className={styles.galleryCard}>
              <div className={styles.cardHeader}>
                <div className={styles.galleryCardHeader}>
                  <div className={styles.galleryIconContainer}>
                    <Images
                      style={{
                        width: "1.25rem",
                        height: "1.25rem",
                        color: "#2563eb",
                      }}
                    />
                  </div>
                  <div className={styles.galleryHeaderText}>
                    <div>Image Gallery</div>
                    <div className={styles.galleryHeaderSubtitle}>
                      {images.length} image{images.length > 1 ? "s" : ""} loaded
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.cardContent}>
              <div className={styles.imageGalleryContainer}>
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className={`${styles.thumbnailWrapper} ${
                      index === activeImageIndex ? styles.thumbnailActive : ""
                    } ${image.source === "url" ? styles.thumbnailFromUrl : ""}`}
                    onClick={() => switchToImage(index)}
                  >
                    <div className={styles.thumbnailImageContainer}>
                      <div className={styles.imageWithFullscreen}>
                        <img
                          src={image.src}
                          alt={image.fileName}
                          className={styles.thumbnailImage}
                        />
                        <div
                          className={styles.fullscreenOverlay}
                          onClick={(e) => {
                            e.stopPropagation();
                            setFullscreenImageIndex(index);
                            setShowFullscreenModal(true);
                          }}
                        >
                          <Maximize className={styles.fullscreenIcon} />
                        </div>
                      </div>
                      {index === activeImageIndex && (
                        <div className={styles.activeBadge}>
                          <Eye
                            style={{ width: "0.75rem", height: "0.75rem" }}
                          />
                        </div>
                      )}
                      {image.source === "url" && (
                        <div className={styles.urlBadge}>
                          <Link
                            style={{ width: "0.65rem", height: "0.65rem" }}
                          />
                        </div>
                      )}
                    </div>
                    <button
                      className={styles.deleteButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteImage(index);
                      }}
                      aria-label="Delete image"
                    >
                      <X style={{ width: "0.875rem", height: "0.875rem" }} />
                    </button>
                    <div className={styles.thumbnailInfo}>
                      <div className={styles.thumbnailFileName}>
                        {image.fileName}
                      </div>
                      <div className={styles.thumbnailDimensions}>
                        {image.width}×{image.height}
                      </div>
                      <div className={styles.thumbnailFileSize}>
                        {formatFileSize(image.fileSize)}
                      </div>
                      {image.compressedSize && (
                        <div className={styles.thumbnailCompressedSize}>
                          Compressed: {formatFileSize(image.compressedSize)}
                          <span className={styles.compressionBadge}>
                            -{Math.round(image.compressionRatio)}%
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}

                {/* Add More Images Button */}
                <div
                  className={styles.addMoreButton}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (fileInputRef.current) {
                      fileInputRef.current.click();
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      if (fileInputRef.current) {
                        fileInputRef.current.click();
                      }
                    }
                  }}
                >
                  <div className={styles.addMoreIcon}>
                    <Upload style={{ width: "2rem", height: "2rem" }} />
                  </div>
                  <div className={styles.addMoreText}>Add More</div>
                </div>
              </div>
              </div>
            </div>
          )}

          {/* Master Control Panel */}
          {imageData && (
            <div className={styles.masterCard}>
              <div className={styles.cardHeader}>
                <div className={styles.masterCardHeader}>
                  <div className={styles.masterIconContainer}>
                    <Settings style={{ width: "1.5rem", height: "1.5rem" }} />
                  </div>
                  <div className={styles.masterHeaderTextContainer}>
                    <div className={styles.masterHeaderTitle}>
                      <span>Master Control Panel</span>
                      <Tag className={styles.masterTag}>
                        Smart Auto-Detection
                      </Tag>
                    </div>
                    <div className={styles.masterHeaderSubtitle}>
                      Automatically detects changes and applies them to all
                      exports
                    </div>
                  </div>
                </div>
              </div>
              <div className={styles.cardContent}>
              <div className={styles.masterGrid}>
                <div className={styles.masterControlItem}>
                  <div className={styles.masterControlContent}>
                    <Crop style={{ width: "1.25rem", height: "1.25rem" }} />
                    <div className={styles.masterControlTextContainer}>
                      <Text strong className={styles.masterControlLabel}>
                        Crop Tool
                      </Text>
                      <div className={styles.masterControlValue}>
                        {Math.round(cropArea.width)}×
                        {Math.round(cropArea.height)}px
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={masterSettings.applyCrop}
                    onChange={(checked) =>
                      setMasterSettings({
                        ...masterSettings,
                        applyCrop: checked,
                      })
                    }
                  />
                </div>

                <div className={styles.masterControlItem}>
                  <div className={styles.masterControlContent}>
                    <RotateCw style={{ width: "1.25rem", height: "1.25rem" }} />
                    <div className={styles.masterControlTextContainer}>
                      <Text strong className={styles.masterControlLabel}>
                        Rotation
                      </Text>
                      <div className={styles.masterControlValue}>
                        {rotation}°
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={masterSettings.applyRotation}
                    onChange={(checked) =>
                      setMasterSettings({
                        ...masterSettings,
                        applyRotation: checked,
                      })
                    }
                  />
                </div>

                <div className={styles.masterControlItem}>
                  <div className={styles.masterControlContent}>
                    <CornerUpRight
                      style={{ width: "1.25rem", height: "1.25rem" }}
                    />
                    <div className={styles.masterControlTextContainer}>
                      <Text strong className={styles.masterControlLabel}>
                        Border Radius
                      </Text>
                      <div className={styles.masterControlValue}>
                        {Math.max(
                          cornerRadius.topLeft,
                          cornerRadius.topRight,
                          cornerRadius.bottomLeft,
                          cornerRadius.bottomRight
                        )}
                        % max
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={masterSettings.applyBorderRadius}
                    onChange={(checked) =>
                      setMasterSettings({
                        ...masterSettings,
                        applyBorderRadius: checked,
                      })
                    }
                  />
                </div>

                <div className={styles.masterControlItem}>
                  <div className={styles.masterControlContent}>
                    <Paintbrush
                      style={{ width: "1.25rem", height: "1.25rem" }}
                    />
                    <div className={styles.masterControlTextContainer}>
                      <Text strong className={styles.masterControlLabel}>
                        Background
                      </Text>
                      <div className={styles.masterControlValue}>
                        {removeBackground ? "Transparent" : backgroundColor}
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={masterSettings.applyBackground}
                    onChange={(checked) =>
                      setMasterSettings({
                        ...masterSettings,
                        applyBackground: checked,
                      })
                    }
                  />
                </div>

                <div className={styles.masterControlItem}>
                  <div className={styles.masterControlContent}>
                    <Minimize style={{ width: "1.25rem", height: "1.25rem" }} />
                    <div className={styles.masterControlTextContainer}>
                      <Text strong className={styles.masterControlLabel}>
                        Compression
                      </Text>
                      <div className={styles.masterControlValue}>
                        {compressionQuality}% quality
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={masterSettings.applyCompression}
                    onChange={(checked) =>
                      setMasterSettings({
                        ...masterSettings,
                        applyCompression: checked,
                      })
                    }
                  />
                </div>

                <div className={styles.masterControlItem}>
                  <div className={styles.masterControlContent}>
                    <RefreshCw
                      style={{ width: "1.25rem", height: "1.25rem" }}
                    />
                    <div className={styles.masterControlTextContainer}>
                      <Text strong className={styles.masterControlLabel}>
                        Format
                      </Text>
                      <div className={styles.masterControlValue}>
                        To {selectedFormat.toUpperCase()}
                      </div>
                    </div>
                  </div>
                  <Switch
                    checked={masterSettings.convertFormat}
                    onChange={(checked) =>
                      setMasterSettings({
                        ...masterSettings,
                        convertFormat: checked,
                      })
                    }
                  />
                </div>
              </div>

              <Divider className={styles.masterDivider} />

              <div className={styles.masterButtonContainer}>
                <Button
                  onClick={exportWithAllChanges}
                  type="primary"
                  className={styles.exportButton}
                  loading={isDownloading}
                  icon={<Zap style={{ width: "1rem", height: "1rem" }} />}
                >
                  Export with All Changes
                  <Tag className={styles.exportButtonTag}>
                    {Object.values(masterSettings).filter(Boolean).length}{" "}
                    active
                  </Tag>
                </Button>

                <Button
                  onClick={resetAllSettings}
                  className={styles.resetButton}
                  icon={<RotateCcw style={{ width: "1rem", height: "1rem" }} />}
                >
                  Reset All Settings
                </Button>
              </div>
              </div>
            </div>
          )}

          {imageData && (
            <div className={styles.tabsContainer}>
              {/* Modern Tools Tabs */}
              <Tabs
                defaultActiveKey="analysis"
                items={[
                  {
                    key: "analysis",
                    label: (
                      <span className={styles.toolTabLabel}>
                        <Eye style={{ width: "1rem", height: "1rem" }} />
                        Analysis
                      </span>
                    ),
                    children: (
                      <AnalysisTab
                        imageData={imageData}
                        processedImageSrc={processedImageSrc}
                        formatFileSize={formatFileSize}
                        copyToClipboard={copyToClipboard}
                        copied={copied}
                        openFullscreen={openFullscreen}
                      />
                    ),
                  },
                  {
                    key: "crop",
                    label: (
                      <span className={styles.toolTabLabel}>
                        <Crop style={{ width: "1rem", height: "1rem" }} />
                        Crop
                      </span>
                    ),
                    children: (
                      <CropTab
                        imageData={imageData}
                        cropArea={cropArea}
                        setCropArea={setCropArea}
                        showGrid={showGrid}
                        setShowGrid={setShowGrid}
                        cropInputMode={cropInputMode}
                        setCropInputMode={setCropInputMode}
                        simplifyRatio={simplifyRatio}
                        applyCrop={applyCrop}
                        hasSettingsChanged={hasSettingsChanged}
                        revertCrop={revertCrop}
                        cropContainerRef={cropContainerRef}
                        commonAspectRatios={commonAspectRatios}
                        isDownloading={isDownloading}
                      />
                    ),
                  },
                  {
                    key: "rotate",
                    label: (
                      <span className={styles.toolTabLabel}>
                        <RotateCw style={{ width: "1rem", height: "1rem" }} />
                        Rotate
                      </span>
                    ),
                    children: (
                      <RotateTab
                        imageData={imageData}
                        processedImageSrc={processedImageSrc}
                        rotation={rotation}
                        setRotation={setRotation}
                        debouncedSetRotation={debouncedSetRotation}
                        applyAllChanges={applyAllChanges}
                        downloadImage={downloadImage}
                        hasSettingsChanged={hasSettingsChanged}
                        revertRotation={revertRotation}
                        openFullscreen={openFullscreen}
                        isDownloading={isDownloading}
                      />
                    ),
                  },
                  {
                    key: "favicon",
                    label: (
                      <span className={styles.toolTabLabel}>
                        <Star style={{ width: "1rem", height: "1rem" }} />
                        Favicon
                      </span>
                    ),
                    children: (
                      <FaviconTab
                        imageData={imageData}
                        processedImageSrc={processedImageSrc}
                        faviconSizes={faviconSizes}
                        selectedFaviconSizes={selectedFaviconSizes}
                        setSelectedFaviconSizes={setSelectedFaviconSizes}
                        customFaviconSize={customFaviconSize}
                        setCustomFaviconSize={setCustomFaviconSize}
                        generateFavicons={generateFavicons}
                        isDownloading={isDownloading}
                      />
                    ),
                  },
                  {
                    key: "border",
                    label: (
                      <span className={styles.toolTabLabel}>
                        <CornerUpRight
                          style={{ width: "1rem", height: "1rem" }}
                        />
                        Border
                      </span>
                    ),
                    children: (
                      <BorderRadiusTab
                        imageData={imageData}
                        processedImageSrc={processedImageSrc}
                        cornerRadius={cornerRadius}
                        setCornerRadius={setCornerRadius}
                        uniformRadius={uniformRadius}
                        setUniformRadius={setUniformRadius}
                        applyBorderRadius={applyBorderRadius}
                        hasSettingsChanged={hasSettingsChanged}
                        revertBorderRadius={revertBorderRadius}
                        openFullscreen={openFullscreen}
                        isDownloading={isDownloading}
                      />
                    ),
                  },
                  {
                    key: "background",
                    label: (
                      <span className={styles.toolTabLabel}>
                        <Paintbrush style={{ width: "1rem", height: "1rem" }} />
                        Background
                      </span>
                    ),
                    children: (
                      <BackgroundTab
                        imageData={imageData}
                        processedImageSrc={processedImageSrc}
                        backgroundColor={backgroundColor}
                        setBackgroundColor={setBackgroundColor}
                        removeBackground={removeBackground}
                        setRemoveBackground={setRemoveBackground}
                        changeBackground={changeBackground}
                        hasSettingsChanged={hasSettingsChanged}
                        revertBackground={revertBackground}
                        openFullscreen={openFullscreen}
                        isDownloading={isDownloading}
                      />
                    ),
                  },
                  {
                    key: "compress",
                    label: (
                      <span className={styles.toolTabLabel}>
                        <Minimize style={{ width: "1rem", height: "1rem" }} />
                        Compress
                      </span>
                    ),
                    children: (
                      <CompressTab
                        imageData={imageData}
                        processedImageSrc={processedImageSrc}
                        compressionQuality={compressionQuality}
                        setCompressionQuality={setCompressionQuality}
                        debouncedSetCompressionQuality={
                          debouncedSetCompressionQuality
                        }
                        formatFileSize={formatFileSize}
                        reduceFileSize={reduceFileSize}
                        hasSettingsChanged={hasSettingsChanged}
                        revertCompression={revertCompression}
                        openFullscreen={openFullscreen}
                        isDownloading={isDownloading}
                      />
                    ),
                  },
                  {
                    key: "convert",
                    label: (
                      <span className={styles.toolTabLabel}>
                        <RefreshCw style={{ width: "1rem", height: "1rem" }} />
                        Convert
                      </span>
                    ),
                    children: (
                      <ConvertTab
                        imageData={imageData}
                        processedImageSrc={processedImageSrc}
                        selectedFormat={selectedFormat}
                        setSelectedFormat={setSelectedFormat}
                        imageFormats={imageFormats}
                        convertFormat={convertFormat}
                        hasSettingsChanged={hasSettingsChanged}
                        revertFormat={revertFormat}
                        isDownloading={isDownloading}
                      />
                    ),
                  },
                ]}
              />
            </div>
          )}

          {/* Fullscreen Image Modal */}
          <Modal
            open={showFullscreenModal}
            onCancel={() => setShowFullscreenModal(false)}
            footer={null}
            centered
            width="95vw"
            styles={{
              body: {
                padding: 0,
                height: "90vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: "#000",
              },
            }}
            closeIcon={
              <X style={{ color: "white", width: "24px", height: "24px" }} />
            }
          >
            {images[fullscreenImageIndex] && (
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "1rem",
                }}
              >
                <img
                  src={images[fullscreenImageIndex].src}
                  alt={images[fullscreenImageIndex].fileName}
                  style={{
                    maxWidth: "100%",
                    maxHeight: "calc(90vh - 100px)",
                    objectFit: "contain",
                  }}
                />
                <div
                  style={{
                    color: "white",
                    textAlign: "center",
                    padding: "1rem",
                    backgroundColor: "rgba(0, 0, 0, 0.7)",
                    borderRadius: "8px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "18px",
                      fontWeight: 600,
                      marginBottom: "8px",
                    }}
                  >
                    {images[fullscreenImageIndex].fileName}
                  </div>
                  <div style={{ fontSize: "14px", opacity: 0.9 }}>
                    {images[fullscreenImageIndex].width} ×{" "}
                    {images[fullscreenImageIndex].height}px
                    {" • "}
                    {formatFileSize(images[fullscreenImageIndex].fileSize)}
                  </div>
                </div>
                {images.length > 1 && (
                  <div
                    style={{
                      display: "flex",
                      gap: "1rem",
                      position: "absolute",
                      bottom: "2rem",
                      left: "50%",
                      transform: "translateX(-50%)",
                    }}
                  >
                    <Button
                      onClick={() => {
                        const prevIndex =
                          fullscreenImageIndex === 0
                            ? images.length - 1
                            : fullscreenImageIndex - 1;
                        setFullscreenImageIndex(prevIndex);
                      }}
                      size="large"
                    >
                      ← Previous
                    </Button>
                    <Button
                      onClick={() => {
                        const nextIndex =
                          fullscreenImageIndex === images.length - 1
                            ? 0
                            : fullscreenImageIndex + 1;
                        setFullscreenImageIndex(nextIndex);
                      }}
                      size="large"
                    >
                      Next →
                    </Button>
                  </div>
                )}
              </div>
            )}
          </Modal>
        </div>
      </div>
    </div>
  );
}
