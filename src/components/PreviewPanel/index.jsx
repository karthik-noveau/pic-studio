import { useState, useCallback } from "react";
import { Button, Modal, Slider, Tag, Progress } from "antd";
import {
  Maximize,
  ZoomIn,
  ZoomOut,
  Minimize as MinimizeIcon,
  RotateCcw,
  Eye,
  ChevronLeft,
  ChevronRight,
  Download,
  Image as ImageIcon,
  Calculator,
  Copy,
  Check,
  Palette,
  Layers,
} from "lucide-react";
import DraggableCrop from "../tabs/crop/draggable-crop";
import styles from "./style.module.css";

export default function PreviewPanel({
  imageData,
  processedImageSrc,
  images,
  activeImageIndex,
  onImageChange,
  formatFileSize,
  activeTool,
  // Compress tab props
  compressionQuality,
  compressedSize,
  compressionRatio,
  // Favicon tab props
  generatedFavicons,
  faviconSizes,
  // Analysis tab props
  copyToClipboard,
  copied,
  // Crop tab props
  cropArea,
  setCropArea,
  showGrid,
  cropContainerRef,
  hasSettingsChanged,
  revertCrop,
}) {
  const [zoom, setZoom] = useState(100);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 25, 200));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 25, 25));
  }, []);

  const handleResetView = useCallback(() => {
    setZoom(100);
    setPan({ x: 0, y: 0 });
  }, []);

  const handleMouseDown = useCallback(
    (e) => {
      if (zoom > 100) {
        setIsPanning(true);
        setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      }
    },
    [zoom, pan]
  );

  const handleMouseMove = useCallback(
    (e) => {
      if (isPanning) {
        setPan({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        });
      }
    },
    [isPanning, panStart]
  );

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  const goToPrevious = useCallback(() => {
    if (activeImageIndex > 0) {
      onImageChange(activeImageIndex - 1);
      handleResetView();
    }
  }, [activeImageIndex, onImageChange, handleResetView]);

  const goToNext = useCallback(() => {
    if (activeImageIndex < images.length - 1) {
      onImageChange(activeImageIndex + 1);
      handleResetView();
    }
  }, [activeImageIndex, images.length, onImageChange, handleResetView]);

  if (!imageData) {
    return (
      <div className={styles.previewPanel}>
        <div className={styles.emptyState}>
          <Eye className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>No Image Selected</h3>
          <p className={styles.emptyDesc}>
            Upload an image from the Home page to start editing
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.previewPanel}>
      {/* Header */}
      <div className={styles.previewHeader}>
        <div className={styles.headerLeft}>
          <h3 className={styles.previewTitle}>Live Preview</h3>
          <Tag color="blue" className={styles.liveTag}>
            Real-time sync
          </Tag>
        </div>
        <div className={styles.headerRight}>
          <span className={styles.imageInfo}>
            {imageData.width} × {imageData.height}px
          </span>
          <span className={styles.separator}>•</span>
          <span className={styles.imageInfo}>
            {formatFileSize(imageData.fileSize)}
          </span>
        </div>
      </div>

      {/* Image Navigation */}
      {images.length > 1 && (
        <div className={styles.imageNavigation}>
          <Button
            icon={<ChevronLeft />}
            onClick={goToPrevious}
            disabled={activeImageIndex === 0}
            size="small"
          >
            Previous
          </Button>
          <span className={styles.imageCounter}>
            {activeImageIndex + 1} / {images.length}
          </span>
          <Button
            icon={<ChevronRight />}
            onClick={goToNext}
            disabled={activeImageIndex === images.length - 1}
            size="small"
          >
            Next
          </Button>
        </div>
      )}

      {/* Crop Tab - Draggable Crop Interface */}
      {activeTool === "crop" && imageData && (
        <div className={styles.cropPreviewSection}>
          <div
            ref={cropContainerRef}
            className={styles.cropContainer}
            style={{
              aspectRatio: `${imageData.width}/${imageData.height}`,
            }}
          >
            <img
              src={processedImageSrc || imageData.src}
              alt="Crop preview"
              className={styles.cropImage}
            />

            {/* Grid overlay */}
            {showGrid && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  display: "grid",
                  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
                  gridTemplateRows: "repeat(3, minmax(0, 1fr))",
                  pointerEvents: "none",
                  zIndex: 1,
                }}
              >
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    style={{ border: "1px solid rgba(255, 255, 255, 0.5)" }}
                  />
                ))}
              </div>
            )}

            <DraggableCrop
              imageData={imageData}
              cropArea={cropArea}
              setCropArea={setCropArea}
              showGrid={false}
              containerRef={cropContainerRef}
            />
          </div>
        </div>
      )}

      {/* Analysis Tab - Simple Image Preview */}
      {activeTool === "analysis" && imageData && (
        <div className={styles.previewContainer}>
          <div className={styles.imageWrapper}>
            <img
              src={imageData.src}
              alt={imageData.fileName}
              className={styles.previewImage}
            />
          </div>
          <Button
            className={styles.fullscreenButton}
            icon={<Maximize />}
            onClick={() => setShowFullscreen(true)}
            type="primary"
            size="large"
          >
            View Fullscreen
          </Button>
        </div>
      )}

      {/* Compress Tab - Comparison Slider */}
      {activeTool === "compress" && imageData && (
        <div className={styles.compressComparisonSection}>
          <div className={styles.comparisonHeader}>
            <h4 className={styles.comparisonTitle}>Before & After Comparison</h4>
            <div className={styles.comparisonStats}>
              <Tag color="orange">Quality: {compressionQuality}%</Tag>
              {compressedSize && (
                <Tag color="green">
                  Saved: {formatFileSize(imageData.fileSize - compressedSize)} ({compressionRatio?.toFixed(1)}%)
                </Tag>
              )}
            </div>
          </div>
          <div className={styles.comparisonSlider}>
            <ComparisonSlider
              originalSrc={imageData.src}
              compressedSrc={processedImageSrc || imageData.src}
              originalSize={imageData.fileSize}
              compressedSize={compressedSize || imageData.fileSize}
              formatFileSize={formatFileSize}
            />
          </div>
        </div>
      )}

      {/* Favicon Tab - Preview Grid */}
      {activeTool === "favicon" && imageData && (
        <div className={styles.faviconPreviewSection}>
          <div className={styles.faviconHeader}>
            <h4 className={styles.faviconTitle}>Favicon Preview</h4>
            <p className={styles.faviconDesc}>Preview how your image looks at different sizes</p>
          </div>
          <div className={styles.faviconGrid}>
            {(faviconSizes || [16, 32, 48, 64, 128, 256]).map((size) => (
              <div key={size} className={styles.faviconItem}>
                <div
                  className={styles.faviconWrapper}
                  style={{
                    width: Math.min(size, 128),
                    height: Math.min(size, 128)
                  }}
                >
                  <img
                    src={processedImageSrc || imageData.src}
                    alt={`Favicon ${size}x${size}`}
                    className={styles.faviconImage}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'contain',
                    }}
                  />
                </div>
                <span className={styles.faviconSize}>{size}×{size}px</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Preview Container - Default for other tabs */}
      {activeTool !== "compress" && activeTool !== "favicon" && activeTool !== "analysis" && activeTool !== "crop" && (
        <div className={styles.previewContainer}>
        <div
          className={styles.imageWrapper}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            cursor: zoom > 100 ? (isPanning ? "grabbing" : "grab") : "default",
          }}
        >
          <img
            src={processedImageSrc || imageData.src}
            alt={imageData.fileName}
            className={styles.previewImage}
            style={{
              transform: `scale(${zoom / 100}) translate(${pan.x}px, ${pan.y}px)`,
              transition: isPanning ? "none" : "transform 0.2s ease",
            }}
          />
        </div>

        {/* Fullscreen Button */}
        <Button
          icon={<Maximize />}
          onClick={() => setShowFullscreen(true)}
          className={styles.fullscreenButton}
          type="primary"
        >
          Fullscreen
        </Button>
      </div>
      )}

      {/* Zoom Controls - Hide for compress, favicon, analysis, and crop tabs */}
      {activeTool !== "compress" && activeTool !== "favicon" && activeTool !== "analysis" && activeTool !== "crop" && (
      <div className={styles.zoomControls}>
        <Button
          icon={<ZoomOut />}
          onClick={handleZoomOut}
          disabled={zoom <= 25}
          size="small"
        />
        <Slider
          min={25}
          max={200}
          step={25}
          value={zoom}
          onChange={setZoom}
          className={styles.zoomSlider}
          tooltip={{ formatter: (value) => `${value}%` }}
        />
        <Button
          icon={<ZoomIn />}
          onClick={handleZoomIn}
          disabled={zoom >= 200}
          size="small"
        />
        <span className={styles.zoomValue}>{zoom}%</span>
        <Button
          icon={<RotateCcw />}
          onClick={handleResetView}
          size="small"
          className={styles.resetButton}
        >
          Reset
        </Button>
      </div>
      )}

      {/* Fullscreen Modal */}
      <Modal
        open={showFullscreen}
        onCancel={() => setShowFullscreen(false)}
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
          <MinimizeIcon
            style={{ color: "white", width: "24px", height: "24px" }}
          />
        }
      >
        <div className={styles.fullscreenContent}>
          <img
            src={processedImageSrc || imageData.src}
            alt={imageData.fileName}
            style={{
              maxWidth: "100%",
              maxHeight: "calc(90vh - 100px)",
              objectFit: "contain",
            }}
          />
          <div className={styles.fullscreenInfo}>
            <div className={styles.fullscreenTitle}>{imageData.fileName}</div>
            <div className={styles.fullscreenMeta}>
              {imageData.width} × {imageData.height}px • {formatFileSize(imageData.fileSize)}
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}

