import { useState, useRef, useCallback } from "react";
import { Button, message, Card, Empty } from "antd";
import {
  Upload as UploadIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  X,
  Maximize,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import styles from "./style.module.css";

export default function Home({ onNavigateToStudio, images, setImages, processImage }) {
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = useCallback(
    (files) => {
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
              setImages((prev) => [...prev, ...newImages]);
              setIsLoading(false);
              message.success(
                `${files.length} image${
                  files.length > 1 ? "s" : ""
                } uploaded successfully`
              );
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
    [processImage, setImages]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      const files = Array.from(e.dataTransfer.files);
      handleFileUpload(files);
    },
    [handleFileUpload]
  );

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleUrlSubmit = useCallback(async () => {
    if (!imageUrl.trim()) return;

    try {
      new URL(imageUrl);
    } catch {
      message.error("Invalid URL. Please enter a valid image URL.");
      return;
    }

    setIsLoading(true);

    const loadWithFetch = async (url) => {
      const corsProxies = [
        (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
        (u) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
        (u) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
        // Fallback: try direct with crossorigin
        (u) => u,
      ];

      for (let i = 0; i < corsProxies.length; i++) {
        const proxyFn = corsProxies[i];
        try {
          const proxyUrl = proxyFn(url);
          console.log(`Trying proxy ${i + 1}/${corsProxies.length}:`, proxyUrl.substring(0, 50) + '...');

          const response = await fetch(proxyUrl, {
            method: "GET",
            headers: { Accept: "image/*" },
            mode: i === corsProxies.length - 1 ? 'cors' : 'cors',
          });

          if (!response.ok) {
            console.log(`Proxy ${i + 1} failed with status:`, response.status);
            continue;
          }

          const blob = await response.blob();

          // Verify it's actually an image
          if (!blob.type.startsWith('image/')) {
            console.log(`Proxy ${i + 1} returned non-image type:`, blob.type);
            continue;
          }

          console.log(`Proxy ${i + 1} succeeded!`);

          return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
              const dataUrl = reader.result;
              const img = new Image();
              img.onload = () => {
                const estimatedSize = blob.size;
                resolve({ img, dataUrl, estimatedSize });
              };
              img.onerror = () => reject(new Error('Failed to load image from blob'));
              img.src = dataUrl;
            };
            reader.onerror = () => reject(new Error('Failed to read blob as data URL'));
            reader.readAsDataURL(blob);
          });
        } catch (e) {
          console.log(`Proxy ${i + 1} failed:`, e.message);
        }
      }

      throw new Error("All proxy methods failed");
    };

    const tryDirectLoad = () => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        const timeout = setTimeout(() => {
          reject(new Error("TIMEOUT"));
        }, 15000);

        img.onload = () => {
          clearTimeout(timeout);
          try {
            const canvas = document.createElement("canvas");
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;
            const ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL("image/png");
            const estimatedSize = Math.round((dataUrl.length * 3) / 4);
            console.log('Direct load succeeded!');
            resolve({ img, dataUrl, estimatedSize, method: "direct" });
          } catch (canvasError) {
            console.log('Direct load failed due to CORS:', canvasError.message);
            reject(new Error("CORS_BLOCKED"));
          }
        };

        img.onerror = () => {
          clearTimeout(timeout);
          console.log('Direct load failed - image error');
          reject(new Error("LOAD_FAILED"));
        };

        // Add crossorigin attribute to try to avoid CORS issues
        img.crossOrigin = "anonymous";
        img.src = imageUrl;
      });
    };

    try {
      let result;
      let method = "direct";

      console.log('Starting URL load for:', imageUrl);

      try {
        console.log('Attempting direct load...');
        result = await tryDirectLoad();
        method = result.method;
      } catch (error) {
        console.log('Direct load error:', error.message);
        if (error.message === "CORS_BLOCKED" || error.message === "LOAD_FAILED" || error.message === "TIMEOUT") {
          message.info("Direct load failed, trying proxy servers...", 2);
          try {
            result = await loadWithFetch(imageUrl);
            method = "proxy";
          } catch (proxyError) {
            console.error('All loading methods failed:', proxyError);
            throw new Error(
              'Unable to load image from URL. This could be because:\n' +
              '1. The image URL is not accessible\n' +
              '2. The server blocks external access (CORS)\n' +
              '3. The URL is not a direct image link\n\n' +
              'Try: Right-click the image and "Save image as", then upload the file directly.'
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

      setImages((prev) => [...prev, newImage]);
      setIsLoading(false);
      if (method === "proxy") {
        message.success("Image loaded via proxy server successfully!");
      } else {
        message.success("Image loaded directly from URL successfully!");
      }
      setImageUrl("");
    } catch (error) {
      console.error("URL loading error:", error);
      setIsLoading(false);
      const errorMsg = error.message || "Failed to load image from URL. Please check if the URL is correct and accessible.";
      message.error(errorMsg, 5);
    }
  }, [imageUrl, processImage, setImages]);

  const handlePaste = useCallback(
    async (e) => {
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
        handleFileUpload(imageFiles);
      }
    },
    [handleFileUpload]
  );

  const deleteImage = useCallback(
    (indexToDelete) => {
      setImages((prev) => prev.filter((_, idx) => idx !== indexToDelete));
      message.success("Image removed from gallery");
    },
    [setImages]
  );

  return (
    <div className={styles.homeContainer} onPaste={handlePaste}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.logoSection}>
            <div className={styles.iconWrapper}>
              <Sparkles className={styles.sparkleIcon} />
            </div>
            <div className={styles.titleSection}>
              <h1 className={styles.title}>Split View Image Studio</h1>
              <p className={styles.subtitle}>
                by Skynoveau Technology - Pro-Level Image Editing
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.mainContent}>
        {/* Upload Section */}
        <Card className={styles.uploadCard}>
          <div className={styles.uploadHeader}>
            <h2 className={styles.sectionTitle}>Upload Your Images</h2>
            <p className={styles.sectionDesc}>
              Upload multiple files, paste from clipboard, or load from URL
            </p>
          </div>

          {/* Drag and Drop Zone */}
          <div
            className={`${styles.dropZone} ${dragActive ? styles.dropZoneActive : ""}`}
            onDrop={handleDrop}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                handleFileUpload(files);
                if (fileInputRef.current) {
                  fileInputRef.current.value = "";
                }
              }}
              className={styles.hiddenInput}
            />
            <UploadIcon className={styles.uploadIcon} />
            <h3 className={styles.dropZoneTitle}>
              Drop images here or click to browse
            </h3>
            <p className={styles.dropZoneDesc}>
              Supports PNG, JPG, WEBP, and more. Upload multiple files at once.
            </p>
            <Button type="primary" size="large" className={styles.browseButton}>
              Browse Files
            </Button>
          </div>

          {/* URL Input */}
          <div className={styles.urlSection}>
            <div className={styles.divider}>
              <span className={styles.dividerText}>OR</span>
            </div>
            <div className={styles.urlInputWrapper}>
              <LinkIcon className={styles.linkIcon} />
              <input
                type="text"
                placeholder="Paste image URL here..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleUrlSubmit();
                  }
                }}
                className={styles.urlInput}
              />
              <Button
                type="primary"
                onClick={handleUrlSubmit}
                loading={isLoading}
                className={styles.loadButton}
              >
                Load
              </Button>
            </div>
          </div>
        </Card>

        {/* Gallery Section */}
        {images.length > 0 && (
          <Card className={styles.galleryCard}>
            <div className={styles.galleryHeader}>
              <div className={styles.galleryTitleSection}>
                <ImageIcon className={styles.galleryIcon} />
                <div>
                  <h2 className={styles.sectionTitle}>Image Gallery</h2>
                  <p className={styles.sectionDesc}>
                    {images.length} image{images.length > 1 ? "s" : ""} ready for editing
                  </p>
                </div>
              </div>
              <Button
                type="primary"
                size="large"
                icon={<ArrowRight />}
                onClick={() => onNavigateToStudio()}
                className={styles.studioButton}
              >
                Open in Studio
              </Button>
            </div>

            <div className={styles.galleryGrid}>
              {images.map((image, index) => (
                <div key={image.id} className={styles.galleryItem}>
                  <div className={styles.imageContainer}>
                    <img
                      src={image.src}
                      alt={image.fileName}
                      className={styles.galleryImage}
                    />
                    <button
                      className={styles.deleteButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteImage(index);
                      }}
                    >
                      <X className={styles.deleteIcon} />
                    </button>
                    <div className={styles.imageOverlay}>
                      <Maximize className={styles.maximizeIcon} />
                    </div>
                  </div>
                  <div className={styles.imageInfo}>
                    <p className={styles.imageName}>{image.fileName}</p>
                    <p className={styles.imageMeta}>
                      {image.width} × {image.height}px
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Empty State */}
        {images.length === 0 && !isLoading && (
          <Card className={styles.emptyCard}>
            <Empty
              description={
                <span className={styles.emptyText}>
                  No images uploaded yet. Start by uploading or pasting images above.
                </span>
              }
            />
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <Card className={styles.loadingCard}>
            <div className={styles.loadingContent}>
              <div className={styles.spinner} />
              <p className={styles.loadingText}>Processing your image...</p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
