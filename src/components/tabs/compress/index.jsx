import { useState, useEffect, useRef } from "react";
import { Button, Typography, Slider, Tag, Space } from "antd";
import {
  Minimize,
  RotateCcw,
  Download,
  Maximize,
  Zap,
  Info,
} from "lucide-react";
import styles from "./style.module.css";

import {
  smartCompress,
  analyzeImageComplexity,
} from "../../../common/advancedCompression";

const { Text } = Typography;

export default function CompressTab({
  imageData,
  processedImageSrc,
  compressionQuality,
  setCompressionQuality,
  debouncedSetCompressionQuality,
  formatFileSize,
  reduceFileSize,
  hasSettingsChanged,
  revertCompression,

  openFullscreen,
  isDownloading,
}) {
  // Use processed image if available, otherwise use original
  const displaySrc = processedImageSrc || imageData?.src || "/placeholder.svg";

  const [comparisonPosition, setComparisonPosition] = useState(50);
  const [compressedPreview, setCompressedPreview] = useState(null);
  const [compressedSize, setCompressedSize] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const comparisonRef = useRef(null);

  // Advanced compression state
  const [smartCompressResult, setSmartCompressResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [imageComplexity, setImageComplexity] = useState(null);

  // Temporary slider value for smooth interaction
  const [tempQuality, setTempQuality] = useState(compressionQuality);

  // Sync temp value when compression quality changes
  useEffect(() => {
    setTempQuality(compressionQuality);
  }, [compressionQuality]);

  // Generate compressed preview when quality changes
  useEffect(() => {
    if (!imageData) return;

    const generatePreview = () => {
      const canvas = document.createElement("canvas");
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        const quality = compressionQuality / 100;
        const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
        const estimatedSize = Math.round((compressedDataUrl.length * 3) / 4);

        setCompressedPreview(compressedDataUrl);
        setCompressedSize(estimatedSize);
      };

      img.src = displaySrc;
    };

    const timeoutId = setTimeout(generatePreview, 300);
    return () => clearTimeout(timeoutId);
  }, [compressionQuality, imageData, displaySrc]);

  const handleMouseDown = (e) => {
    setIsDragging(true);
    updatePosition(e);
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    updatePosition(e);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const updatePosition = (e) => {
    if (!comparisonRef.current) return;
    const rect = comparisonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setComparisonPosition(percentage);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging]);

  // Analyze image complexity on load
  useEffect(() => {
    if (!imageData) return;

    const analyzeImage = () => {
      const canvas = document.createElement("canvas");
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        const complexity = analyzeImageComplexity(canvas, ctx);
        setImageComplexity(complexity);
      };

      img.src = displaySrc;
    };

    analyzeImage();
  }, [imageData, displaySrc]);

  // Smart compress function
  const handleSmartCompress = async () => {
    if (!imageData) return;

    setIsAnalyzing(true);

    try {
      const canvas = document.createElement("canvas");
      const img = new Image();

      img.onload = async () => {
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        const result = await smartCompress(
          canvas,
          ctx,
          imageData.fileSize,
          imageData.analysis?.hasTransparency || false
        );

        setSmartCompressResult(result);
        setCompressedPreview(result.dataUrl);
        setCompressedSize(result.size);
        setCompressionQuality(result.quality); // Update slider to match smart compression
        setIsAnalyzing(false);
      };

      img.src = displaySrc;
    } catch (error) {
      console.error("Smart compression error:", error);
      setIsAnalyzing(false);
    }
  };

  // Auto-run smart compression when image loads (default compression)
  useEffect(() => {
    if (imageData) {
      // Clear previous result and run fresh compression for new image
      setSmartCompressResult(null);
      handleSmartCompress();
    }
  }, [displaySrc]); // Re-run when processed image changes

  // Download compressed image using smart compression result
  const downloadSmartCompressed = () => {
    if (!smartCompressResult) {
      // Fallback to manual compression if smart compression hasn't run
      reduceFileSize();
      return;
    }

    const link = document.createElement("a");
    link.href = smartCompressResult.dataUrl;
    const fileName = imageData.fileName || "image";
    const baseName = fileName.replace(/\.[^/.]+$/, ""); // Remove extension
    link.download = `compressed-smart-${smartCompressResult.quality}q-${baseName}.${smartCompressResult.format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Show success message
    const compressionRatio = smartCompressResult.sizeReduction;
    const message = `File compressed using AI optimization! Reduced by ${compressionRatio}% to ${formatFileSize(
      smartCompressResult.size
    )} while maintaining ${smartCompressResult.perceptualQuality?.toFixed(
      1
    )}% visual quality.`;
    console.log(message);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.titleContent}>
            <div className={styles.iconWrapper}>
              <Minimize
                style={{ width: "20px", height: "20px", color: "#ea580c" }}
              />
            </div>
            File Size Reducer
          </div>
          <div className={styles.cardHeaderRight}>
            {hasSettingsChanged().compression && (
              <Button
                onClick={revertCompression}
                size="small"
                className={styles.revertButton}
                icon={<RotateCcw style={{ width: "16px", height: "16px" }} />}
              >
                Revert
              </Button>
            )}
            <Text type="secondary" className={styles.extraText}>
              AI-powered perceptual compression - maximum file size reduction
              while preserving HD visual quality
            </Text>
          </div>
        </div>
        <div className={styles.cardContent}>
        <div className={styles.content}>
          <div className={styles.grid}>
            <div className={styles.leftColumn}>
              <div className={styles.sliderSection}>
                <Text strong className={styles.sliderLabel}>
                  Compression Quality: {tempQuality}%
                </Text>
                <Slider
                  value={tempQuality}
                  onChange={(value) => setTempQuality(value)}
                  onAfterChange={(value) => setCompressionQuality(value)}
                  max={100}
                  min={10}
                  step={5}
                />
                <div className={styles.sliderMarkers}>
                  <span>Smaller file</span>
                  <span>Better quality</span>
                </div>
              </div>

              <div className={styles.presetsSection}>
                <Text strong className={styles.presetsTitle}>
                  Recommended Settings
                </Text>
                <div className={styles.presetsGrid}>
                  <Button
                    size="small"
                    onClick={() => setCompressionQuality(85)}
                    className={styles.presetButton}
                  >
                    High Quality (85%)
                  </Button>
                  <Button
                    size="small"
                    onClick={() => setCompressionQuality(70)}
                    className={styles.presetButton}
                  >
                    Balanced (70%)
                  </Button>
                  <Button
                    size="small"
                    onClick={() => setCompressionQuality(50)}
                    className={styles.presetButton}
                  >
                    Web Optimized (50%)
                  </Button>
                  <Button
                    size="small"
                    onClick={() => setCompressionQuality(30)}
                    className={styles.presetButton}
                  >
                    Ultra Compression (30%)
                  </Button>
                </div>
              </div>

              {/* Smart Compression */}
              <div className={styles.smartCompressSection}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: "12px",
                  }}
                >
                  <Text strong className={styles.presetsTitle}>
                    <Zap
                      style={{
                        width: "16px",
                        height: "16px",
                        marginRight: "6px",
                        display: "inline",
                        verticalAlign: "middle",
                      }}
                    />
                    AI-Powered Smart Compression (Active by Default)
                  </Text>
                </div>
                {isAnalyzing && (
                  <div
                    style={{
                      padding: "10px",
                      backgroundColor: "#eff6ff",
                      borderRadius: "6px",
                      marginBottom: "12px",
                      border: "1px solid #3b82f6",
                    }}
                  >
                    <Text style={{ fontSize: "12px", color: "#1e40af" }}>
                      🔍 Analyzing your image and finding optimal compression
                      settings...
                    </Text>
                  </div>
                )}

                {imageComplexity && (
                  <div className={styles.complexityInfo}>
                    <Space
                      direction="vertical"
                      size="small"
                      style={{ width: "100%" }}
                    >
                      <div
                        style={{
                          display: "flex",
                          gap: "8px",
                          flexWrap: "wrap",
                        }}
                      >
                        <Tag
                          color={
                            imageComplexity.complexity === "high"
                              ? "red"
                              : imageComplexity.complexity === "medium"
                              ? "orange"
                              : "green"
                          }
                        >
                          {imageComplexity.complexity.toUpperCase()} DETAIL
                        </Tag>
                        <Tag color="blue">
                          Recommended: {imageComplexity.recommendedQuality}%
                        </Tag>
                      </div>
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        <Info
                          style={{
                            width: "12px",
                            height: "12px",
                            marginRight: "4px",
                            display: "inline",
                            verticalAlign: "middle",
                          }}
                        />
                        Edge density: {imageComplexity.edgePercentage}% •
                        Variance: {imageComplexity.avgVariance}
                      </Text>
                    </Space>
                  </div>
                )}

                <Button
                  type="primary"
                  onClick={handleSmartCompress}
                  loading={isAnalyzing}
                  className={styles.smartCompressButton}
                  size="large"
                  icon={<Zap style={{ width: "16px", height: "16px" }} />}
                  style={{
                    width: "100%",
                    marginTop: "12px",
                    background: smartCompressResult
                      ? "linear-gradient(135deg, #10b981 0%, #059669 100%)"
                      : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    borderColor: smartCompressResult ? "#10b981" : "#667eea",
                  }}
                >
                  {isAnalyzing
                    ? "Optimizing Quality & Size..."
                    : smartCompressResult
                    ? "✓ Re-optimize Compression"
                    : "Smart Compress (Auto-Run)"}
                </Button>
                <Text
                  type="secondary"
                  style={{
                    fontSize: "11px",
                    display: "block",
                    marginTop: "8px",
                    textAlign: "center",
                  }}
                >
                  {smartCompressResult
                    ? "✓ Smart compression active - downloads use AI-optimized settings automatically"
                    : "AI finds optimal compression while maintaining 92%+ HD visual quality"}
                </Text>

                {smartCompressResult && (
                  <div className={styles.smartResult}>
                    <div className={styles.smartResultHeader}>
                      <Text
                        strong
                        style={{ color: "#10b981", fontSize: "14px" }}
                      >
                        ✓ Optimization Complete!
                      </Text>
                    </div>
                    <Space
                      direction="vertical"
                      size="small"
                      style={{ width: "100%", marginTop: "8px" }}
                    >
                      {smartCompressResult.perceptualQuality && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            padding: "10px",
                            backgroundColor:
                              smartCompressResult.perceptualQuality >= 92
                                ? "#f0fdf4"
                                : "#fef3c7",
                            borderRadius: "6px",
                            border: `2px solid ${
                              smartCompressResult.perceptualQuality >= 92
                                ? "#10b981"
                                : "#f59e0b"
                            }`,
                          }}
                        >
                          <Text strong style={{ fontSize: "13px" }}>
                            HD Visual Quality:
                          </Text>
                          <Tag
                            color={
                              smartCompressResult.perceptualQuality >= 92
                                ? "green"
                                : "orange"
                            }
                            style={{ fontWeight: "bold", fontSize: "13px" }}
                          >
                            {smartCompressResult.perceptualQuality.toFixed(1)}%
                            preserved
                          </Tag>
                        </div>
                      )}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text type="secondary">Size Reduction:</Text>
                        <Tag
                          color="green"
                          style={{ fontWeight: "bold", fontSize: "13px" }}
                        >
                          -{smartCompressResult.sizeReduction}% (
                          {formatFileSize(
                            smartCompressResult.originalSize -
                              smartCompressResult.size
                          )}{" "}
                          saved)
                        </Tag>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text type="secondary">Format:</Text>
                        <Tag color="purple">
                          {smartCompressResult.format.toUpperCase()}
                        </Tag>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text type="secondary">Compression Quality:</Text>
                        <Text strong>{smartCompressResult.quality}%</Text>
                      </div>
                      {smartCompressResult.wasDownsampled && (
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                          }}
                        >
                          <Text type="secondary">Resolution:</Text>
                          <Tag color="cyan">
                            Optimized (-
                            {Math.round(
                              (1 - smartCompressResult.downsampleScale) * 100
                            )}
                            %)
                          </Tag>
                        </div>
                      )}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          marginTop: "4px",
                        }}
                      >
                        <Text type="secondary" style={{ fontSize: "11px" }}>
                          Original size:
                        </Text>
                        <Text style={{ fontSize: "11px" }}>
                          {formatFileSize(smartCompressResult.originalSize)}
                        </Text>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                        }}
                      >
                        <Text type="secondary" style={{ fontSize: "11px" }}>
                          Compressed size:
                        </Text>
                        <Text
                          strong
                          style={{ fontSize: "11px", color: "#10b981" }}
                        >
                          {formatFileSize(smartCompressResult.size)}
                        </Text>
                      </div>
                      <div
                        style={{
                          padding: "10px",
                          backgroundColor: "#f0fdf4",
                          borderRadius: "6px",
                          marginTop: "8px",
                        }}
                      >
                        <Text style={{ fontSize: "12px", color: "#15803d" }}>
                          {smartCompressResult.recommendation}
                        </Text>
                      </div>
                    </Space>
                  </div>
                )}
              </div>

              {imageData.fileSize && (
                <div className={styles.statsContainer}>
                  <div className={styles.statsContent}>
                    <div className={styles.statRow}>
                      <span className={styles.statLabel}>Original size:</span>
                      <span className={styles.statValue}>
                        {formatFileSize(imageData.fileSize)}
                      </span>
                    </div>
                    <div className={styles.statRow}>
                      <span className={styles.statLabel}>Compressed size:</span>
                      <span className={styles.statValue}>
                        {formatFileSize(
                          compressedSize ||
                            Math.round(
                              imageData.fileSize * (compressionQuality / 100)
                            )
                        )}
                      </span>
                    </div>
                    <div className={styles.statRow}>
                      <span className={styles.statLabel}>Savings:</span>
                      <span className={styles.statValueGreen}>
                        {Math.round(100 - compressionQuality)}% reduction
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Before/After Comparison Slider */}
              {compressedPreview && (
                <div className={styles.comparisonSection}>
                  <Text
                    strong
                    style={{ marginBottom: "8px", display: "block" }}
                  >
                    Before/After Comparison
                  </Text>
                  <div
                    ref={comparisonRef}
                    className={styles.comparisonContainer}
                    onMouseDown={handleMouseDown}
                  >
                    {/* Fullscreen button */}
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        openFullscreen();
                      }}
                      style={{
                        position: "absolute",
                        top: "12px",
                        right: "12px",
                        zIndex: 30,
                        cursor: "pointer",
                        backgroundColor: "rgba(0, 0, 0, 0.7)",
                        borderRadius: "50%",
                        padding: "8px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      title="View fullscreen"
                    >
                      <Maximize
                        style={{
                          width: "20px",
                          height: "20px",
                          color: "white",
                        }}
                      />
                    </div>

                    {/* Compressed image (full) */}
                    <div className={styles.comparisonImageWrapper}>
                      <img
                        src={compressedPreview}
                        alt="Compressed"
                        className={styles.comparisonImage}
                      />
                      <div
                        className={styles.comparisonLabel}
                        style={{ right: "8px" }}
                      >
                        After ({tempQuality}%)
                      </div>
                    </div>

                    {/* Original image (clipped) */}
                    <div
                      className={styles.comparisonImageWrapper}
                      style={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        clipPath: `inset(0 ${100 - comparisonPosition}% 0 0)`,
                      }}
                    >
                      <img
                        src={displaySrc}
                        alt="Original"
                        className={styles.comparisonImage}
                      />
                      <div
                        className={styles.comparisonLabel}
                        style={{ left: "8px" }}
                      >
                        Before (Original)
                      </div>
                    </div>

                    {/* Slider handle */}
                    <div
                      className={styles.comparisonSlider}
                      style={{ left: `${comparisonPosition}%` }}
                    >
                      <div className={styles.comparisonHandle}>
                        <div className={styles.comparisonHandleIcon}>⟷</div>
                      </div>
                    </div>
                  </div>
                  <div className={styles.comparisonHint}>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      Drag the slider to compare original vs compressed
                    </Text>
                  </div>
                </div>
              )}

              <Button
                type="primary"
                onClick={downloadSmartCompressed}
                className={styles.downloadButton}
                size="large"
                icon={<Download style={{ width: "16px", height: "16px" }} />}
                disabled={isAnalyzing}
                loading={isAnalyzing || isDownloading}
              >
                {isAnalyzing ? "Optimizing..." : "Download Compressed Image"}
              </Button>
              {smartCompressResult && (
                <Text
                  type="secondary"
                  style={{
                    fontSize: "11px",
                    display: "block",
                    marginTop: "8px",
                    textAlign: "center",
                  }}
                >
                  Using AI-optimized compression (
                  {smartCompressResult.format.toUpperCase()} @{" "}
                  {smartCompressResult.quality}% quality)
                </Text>
              )}
            </div>

            <div className={styles.rightColumn}>
              <div className={styles.analysisSection}>
                <Text strong className={styles.analysisSectionTitle}>
                  Compression Analysis
                </Text>
                <div className={styles.analysisSection}>
                  <div className={`${styles.infoBox} ${styles.infoBoxBlue}`}>
                    <div
                      className={`${styles.infoBoxTitle} ${styles.infoBoxTitleBlue}`}
                    >
                      Format Recommendations
                    </div>
                    <div
                      className={`${styles.infoBoxContent} ${styles.infoBoxContentBlue}`}
                    >
                      {imageData.analysis?.hasTransparency
                        ? "Keep PNG format to preserve transparency"
                        : "JPEG recommended for photos, WebP for best compression"}
                    </div>
                  </div>

                  <div className={`${styles.infoBox} ${styles.infoBoxGreen}`}>
                    <div
                      className={`${styles.infoBoxTitle} ${styles.infoBoxTitleGreen}`}
                    >
                      Quality Guidelines
                    </div>
                    <div
                      className={`${styles.infoBoxContent} ${styles.infoBoxContentGreen} ${styles.guidelinesList}`}
                    >
                      <div>• 90-100%: Print quality</div>
                      <div>• 80-90%: High web quality</div>
                      <div>• 60-80%: Standard web</div>
                      <div>• 40-60%: Thumbnails</div>
                    </div>
                  </div>

                  {imageData.fileSize && imageData.fileSize > 1024 * 1024 && (
                    <div className={`${styles.infoBox} ${styles.infoBoxAmber}`}>
                      <div
                        className={`${styles.infoBoxTitle} ${styles.infoBoxTitleAmber}`}
                      >
                        Size Warning
                      </div>
                      <div
                        className={`${styles.infoBoxContent} ${styles.infoBoxContentAmber}`}
                      >
                        Large file detected. Consider 60-70% quality for web
                        use.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