// Comparison Slider Component for Compress Tab
function ComparisonSlider({ originalSrc, compressedSrc, originalSize, compressedSize, formatFileSize }) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = () => setIsDragging(true);
  const handleMouseUp = () => setIsDragging(false);

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    setSliderPosition(Math.min(Math.max(percentage, 0), 100));
  };

  return (
    <div
      className={styles.comparisonContainer}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Original Image (Left) */}
      <div className={styles.comparisonImageWrapper}>
        <img
          src={originalSrc}
          alt="Original"
          className={styles.comparisonImage}
        />
        <div className={styles.comparisonLabel} style={{ left: '10px' }}>
          <span className={styles.labelText}>Original</span>
          <span className={styles.labelSize}>{formatFileSize(originalSize)}</span>
        </div>
      </div>

      {/* Compressed Image (Right) with Clip */}
      <div
        className={styles.comparisonImageWrapper}
        style={{
          clipPath: `inset(0 0 0 ${sliderPosition}%)`,
        }}
      >
        <img
          src={compressedSrc}
          alt="Compressed"
          className={styles.comparisonImage}
        />
        <div className={styles.comparisonLabel} style={{ right: '10px' }}>
          <span className={styles.labelText}>Compressed</span>
          <span className={styles.labelSize}>{formatFileSize(compressedSize)}</span>
        </div>
      </div>

      {/* Slider Handle */}
      <div
        className={styles.sliderHandle}
        style={{ left: `${sliderPosition}%` }}
        onMouseDown={handleMouseDown}
      >
        <div className={styles.sliderLine} />
        <div className={styles.sliderButton}>
          <ChevronLeft className={styles.sliderIcon} />
          <ChevronRight className={styles.sliderIcon} />
        </div>
      </div>
    </div>
  );
}
