import { message } from "antd";
import { temporal } from "zundo";
import { create } from "zustand";

import { simplifyRatio } from "@common/utils/formatters";
import { analyzeImage, getImageFormat } from "@common/utils/image-analysis";
import { applyImageTransformations } from "@common/utils/image-processing"; // Import the new utility

const defaultSettings = {
  cropArea: { x: 0, y: 0, width: 100, height: 100 },
  cornerRadius: { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 },
  backgroundColor: "#ffffff",
  removeBackground: false,
  compressionQuality: 80,
  selectedFormat: "jpeg",
  conversionQuality: 85,
  rotation: 0,
};

const useStore = create(
  temporal((set, get) => ({
    // =================================================================================
    // State
    // =================================================================================
    currentPage: "home",
    images: [],
    activeImageIndex: 0,
    isDownloading: false,
    isUploading: false,
    copied: false,

    // Tool States
    cropArea: { x: 0, y: 0, width: 100, height: 100 },
    showGrid: true,
    cropInputMode: "input",
    selectedFaviconSizes: [16, 32, 48],
    customFaviconSize: "",
    cornerRadius: { topLeft: 0, topRight: 0, bottomLeft: 0, bottomRight: 0 },
    uniformRadius: true,
    backgroundColor: "#ffffff",
    removeBackground: false,
    compressionQuality: 80,
    selectedFormat: "webp",
    conversionQuality: 85,
    rotation: 0,
    masterSettings: {
      applyCrop: false,
      applyBorderRadius: false,
      applyBackground: false,
      applyCompression: false,
      convertFormat: false,
      applyRotation: false,
    },

    // Derived/Computed State
    transparentImage: null,
    processedImageUrl: null, // New state for the processed image URL
    compressedImageSrc: null,
    compressedSize: null,
    compressionRatio: null,

    // Refs (managed outside state for non-reactive purposes)
    canvasRef: { current: null },
    cropCanvasRef: { current: null },
    previewCanvasRef: { current: null },
    cropContainerRef: { current: null },
    isLoadingSettings: { current: false },

    // =================================================================================
    // Actions
    // =================================================================================

    // Navigation
    navigateToHome: () => set({ currentPage: "home" }),
    navigateToStudio: () => {
      if (get().images.length > 0) {
        set({ currentPage: "studio" });
      } else {
        message.warning("Please upload at least one image first");
      }
    },

    // Image Management
    setImages: (images) => set({ images }),
    setIsUploading: (isUploading) => set({ isUploading }),
    setActiveImageIndex: (index) => {
      console.log("setActiveImageIndex: index", index);
      set({ activeImageIndex: index });
      get().loadImageSettings();
    },

    addImages: (newImages) => {
      set({ isUploading: true });
      const processed = newImages.map((file) => {
        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
              const newImage = get().processImage(
                img,
                e.target.result,
                file.size,
                file.name,
                file
              );
              resolve(newImage);
            };
            img.src = e.target.result;
          };
          reader.readAsDataURL(file);
        });
      });

      return Promise.all(processed).then((processedImages) => {
        set((state) => {
          const newImages = [...state.images, ...processedImages];
          const newActiveImageIndex = state.images.length === 0 ? 0 : state.activeImageIndex;
          console.log("addImages: newImages", newImages);
          console.log("addImages: newActiveImageIndex", newActiveImageIndex);
          return {
            images: newImages,
            activeImageIndex: newActiveImageIndex,
            isUploading: false,
          };
        });
        get().loadImageSettings();
      });
    },

    // Settings Management
    loadImageSettings: () => {
      const { images, activeImageIndex } = get();
      const imageData = images[activeImageIndex];
      console.log("loadImageSettings: images", images);
      console.log("loadImageSettings: activeImageIndex", activeImageIndex);
      console.log("loadImageSettings: imageData", imageData);

      if (imageData) {
        get().isLoadingSettings.current = true;
        const { settings } = imageData;
        set({
          cropArea: settings?.cropArea || {
            ...defaultSettings.cropArea,
            width: imageData.width,
            height: imageData.height,
          },
          backgroundColor:
            settings?.backgroundColor || defaultSettings.backgroundColor,
          removeBackground:
            settings?.removeBackground || defaultSettings.removeBackground,
          rotation: settings?.rotation || defaultSettings.rotation,
          cornerRadius: settings?.cornerRadius || defaultSettings.cornerRadius,
          compressionQuality:
            settings?.compressionQuality ||
            defaultSettings.compressionQuality,
          selectedFormat:
            settings?.selectedFormat || defaultSettings.selectedFormat,
          conversionQuality:
            settings?.conversionQuality ||
            defaultSettings.conversionQuality,
          transparentImage: settings?.transparentImage || null,
        });
        setTimeout(() => {
          get().isLoadingSettings.current = false;
        }, 0);
      }
    },

    updateImageSettings: () => {
      if (get().isLoadingSettings.current) return;

      const {
        images,
        activeImageIndex,
        cropArea,
        rotation,
        cornerRadius,
        backgroundColor,
        removeBackground,
        compressionQuality,
        selectedFormat,
        conversionQuality,
        transparentImage,
      } = get();

      if (images[activeImageIndex]) {
        const updatedImages = images.map((img, idx) => {
          if (idx === activeImageIndex) {
            return {
              ...img,
              settings: {
                ...img.settings, // Preserve existing settings
                cropArea,
                rotation,
                cornerRadius,
                backgroundColor,
                removeBackground,
                compressionQuality,
                selectedFormat,
                conversionQuality,
                transparentImage,
              },
            };
          }
          return img;
        });
        set({ images: updatedImages });
      }
    },

    // Tool Actions
    setCropArea: (newCropArea) => {
      console.log("useStore: setCropArea", newCropArea);
      set((state) => ({
        cropArea: { ...newCropArea },
        masterSettings: {
          ...state.masterSettings,
          applyCrop: true,
        },
      }));
      get().updateImageSettings();
    },

    applyCropAction: () => {
      get().applyAllChanges();
    },

    setRotation: (newRotation) => {
      set((state) => ({
        rotation: newRotation,
        masterSettings: {
          ...state.masterSettings,
          applyRotation: true,
        },
      }));
      get().updateImageSettings();
      get().applyAllChanges();
    },
    setCornerRadius: (newCornerRadius) => {
      set((state) => ({
        cornerRadius: { ...newCornerRadius },
        masterSettings: {
          ...state.masterSettings,
          applyBorderRadius: true,
        },
      }));
      get().updateImageSettings();
      get().applyAllChanges();
    },
    setBackgroundColor: (newBackgroundColor) => {
      set((state) => ({
        backgroundColor: newBackgroundColor,
        removeBackground: false, // Set removeBackground to false
        masterSettings: {
          ...state.masterSettings,
          applyBackground: true,
        },
      }));
      get().updateImageSettings();
      get().applyAllChanges();
    },
    setRemoveBackground: (newRemoveBackground) => {
      set((state) => ({
        removeBackground: newRemoveBackground,
        masterSettings: {
          ...state.masterSettings,
          applyBackground: true,
        },
      }));
      get().updateImageSettings();
      get().applyAllChanges();
    },
    setCompressionQuality: (newCompressionQuality) => {
      set((state) => ({
        compressionQuality: newCompressionQuality,
        masterSettings: {
          ...state.masterSettings,
          applyCompression: true,
        },
      }));
      get().updateImageSettings();
      get().applyAllChanges();
    },
    setSelectedFormat: (newSelectedFormat) => {
      set((state) => ({
        selectedFormat: newSelectedFormat,
        masterSettings: {
          ...state.masterSettings,
          convertFormat: true,
        },
      }));
      get().updateImageSettings();
      get().applyAllChanges();
    },
    setConversionQuality: (newConversionQuality) => {
      set((state) => ({
        conversionQuality: newConversionQuality,
        masterSettings: {
          ...state.masterSettings,
          convertFormat: true,
        },
      }));
      get().updateImageSettings();
      get().applyAllChanges();
    },
    setTransparentImage: (newTransparentImage) => {
      set((state) => ({
        transparentImage: newTransparentImage,
        masterSettings: {
          ...state.masterSettings,
          applyBackground: true,
        },
      }));
      get().updateImageSettings();
      get().applyAllChanges();
    },

    setCompressedImageDetails: (src, size, ratio) => {
      set({
        compressedImageSrc: src,
        compressedSize: size,
        compressionRatio: ratio,
      });
    },

    // Revert Actions
    revertCrop: () => {
      const { images, activeImageIndex } = get();
      const imageData = images[activeImageIndex];
      if (imageData) {
        set((state) => ({
          cropArea: {
            x: 0,
            y: 0,
            width: imageData.width,
            height: imageData.height,
          },
          masterSettings: {
            ...state.masterSettings,
            applyCrop: false,
          },
        }));
        message.success("Crop settings reverted");
      }
    },
    revertBorderRadius: () => {
      set((state) => ({
        cornerRadius: defaultSettings.cornerRadius,
        masterSettings: {
          ...state.masterSettings,
          applyBorderRadius: false,
        },
      }));
      message.success("Border radius reverted");
    },
    revertBackground: () => {
      set((state) => ({
        backgroundColor: defaultSettings.backgroundColor,
        removeBackground: defaultSettings.removeBackground,
        transparentImage: null,
        masterSettings: {
          ...state.masterSettings,
          applyBackground: false,
        },
      }));
      message.success("Background settings reverted");
    },
    revertCompression: () => {
      set((state) => ({
        compressionQuality: defaultSettings.compressionQuality,
        masterSettings: {
          ...state.masterSettings,
          applyCompression: false,
        },
      }));
      message.success("Compression reverted");
    },
    revertFormat: () => {
      set((state) => ({
        selectedFormat: defaultSettings.selectedFormat,
        conversionQuality: defaultSettings.conversionQuality,
        masterSettings: {
          ...state.masterSettings,
          convertFormat: false,
        },
      }));
      message.success("Format settings reverted");
    },
    revertRotation: () => {
      set((state) => ({
        rotation: defaultSettings.rotation,
        masterSettings: {
          ...state.masterSettings,
          applyRotation: false,
        },
      }));
      message.success("Rotation reverted");
    },
    revertAll: () => {
      set((state) => ({
        images: state.images.map((image) => ({
          ...image,
          settings: {
            ...defaultSettings,
            cropArea: {
              x: 0,
              y: 0,
              width: image.width,
              height: image.height,
            },
          },
        })),
        masterSettings: {
          applyCrop: false,
          applyBorderRadius: false,
          applyBackground: false,
          applyCompression: false,
          convertFormat: false,
          applyRotation: false,
        },
      }));
      get().loadImageSettings();
      message.success("All changes reverted");
    },

    // Image Processing & Analysis
    processImage: (img, src, fileSize, fileName, file) => {
      const { canvasRef } = get();
      const width = img.naturalWidth;
      const height = img.naturalHeight;
      const aspectRatio = width / height;
      const simplifiedRatio = simplifyRatio(width, height);

      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0);

      const analysis = analyzeImage(canvas, ctx);
      analysis.format = file ? getImageFormat(file) : "Unknown";

      return {
        id: Date.now() + Math.random(),
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
          ...defaultSettings,
          cropArea: { x: 0, y: 0, width, height },
        },
      };
    },

    // Export & Download
    downloadImage: (dataUrl, filename) => {
      const link = document.createElement("a");
      link.download = filename;
      link.href = dataUrl;
      link.click();
    },

    exportAll: async () => {
      const { images, downloadImage } = get();
      set({ isDownloading: true });
      message.info(`Exporting ${images.length} images...`);

      for (let i = 0; i < images.length; i++) {
        // Temporarily set active image to process it
        get().setActiveImageIndex(i);
        // Need to wait for settings to load
        await new Promise((resolve) => setTimeout(resolve, 0));
        const image = get().images[i];
        const processedCanvas = await get().applyAllChanges(image); // Await the promise
        if (processedCanvas) {
          const dataUrl = processedCanvas.toDataURL("image/png");
          downloadImage(dataUrl, `image-${i + 1}.png`);
        }
      }

      set({ isDownloading: false });
      message.success(`All images exported successfully!`);
    },

    applyAllChanges: async (image) => {
      const { masterSettings } = get();
      const imageData = image || get().images[get().activeImageIndex];
      if (!imageData) return null;

      const settings = imageData.settings || defaultSettings;
      console.log("applyAllChanges: imageData", imageData);
      console.log("applyAllChanges: settings", settings);

      let baseImageSource = imageData.src; // Start with original image source
      if (settings.removeBackground && settings.transparentImage?.src) {
        baseImageSource = settings.transparentImage.src;
      }

      const img = new Image();
      img.src = baseImageSource;

      return new Promise((resolve, reject) => {
        img.onload = async () => {
          try {
            // 1. Generate image with all transformations *except* compression
            const processedCanvasWithoutCompression = await applyImageTransformations(
              img,
              settings,
              { ...masterSettings, applyCompression: false } // Explicitly disable compression
            );
            const dataUrlWithoutCompression = processedCanvasWithoutCompression.toDataURL('image/png'); // Always PNG for the "before compression" view

            // 2. Prepare compressed image details
            let finalCompressedDataUrl = null;
            let finalCompressedSize = null;
            let finalCompressedRatio = null;

            if (masterSettings.applyCompression) {
              // If compression is enabled, generate the compressed version
              const format = settings.selectedFormat === 'webp' ? 'image/webp' : 'image/jpeg';
              const quality = settings.compressionQuality / 100;
              
              // Apply all transformations *including* compression
              const compressedCanvas = await applyImageTransformations(
                img,
                settings,
                masterSettings // Use original masterSettings (with applyCompression: true)
              );
              finalCompressedDataUrl = compressedCanvas.toDataURL(format, quality);
              finalCompressedSize = Math.round((finalCompressedDataUrl.length * 3) / 4);
              finalCompressedRatio = ((imageData.fileSize - finalCompressedSize) / imageData.fileSize) * 100;
              
              get().setCompressedImageDetails(finalCompressedDataUrl, finalCompressedSize, finalCompressedRatio);
              console.log("applyAllChanges: Compression applied. finalCompressedDataUrl:", finalCompressedDataUrl.substring(0, 50) + "...");
              console.log("applyAllChanges: Compression applied. finalCompressedSize:", finalCompressedSize);
              console.log("applyAllChanges: Compression applied. finalCompressedRatio:", finalCompressedRatio);
            } else {
              // If compression is not applied, clear compressed image details
              get().setCompressedImageDetails(null, null, null);
              console.log("applyAllChanges: Compression not applied. Clearing compressed details.");
            }

            // 3. Update store with processedImageUrl (without compression)
            const updatedImages = get().images.map((imgItem, idx) => {
              if (idx === get().activeImageIndex) {
                return {
                  ...imgItem,
                  width: processedCanvasWithoutCompression.width,
                  height: processedCanvasWithoutCompression.height,
                };
              }
              return imgItem;
            });

            set({ 
              processedImageUrl: dataUrlWithoutCompression, // This is the image without compression
              images: updatedImages,
              cropArea: { // Reset cropArea to full image dimensions after processing
                x: 0,
                y: 0,
                width: processedCanvasWithoutCompression.width,
                height: processedCanvasWithoutCompression.height,
              },
            });
            console.log("applyAllChanges: Store state updated. processedImageUrl (without compression):", get().processedImageUrl?.substring(0, 50) + "...");
            console.log("applyAllChanges: Store state updated. compressedImageSrc:", get().compressedImageSrc?.substring(0, 50) + "...");
            console.log("applyAllChanges: Store state updated. compressedSize:", get().compressedSize);
            resolve(processedCanvasWithoutCompression); // Resolve with the non-compressed canvas
          } catch (error) {
            console.error('Error applying all changes:', error);
            set({ processedImageUrl: null, compressedImageSrc: null, compressedSize: null, compressionRatio: null });
            reject(error);
          }
        };
        img.onerror = (error) => {
          console.error('Error loading image for applyAllChanges:', error);
          set({ processedImageUrl: null, compressedImageSrc: null, compressedSize: null, compressionRatio: null });
          reject(error);
        };
      });
    },
  }))
);

// Initialize non-reactive parts
useStore.getState().canvasRef.current = document.createElement("canvas");
useStore.getState().cropCanvasRef.current = document.createElement("canvas");
useStore.getState().previewCanvasRef.current = document.createElement("canvas");



export default useStore;