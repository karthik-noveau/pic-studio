import { useState, useRef, useCallback, useEffect } from "react";
import { App as AntdApp, ConfigProvider, message } from "antd";
import { antdTheme } from "./theme/antd-theme";
import Home from "./pages/Home";
import Studio from "./pages/studio";

// Import utilities and constants
import { faviconSizes, imageFormats } from "./common";
import { commonAspectRatios } from "./common/constants/aspect-ratios";
import { analyzeImage, getImageFormat } from "./common/utils/image-analysis";
import { formatFileSize, simplifyRatio } from "./common/utils/formatters";
import { debounce } from "./common/utils/helpers";

function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [images, setImages] = useState([]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Crop tool states
  const [cropArea, setCropArea] = useState({ x: 0, y: 0, width: 100, height: 100 });
  const [showGrid, setShowGrid] = useState(true);
  const [cropInputMode, setCropInputMode] = useState("input");

  // Favicon generator states
  const [selectedFaviconSizes, setSelectedFaviconSizes] = useState([16, 32, 48]);
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

  // Rotation state
  const [rotation, setRotation] = useState(0);

  // Default settings for comparison
  const [defaultSettings] = useState({
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

  // Computed processed image with all cumulative transformations
  const [processedImageSrc, setProcessedImageSrc] = useState(null);
  const [transparentImageSrc, setTransparentImageSrc] = useState(null); // New state for background-removed image

  // Compressed image preview for comparison slider
  const [compressedImageSrc, setCompressedImageSrc] = useState(null);
  const [compressedSize, setCompressedSize] = useState(null);
  const [compressionRatio, setCompressionRatio] = useState(null);

  const canvasRef = useRef(null);
  const cropCanvasRef = useRef(null);
  const previewCanvasRef = useRef(null);
  const cropContainerRef = useRef(null);
  const isLoadingSettings = useRef(false);

  const imageData = images[activeImageIndex] || null;

  // Effect to load settings when active image changes
  useEffect(() => {
    if (imageData && imageData.settings) {
      isLoadingSettings.current = true;
      setCropArea(imageData.settings.cropArea);
      setBackgroundColor(imageData.settings.backgroundColor);
      setRemoveBackground(imageData.settings.removeBackground);
      setRotation(imageData.settings.rotation);
      setCornerRadius(imageData.settings.cornerRadius);
      setCompressionQuality(imageData.settings.compressionQuality);
      setSelectedFormat(imageData.settings.selectedFormat);
      setConversionQuality(imageData.settings.conversionQuality);
      setTransparentImageSrc(imageData.settings.transparentImageSrc || null); // Load transparent image src
      // Reset flag after state updates have been processed
      setTimeout(() => {
        isLoadingSettings.current = false;
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageData]);

  useEffect(() => {
    if (imageData) {
      setCropArea({ x: 0, y: 0, width: imageData.width, height: imageData.height });
    }
  }, [imageData?.width, imageData?.height]);

  // Redraw canvas when active image changes
  useEffect(() => {
    if (!imageData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    };
    img.src = imageData.src;
  }, [imageData, activeImageIndex]);

  // Effect to save settings back to the active image whenever they change
  useEffect(() => {
    // Don't save settings while we're loading them
    if (isLoadingSettings.current) {
      return;
    }

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
                transparentImageSrc, // Save transparent image src
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
    transparentImageSrc, // Add transparentImageSrc to dependencies
    activeImageIndex,
  ]);

  // Create canvas element for image processing
  useEffect(() => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas");
      cropCanvasRef.current = document.createElement("canvas");
      previewCanvasRef.current = document.createElement("canvas");
    }
  }, []);

  // Check if settings have changed from defaults
  const hasSettingsChanged = useCallback(() => {
    const cropChanged = imageData && (
      cropArea.x !== 0 ||
      cropArea.y !== 0 ||
      cropArea.width !== imageData.width ||
      cropArea.height !== imageData.height
    );

    const borderChanged =
      cornerRadius.topLeft !== defaultSettings.cornerRadius.topLeft ||
      cornerRadius.topRight !== defaultSettings.cornerRadius.topRight ||
      cornerRadius.bottomLeft !== defaultSettings.cornerRadius.bottomLeft ||
      cornerRadius.bottomRight !== defaultSettings.cornerRadius.bottomRight;

    const backgroundChanged =
      backgroundColor !== defaultSettings.backgroundColor ||
      removeBackground !== defaultSettings.removeBackground ||
      transparentImageSrc !== null; // Consider transparentImageSrc as a change

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
    imageData,
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

  // Generate processed image with cumulative transformations
  useEffect(() => {
    const generateProcessedImage = async () => {
      if (!imageData || !canvasRef.current) {
        setProcessedImageSrc(null);
        return;
      }

      const hasTransformations =
        masterSettings.applyCrop ||
        masterSettings.applyRotation ||
        (masterSettings.applyBackground && !removeBackground) || // Only apply background if not removing
        masterSettings.applyBorderRadius ||
        (removeBackground && transparentImageSrc); // Consider transparent image as a transformation

      // Determine the base image source for processing
      let baseImageSource = imageData.src;
      if (transparentImageSrc) {
        baseImageSource = transparentImageSrc;
      }

      if (!hasTransformations && baseImageSource === imageData.src) {
        setProcessedImageSrc(imageData.src);
        return;
      }
      if (!hasTransformations && baseImageSource === transparentImageSrc) {
        setProcessedImageSrc(transparentImageSrc);
        return;
      }

      const canvas = canvasRef.current;
      let workingCanvas = document.createElement("canvas");
      let workingCtx = workingCanvas.getContext("2d");

      if (!workingCtx) {
        setProcessedImageSrc(imageData.src);
        return;
      }

      try {
        const img = new Image();
        img.src = baseImageSource;
        await new Promise((resolve, reject) => {
          img.onload = resolve;
          img.onerror = reject;
        });

        workingCanvas.width = img.naturalWidth;
        workingCanvas.height = img.naturalHeight;
        workingCtx.clearRect(0, 0, workingCanvas.width, workingCanvas.height);
        workingCtx.drawImage(img, 0, 0);

        // Apply crop if enabled
        if (masterSettings.applyCrop) {
          const croppedCanvas = document.createElement("canvas");
          const croppedCtx = croppedCanvas.getContext("2d");
          if (croppedCtx) {
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
        }

        // Apply rotation if enabled
        if (masterSettings.applyRotation && rotation !== 0) {
          const rotatedCanvas = document.createElement("canvas");
          const rotatedCtx = rotatedCanvas.getContext("2d");
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

        // Apply background color if enabled
        if (masterSettings.applyBackground && !removeBackground) {
          const bgCanvas = document.createElement("canvas");
          const bgCtx = bgCanvas.getContext("2d");
          if (bgCtx) {
            bgCanvas.width = workingCanvas.width;
            bgCanvas.height = workingCanvas.height;
            bgCtx.fillStyle = backgroundColor;
            bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
            bgCtx.drawImage(workingCanvas, 0, 0);
            workingCanvas = bgCanvas;
            workingCtx = bgCtx;
          }
        }

        // Apply border radius if enabled
        if (masterSettings.applyBorderRadius) {
          const radiusCanvas = document.createElement("canvas");
          const radiusCtx = radiusCanvas.getContext("2d");
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
            radiusCtx.quadraticCurveTo(
              workingCanvas.width,
              workingCanvas.height,
              workingCanvas.width - br,
              workingCanvas.height
            );
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

        const dataUrl = workingCanvas.toDataURL("image/png");
        setProcessedImageSrc(dataUrl);
      } catch (error) {
        console.error("Error generating processed image:", error);
        setProcessedImageSrc(imageData.src);
      }
    };

    generateProcessedImage();
  }, [imageData, masterSettings, cropArea, rotation, backgroundColor, removeBackground, cornerRadius, transparentImageSrc]); // Add transparentImageSrc to dependencies

  // Generate compressed image preview for comparison slider
  useEffect(() => {
    if (!processedImageSrc || !imageData) {
      setCompressedImageSrc(null);
      setCompressedSize(null);
      setCompressionRatio(null);
      return;
    }

    try {
      // Create a temporary canvas to load the processed image
      const tempCanvas = document.createElement('canvas');
      const tempCtx = tempCanvas.getContext('2d');
      if (!tempCtx) return;

      const img = new Image();
      img.onload = () => {
        tempCanvas.width = img.width;
        tempCanvas.height = img.height;
        tempCtx.drawImage(img, 0, 0);

        // Generate compressed preview with the specified quality
        const quality = compressionQuality / 100;
        const compressedDataUrl = tempCanvas.toDataURL('image/jpeg', quality);

        // Calculate the compressed file size from data URL
        // Data URL format: data:image/jpeg;base64,<base64data>
        const base64String = compressedDataUrl.split(',')[1];
        const compressedBytes = Math.round((base64String.length * 3) / 4);

        // Calculate compression ratio
        const originalSize = imageData.fileSize;
        const ratio = ((originalSize - compressedBytes) / originalSize) * 100;

        setCompressedImageSrc(compressedDataUrl);
        setCompressedSize(compressedBytes);
        setCompressionRatio(ratio);
      };
      img.onerror = () => {
        console.error("Error loading processed image for compression");
        setCompressedImageSrc(processedImageSrc);
        setCompressedSize(null);
        setCompressionRatio(null);
      };
      img.src = processedImageSrc;
    } catch (error) {
      console.error("Error generating compressed preview:", error);
      setCompressedImageSrc(processedImageSrc);
      setCompressedSize(null);
      setCompressionRatio(null);
    }
  }, [processedImageSrc, compressionQuality, imageData]);

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
      const analysis = analyzeImageData(img, file);

      const initialCropArea = { x: 0, y: 0, width: width, height: height };

      const newImage = {
        id: Date.now() + Math.random(),
        originalSrc: src, // Store the original source
        src,
        width,
        height,
        aspectRatio,
        simplifiedRatio,
        commonName: analysis?.commonName || "Custom",
        fileSize,
        fileName,
        analysis,
        source: file ? "upload" : "url",
        settings: {
          cropArea: initialCropArea,
          rotation: 0,
          cornerRadius: { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 },
          backgroundColor: "#ffffff",
          removeBackground: false,
          compressionQuality: 80,
          selectedFormat: "jpeg",
          conversionQuality: 85,
          transparentImageSrc: null, // Initialize transparentImageSrc
        },
      };

      return newImage;
    },
    [analyzeImageData]
  );

  const copyToClipboard = useCallback((text) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      message.success(`Copied to clipboard: ${text}`);
    });
  }, []);

  // Revert functions
  const revertCrop = useCallback(() => {
    if (imageData) {
      setCropArea({ x: 0, y: 0, width: imageData.width, height: imageData.height });
      message.success("Crop settings reverted");
    }
  }, [imageData]);

  const revertBorderRadius = useCallback(() => {
    setCornerRadius(defaultSettings.cornerRadius);
    message.success("Border radius reverted");
  }, [defaultSettings]);

  const revertBackground = useCallback(() => {
    setBackgroundColor(defaultSettings.backgroundColor);
    setRemoveBackground(defaultSettings.removeBackground);
    setTransparentImageSrc(null); // Clear transparent image on revert
    message.success("Background settings reverted");
  }, [defaultSettings]);

  const revertCompression = useCallback(() => {
    setCompressionQuality(defaultSettings.compressionQuality);
    message.success("Compression reverted");
  }, [defaultSettings]);

  const revertFormat = useCallback(() => {
    setSelectedFormat(defaultSettings.selectedFormat);
    setConversionQuality(defaultSettings.conversionQuality);
    message.success("Format settings reverted");
  }, [defaultSettings]);

  const revertRotation = useCallback(() => {
    setRotation(defaultSettings.rotation);
    message.success("Rotation reverted");
  }, [defaultSettings]);

  const applyAllChanges = useCallback(() => {
    if (!imageData || !canvasRef.current) return null;

    const canvas = canvasRef.current;
    let workingCanvas = document.createElement("canvas");
    let workingCtx = workingCanvas.getContext("2d");
    if (!workingCtx) return null;

    // Determine the base image source for processing
    let baseImageSource = imageData.src;
    if (removeBackground && transparentImageSrc) {
      baseImageSource = transparentImageSrc;
    }

    const img = new Image();
    img.src = baseImageSource;
    img.onload = () => {
      workingCanvas.width = img.naturalWidth;
      workingCanvas.height = img.naturalHeight;
      workingCtx.drawImage(img, 0, 0);

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

      if (masterSettings.applyRotation && rotation !== 0) {
        const rotatedCanvas = document.createElement("canvas");
        const rotatedCtx = rotatedCanvas.getContext("2d");
        if (!rotatedCtx) return null;

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

      // Apply background color if enabled and not removing background
      if (masterSettings.applyBackground && !removeBackground) {
        const bgCanvas = document.createElement("canvas");
        const bgCtx = bgCanvas.getContext("2d");
        if (!bgCtx) return null;

        bgCanvas.width = workingCanvas.width;
        bgCanvas.height = workingCanvas.height;
        bgCtx.fillStyle = backgroundColor;
        bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
        bgCtx.drawImage(workingCanvas, 0, 0);
        workingCanvas = bgCanvas;
        workingCtx = bgCtx;
      }

      if (masterSettings.applyBorderRadius) {
        const radiusCanvas = document.createElement("canvas");
        const radiusCtx = radiusCanvas.getContext("2d");
        if (!radiusCtx) return null;

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
        radiusCtx.quadraticCurveTo(
          workingCanvas.width,
          workingCanvas.height,
          workingCanvas.width - br,
          workingCanvas.height
        );
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
    };

    return workingCanvas;
  }, [imageData, masterSettings, cropArea, backgroundColor, removeBackground, cornerRadius, rotation, transparentImageSrc]); // Add transparentImageSrc to dependencies

  const applyCrop = useCallback(() => {
    if (!imageData || !canvasRef.current || !cropCanvasRef.current) return;

    const originalImage = new Image();
    originalImage.src = imageData.originalSrc || imageData.src; // Fallback to src for older data

    originalImage.onload = () => {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      canvas.width = originalImage.naturalWidth;
      canvas.height = originalImage.naturalHeight;
      ctx.drawImage(originalImage, 0, 0);

      const cropCanvas = cropCanvasRef.current;
      const cropCtx = cropCanvas.getContext("2d");
      if (!cropCtx) return;

      const finalWidth = Math.round(cropArea.width);
      const finalHeight = Math.round(cropArea.height);

      cropCanvas.width = finalWidth;
      cropCanvas.height = finalHeight;

      cropCtx.imageSmoothingEnabled = true;
      cropCtx.imageSmoothingQuality = "high";

      cropCtx.drawImage(
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

      const newImages = [...images];
      const newImageData = {
        ...newImages[activeImageIndex],
        src: croppedDataUrl,
        width: finalWidth,
        height: finalHeight,
        fileSize: croppedDataUrl.length,
        settings: {
          ...newImages[activeImageIndex].settings,
          cropArea: { x: 0, y: 0, width: finalWidth, height: finalHeight },
        },
      };
      newImages[activeImageIndex] = newImageData;

      setImages(newImages);
      setProcessedImageSrc(croppedDataUrl);

      message.success(`Image cropped successfully.`);
    };
  }, [imageData, cropArea, images, activeImageIndex]);

  const generateFavicons = useCallback(() => {
    setIsDownloading(true);

    setTimeout(() => {
      try {
        selectedFaviconSizes.forEach((size) => {
          const processedCanvas = applyAllChanges();
          if (!processedCanvas) return;

          const faviconCanvas = document.createElement("canvas");
          const ctx = faviconCanvas.getContext("2d");
          if (!ctx) return;

          faviconCanvas.width = size;
          faviconCanvas.height = size;

          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";

          const minDimension = Math.min(processedCanvas.width, processedCanvas.height);
          const offsetX = (processedCanvas.width - minDimension) / 2;
          const offsetY = (processedCanvas.height - minDimension) / 2;

          ctx.drawImage(processedCanvas, offsetX, offsetY, minDimension, minDimension, 0, 0, size, size);

          const dataUrl = faviconCanvas.toDataURL("image/png");

          const changes = [];
          if (masterSettings.applyCrop) changes.push("cropped");
          if (masterSettings.applyBorderRadius) changes.push("rounded");
          if (masterSettings.applyBackground) changes.push("bg");
          const changesStr = changes.length > 0 ? `-${changes.join("-")}` : "";

          downloadImage(dataUrl, `favicon${changesStr}-${size}x${size}.png`);
        });

        message.success(`Favicons generated with all settings! Generated ${selectedFaviconSizes.length} favicon sizes.`);
      } finally {
        setIsDownloading(false);
      }
    }, 100);
  }, [selectedFaviconSizes, applyAllChanges, masterSettings]);

  const applyBorderRadius = useCallback(() => {
    if (!imageData || !canvasRef.current || !previewCanvasRef.current) return;

    setIsDownloading(true);

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
        ctx.quadraticCurveTo(canvas.width, canvas.height, canvas.width - br, canvas.height);
        ctx.lineTo(bl, canvas.height);
        ctx.quadraticCurveTo(0, canvas.height, 0, canvas.height - bl);
        ctx.lineTo(0, tl);
        ctx.quadraticCurveTo(0, 0, tl, 0);
        ctx.closePath();
        ctx.clip();

        ctx.drawImage(canvas, 0, 0);

        const dataUrl = previewCanvas.toDataURL("image/png");
        downloadImage(dataUrl, `rounded-${imageData.fileName || "image"}.png`);

        message.success("Border radius applied successfully.");
      } finally {
        setIsDownloading(false);
      }
    }, 100);
  }, [imageData, cornerRadius]);

  const changeBackground = useCallback(() => {
    if (!imageData || !canvasRef.current || !previewCanvasRef.current) return;

    setIsDownloading(true);

    setTimeout(() => {
      try {
        const canvas = canvasRef.current;
        const previewCanvas = previewCanvasRef.current;
        const ctx = previewCanvas.getContext("2d");
        if (!ctx) return;

        previewCanvas.width = canvas.width;
        previewCanvas.height = canvas.height;

        // Use transparentImageSrc if background is removed, otherwise use original
        const imageToDraw = new Image();
        imageToDraw.src = (removeBackground && transparentImageSrc) ? transparentImageSrc : imageData.src;

        imageToDraw.onload = () => {
          // Always fill background if masterSettings.applyBackground is true
          if (masterSettings.applyBackground) {
            ctx.fillStyle = backgroundColor;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }

          ctx.drawImage(imageToDraw, 0, 0);

          const format = (removeBackground && transparentImageSrc) ? "image/png" : "image/jpeg";
          const extension = (removeBackground && transparentImageSrc) ? "png" : "jpg";
          const dataUrl = previewCanvas.toDataURL(format, 0.9);
          downloadImage(dataUrl, `background-changed-${imageData.fileName || "image"}.${extension}`);

          message.success("Background changed successfully.");
        };
        imageToDraw.onerror = (err) => {
          console.error("Error loading image for background change:", err);
          message.error("Failed to load image for background change.");
        };
      } finally {
        setIsDownloading(false);
      }
    }, 100);
  }, [imageData, backgroundColor, removeBackground, transparentImageSrc]);

  const reduceFileSize = useCallback(() => {
    if (!imageData || !canvasRef.current) return;

    setIsDownloading(true);

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
          `compressed-${compressionQuality}q-${imageData.fileName || "image"}.${bestResult.format}`
        );

        message.success(
          `File compressed. Reduced by ${compressionRatio.toFixed(1)}% to ${formatFileSize(bestResult.size)}`
        );
      } finally {
        setIsDownloading(false);
      }
    }, 100);
  }, [imageData, compressionQuality, activeImageIndex]);

  const convertFormat = useCallback(() => {
    if (!imageData || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const fileName = imageData.fileName?.split(".")[0] || "image";

    setIsDownloading(true);

    setTimeout(() => {
      try {
        let mimeType = `image/${selectedFormat}`;
        let extension = selectedFormat;

        if (selectedFormat === "jpeg") {
          mimeType = "image/jpeg";
          extension = "jpg";
        }

        const dataUrl = canvas.toDataURL(mimeType, 0.9);
        downloadImage(dataUrl, `converted-${fileName}.${extension}`);

        message.success(`Format converted to ${selectedFormat.toUpperCase()} successfully`);
      } catch (error) {
        console.error("Conversion error:", error);
        message.error(`Conversion failed: ${error.message}`);
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

  const debouncedSetRotation = useCallback(debounce((value) => setRotation(value), 100), []);
  const debouncedSetCompressionQuality = useCallback(
    debounce((value) => setCompressionQuality(value), 100),
    []
  );

  const openFullscreen = useCallback(() => {
    // Placeholder function - handled in PreviewPanel
  }, []);

  const navigateToHome = useCallback(() => {
    setCurrentPage("home");
  }, []);

  const navigateToStudio = useCallback(() => {
    if (images.length > 0) {
      setCurrentPage("studio");
    } else {
      message.warning("Please upload at least one image first");
    }
  }, [images.length]);

  return (
    <ConfigProvider theme={antdTheme}>
      <AntdApp>
        {currentPage === "home" ? (
          <Home
            onNavigateToStudio={navigateToStudio}
            images={images}
            setImages={setImages}
            processImage={processImage}
          />
        ) : (
          <Studio
            onNavigateToHome={navigateToHome}
            images={images}
            activeImageIndex={activeImageIndex}
            setActiveImageIndex={setActiveImageIndex}
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
            rotation={rotation}
            setRotation={setRotation}
            debouncedSetRotation={debouncedSetRotation}
            applyAllChanges={applyAllChanges}
            downloadImage={downloadImage}
            revertRotation={revertRotation}
            openFullscreen={openFullscreen}
            faviconSizes={faviconSizes}
            selectedFaviconSizes={selectedFaviconSizes}
            setSelectedFaviconSizes={setSelectedFaviconSizes}
            customFaviconSize={customFaviconSize}
            setCustomFaviconSize={setCustomFaviconSize}
            generateFavicons={generateFavicons}
            cornerRadius={cornerRadius}
            setCornerRadius={setCornerRadius}
            uniformRadius={uniformRadius}
            setUniformRadius={setUniformRadius}
            applyBorderRadius={applyBorderRadius}
            revertBorderRadius={revertBorderRadius}
            backgroundColor={backgroundColor}
            setBackgroundColor={setBackgroundColor}
            removeBackground={removeBackground}
            setRemoveBackground={setRemoveBackground}
            changeBackground={changeBackground}
            revertBackground={revertBackground}
            compressionQuality={compressionQuality}
            setCompressionQuality={setCompressionQuality}
            debouncedSetCompressionQuality={debouncedSetCompressionQuality}
            formatFileSize={formatFileSize}
            reduceFileSize={reduceFileSize}
            revertCompression={revertCompression}
            selectedFormat={selectedFormat}
            setSelectedFormat={setSelectedFormat}
            imageFormats={imageFormats}
            convertFormat={convertFormat}
            revertFormat={revertFormat}
            copyToClipboard={copyToClipboard}
            copied={copied}
            processedImageSrc={processedImageSrc}
            compressedImageSrc={compressedImageSrc}
            compressedSize={compressedSize}
            compressionRatio={compressionRatio}
            transparentImageSrc={transparentImageSrc} // Pass transparentImageSrc
            setTransparentImageSrc={setTransparentImageSrc} // Pass setTransparentImageSrc
          />
        )}
      </AntdApp>
    </ConfigProvider>
  );
}

export default App;
