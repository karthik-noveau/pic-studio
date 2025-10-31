import { useState, useRef, useCallback, useEffect } from "react";
import {
  Card,
  Button,
  Tabs,
  Switch,
  message,
  Tag,
  Typography,
  Divider,
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
} from "lucide-react";
import styles from "./style.module.css";

const { Text } = Typography;

// Import extracted modules
import { faviconSizes, imageFormats } from "../constants";
import { commonAspectRatios } from "../constants/aspectRatios";
import { analyzeImage, getImageFormat } from "../utils/imageAnalysis";
import {
  formatFileSize,
  simplifyRatio,
  getCommonRatioName,
} from "../utils/formatters";
import { debounce } from "../utils/helpers";

// Import tab components
import UploadTab from "./upload";
import UrlInputTab from "./url-input";
import AnalysisTab from "./analysis";
import CropTab from "./crop";
import RotateTab from "./rotate";
import FaviconTab from "./favicon";
import BorderRadiusTab from "./border-radius";
import BackgroundTab from "./background";
import CompressTab from "./compress";
import ConvertTab from "./convert";

export default function AspectRatioCalculator() {
  // Multiple images state
  const [images, setImages] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState("upload");

  // Add discard modal state
  const [showDiscardModal, setShowDiscardModal] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);

  // Computed active image data
  const imageData = images[activeImageIndex] || null;

  // Crop tool states - now per image
  const [cropArea, setCropArea] = useState({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  });
  const [showGrid, setShowGrid] = useState(true);

  // Enhanced crop states
  const [cropScale, setCropScale] = useState(100);
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
  const [selectedFormat, setSelectedFormat] = useState("jpeg");
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
    cropScale: 100,
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
      setCropScale(imageData.settings.cropScale);
      setRotation(imageData.settings.rotation);
      setCornerRadius(imageData.settings.cornerRadius);
      setBackgroundColor(imageData.settings.backgroundColor);
      setRemoveBackground(imageData.settings.removeBackground);
      setCompressionQuality(imageData.settings.compressionQuality);
      setSelectedFormat(imageData.settings.selectedFormat);
      setConversionQuality(imageData.settings.conversionQuality);

      setDefaultSettings((prev) => ({
        ...prev,
        cropArea: imageData.settings.cropArea,
      }));
    }
  }, [activeImageIndex]);

  // Effect to save settings back to the active image whenever they change
  useEffect(() => {
    if (imageData) {
      setImages(prev => prev.map((img, idx) => {
        if (idx === activeImageIndex) {
          return {
            ...img,
            settings: {
              cropArea,
              cropScale,
              rotation,
              cornerRadius,
              backgroundColor,
              removeBackground,
              compressionQuality,
              selectedFormat,
              conversionQuality,
            }
          };
        }
        return img;
      }));
    }
  }, [cropArea, cropScale, rotation, cornerRadius, backgroundColor, removeBackground, compressionQuality, selectedFormat, conversionQuality]);

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
      cropArea.height !== defaultSettings.cropArea.height ||
      cropScale !== defaultSettings.cropScale;

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
    cropScale,
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
  }, [hasSettingsChanged]);

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

      // Initialize crop area with better visibility
      const initialCropArea = {
        x: Math.round(width * 0.1),
        y: Math.round(height * 0.1),
        width: Math.round(width * 0.8),
        height: Math.round(height * 0.8),
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
        settings: {
          cropArea: initialCropArea,
          cropScale: 100,
          rotation: 0,
          cornerRadius: { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 },
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
      const invalidFiles = files.filter(file => !file.type.startsWith("image/"));
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
            const newImage = processImage(img, e.target?.result, file.size, file.name, file);
            newImages.push(newImage);
            loadedCount++;

            if (loadedCount === files.length) {
              // All images loaded - ADD to existing images
              setImages(prev => [...prev, ...newImages]);

              // If this is the first upload, set active index to 0
              // Otherwise keep the current active image
              setActiveImageIndex(prev => prev);

              setIsLoading(false);
              message.success(`${files.length} image${files.length > 1 ? 's' : ''} uploaded successfully`);

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

      try {
        const proxyUrl = `/api/proxy-image?url=${encodeURIComponent(imageUrl)}`;
        const img = new Image();
        img.crossOrigin = "anonymous";

        const loadPromise = new Promise((resolve, reject) => {
          img.onload = () => resolve(img);
          img.onerror = reject;
          img.src = proxyUrl;
        });

        const loadedImg = await loadPromise;
        const fileName = imageUrl.split("/").pop()?.split("?")[0] || "image";
        const newImage = processImage(loadedImg, proxyUrl, undefined, fileName, imageUrl);

        // Add to images array
        setImages(prev => [...prev, newImage]);

        // Load settings from new image
        setCropArea(newImage.settings.cropArea);
        setCropScale(newImage.settings.cropScale);
        setRotation(newImage.settings.rotation);
        setCornerRadius(newImage.settings.cornerRadius);
        setBackgroundColor(newImage.settings.backgroundColor);
        setRemoveBackground(newImage.settings.removeBackground);
        setCompressionQuality(newImage.settings.compressionQuality);
        setSelectedFormat(newImage.settings.selectedFormat);
        setConversionQuality(newImage.settings.conversionQuality);

        setDefaultSettings((prev) => ({
          ...prev,
          cropArea: newImage.settings.cropArea,
        }));

        setIsLoading(false);
        message.success("Image loaded from URL successfully");
      } catch (error) {
        setIsLoading(false);
        message.error(
          "Error loading image. Failed to load image from URL. Please check the URL and try again."
        );
      }
    };

    handleNewImageAction(action);
  }, [imageUrl, processImage, handleNewImageAction]);

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
    setCropScale(defaultSettings.cropScale);
    message.success(
      "Crop settings reverted. Crop area and scale have been reset to defaults."
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

        const finalWidth = includeScale
          ? Math.round(cropArea.width * (cropScale / 100))
          : cropArea.width;
        const finalHeight = includeScale
          ? Math.round(cropArea.height * (cropScale / 100))
          : cropArea.height;

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
      cropScale,
      backgroundColor,
      removeBackground,
      cornerRadius,
      rotation,
    ]
  );

  // Master export function - now handles batch export
  const exportWithAllChanges = useCallback(() => {
    if (images.length === 0) return;

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
            image.settings.selectedFormat === "jpeg" ? "image/jpeg" : `image/${image.settings.selectedFormat}`;
          extension = image.settings.selectedFormat === "jpeg" ? "jpg" : image.settings.selectedFormat;
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
        if (masterSettings.applyCompression) changes.push(`${image.settings.compressionQuality}q`);
        if (masterSettings.convertFormat) changes.push(image.settings.selectedFormat);
        if (masterSettings.applyRotation) changes.push(`rotated-${image.settings.rotation}deg`);

        const changesStr = changes.length > 0 ? `-${changes.join("-")}` : "";
        const imageNumber = images.length > 1 ? `-${index + 1}` : "";
        const filename = `processed${imageNumber}${changesStr}-${
          image.fileName || "image"
        }.${extension}`;

        downloadImage(dataUrl, filename);

        exportedCount++;

        if (exportedCount === images.length) {
          if (images.length > 1) {
            message.success(`All ${images.length} images exported successfully!`);
          } else {
            message.success(
              `Image exported successfully! Downloaded ${processedCanvas.width}×${processedCanvas.height}px image with ${changes.length} modifications.`
            );
          }
        }
      }, index * 100); // Stagger exports slightly
    });
  }, [
    images,
    activeImageIndex,
    applyAllChanges,
    masterSettings,
  ]);

  // Crop functionality
  const applyCrop = useCallback(() => {
    if (!imageData || !canvasRef.current || !cropCanvasRef.current) return;

    const canvas = canvasRef.current;
    const cropCanvas = cropCanvasRef.current;
    const ctx = cropCanvas.getContext("2d");
    if (!ctx) return;

    const finalWidth = Math.round(cropArea.width * (cropScale / 100));
    const finalHeight = Math.round(cropArea.height * (cropScale / 100));

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
  }, [imageData, cropArea, cropScale]);

  // Favicon generation
  const generateFavicons = useCallback(() => {
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
  }, [selectedFaviconSizes, applyAllChanges, masterSettings]);

  // Border radius
  const applyBorderRadius = useCallback(() => {
    if (!imageData || !canvasRef.current || !previewCanvasRef.current) return;

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
  }, [imageData, cornerRadius]);

  // Background changer
  const changeBackground = useCallback(() => {
    if (!imageData || !canvasRef.current || !previewCanvasRef.current) return;

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
  }, [imageData, backgroundColor, removeBackground]);

  // File size reducer
  const reduceFileSize = useCallback(() => {
    if (!imageData || !canvasRef.current) return;

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
  }, [imageData, compressionQuality]);

  // Format conversion
  const convertFormat = useCallback(() => {
    if (!imageData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    let mimeType = `image/${selectedFormat}`;
    let extension = selectedFormat;

    if (selectedFormat === "jpeg") {
      mimeType = "image/jpeg";
      extension = "jpg";
    }

    try {
      const dataUrl = canvas.toDataURL(mimeType, conversionQuality / 100);
      const fileName = `converted-${
        imageData.fileName?.split(".")[0] || "image"
      }.${extension}`;

      downloadImage(dataUrl, fileName);

      message.success(
        `Format converted. Successfully converted to ${selectedFormat.toUpperCase()}`
      );
    } catch (error) {
      message.error(
        `Conversion failed. ${selectedFormat.toUpperCase()} format is not supported`
      );
    }
  }, [imageData, selectedFormat, conversionQuality]);

  const downloadImage = (dataUrl, filename) => {
    const link = document.createElement("a");
    link.download = filename;
    link.href = dataUrl;
    link.click();
  };

  const resetAllSettings = useCallback(() => {
    setCropArea(defaultSettings.cropArea);
    setCropScale(defaultSettings.cropScale);
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
  const debouncedSetCropScale = useCallback(
    debounce((value) => setCropScale(value), 100),
    []
  );

  const debouncedSetRotation = useCallback(
    debounce((value) => setRotation(value), 100),
    []
  );

  const debouncedSetCompressionQuality = useCallback(
    debounce((value) => setCompressionQuality(value), 100),
    []
  );

  // Delete image function
  const deleteImage = useCallback((indexToDelete) => {
    setImages(prev => {
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
  }, [activeImageIndex]);

  // Switch active image function
  const switchToImage = useCallback((index) => {
    if (index >= 0 && index < images.length) {
      setActiveImageIndex(index);
    }
  }, [images.length]);

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
                fileInputRef.current.value = '';
              }
            }}
            style={{ display: 'none' }}
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
          <Card
            className={styles.uploadCard}
            title={
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
            }
          >
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
                  children: <UploadTab handleFileUpload={handleFileUpload} fileInputRef={fileInputRef} />,
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
          </Card>

          {/* Loading State */}
          {isLoading && (
            <Card className={styles.loadingCard}>
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
            </Card>
          )}

          {/* Image Gallery */}
          {images.length > 0 && (
            <Card
              className={styles.galleryCard}
              title={
                <div className={styles.galleryCardHeader}>
                  <div className={styles.galleryIconContainer}>
                    <Images style={{ width: "1.25rem", height: "1.25rem", color: "#2563eb" }} />
                  </div>
                  <div className={styles.galleryHeaderText}>
                    <div>Image Gallery</div>
                    <div className={styles.galleryHeaderSubtitle}>
                      {images.length} image{images.length > 1 ? 's' : ''} loaded
                    </div>
                  </div>
                </div>
              }
            >
              <div className={styles.imageGalleryContainer}>
                {images.map((image, index) => (
                  <div
                    key={image.id}
                    className={`${styles.thumbnailWrapper} ${index === activeImageIndex ? styles.thumbnailActive : ''}`}
                    onClick={() => switchToImage(index)}
                  >
                    <div className={styles.thumbnailImageContainer}>
                      <img
                        src={image.src}
                        alt={image.fileName}
                        className={styles.thumbnailImage}
                      />
                      {index === activeImageIndex && (
                        <div className={styles.activeBadge}>
                          <Eye style={{ width: "0.75rem", height: "0.75rem" }} />
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
                      <div className={styles.thumbnailFileName}>{image.fileName}</div>
                      <div className={styles.thumbnailDimensions}>
                        {image.width}×{image.height}
                      </div>
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
                    if (e.key === 'Enter' || e.key === ' ') {
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
            </Card>
          )}

          {/* Master Control Panel */}
          {imageData && (
            <Card
              className={styles.masterCard}
              title={
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
              }
            >
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
            </Card>
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
                        formatFileSize={formatFileSize}
                        copyToClipboard={copyToClipboard}
                        copied={copied}
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
                        cropScale={cropScale}
                        setCropScale={setCropScale}
                        cropInputMode={cropInputMode}
                        setCropInputMode={setCropInputMode}
                        debouncedSetCropScale={debouncedSetCropScale}
                        simplifyRatio={simplifyRatio}
                        applyCrop={applyCrop}
                        hasSettingsChanged={hasSettingsChanged}
                        revertCrop={revertCrop}
                        cropContainerRef={cropContainerRef}
                        commonAspectRatios={commonAspectRatios}
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
                        rotation={rotation}
                        setRotation={setRotation}
                        debouncedSetRotation={debouncedSetRotation}
                        applyAllChanges={applyAllChanges}
                        downloadImage={downloadImage}
                        hasSettingsChanged={hasSettingsChanged}
                        revertRotation={revertRotation}
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
                        faviconSizes={faviconSizes}
                        selectedFaviconSizes={selectedFaviconSizes}
                        setSelectedFaviconSizes={setSelectedFaviconSizes}
                        customFaviconSize={customFaviconSize}
                        setCustomFaviconSize={setCustomFaviconSize}
                        generateFavicons={generateFavicons}
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
                        cornerRadius={cornerRadius}
                        setCornerRadius={setCornerRadius}
                        uniformRadius={uniformRadius}
                        setUniformRadius={setUniformRadius}
                        applyBorderRadius={applyBorderRadius}
                        hasSettingsChanged={hasSettingsChanged}
                        revertBorderRadius={revertBorderRadius}
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
                        backgroundColor={backgroundColor}
                        setBackgroundColor={setBackgroundColor}
                        removeBackground={removeBackground}
                        setRemoveBackground={setRemoveBackground}
                        changeBackground={changeBackground}
                        hasSettingsChanged={hasSettingsChanged}
                        revertBackground={revertBackground}
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
                        compressionQuality={compressionQuality}
                        setCompressionQuality={setCompressionQuality}
                        debouncedSetCompressionQuality={
                          debouncedSetCompressionQuality
                        }
                        formatFileSize={formatFileSize}
                        reduceFileSize={reduceFileSize}
                        hasSettingsChanged={hasSettingsChanged}
                        revertCompression={revertCompression}
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
                        selectedFormat={selectedFormat}
                        setSelectedFormat={setSelectedFormat}
                        conversionQuality={conversionQuality}
                        setConversionQuality={setConversionQuality}
                        imageFormats={imageFormats}
                        convertFormat={convertFormat}
                        hasSettingsChanged={hasSettingsChanged}
                        revertFormat={revertFormat}
                      />
                    ),
                  },
                ]}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
