import { useCallback, useEffect, useRef, useState } from "react";

import { Button, Slider, Space, Switch, Tag, Typography } from "antd";
import {
  Download,
  Info,
  Minimize,
  RotateCcw,
  Zap,
} from "lucide-react";

import useStore from "@common/store/use-store";
import {
  analyzeImageComplexity,
  smartCompress,
} from "@common/utils/advanced-compression";
import { formatFileSize } from "@common/utils/formatters";

import TabSection from "../../tab-section"; // Import TabSection

import styles from "./style.module.css";

const { Text } = Typography;

export default function CompressTab({ isBulkMode }) {
  const store = useStore();
  const {
    images,
    activeImageIndex,
    processedImage,
    compressionQuality,
    setCompressionQuality,
    reduceFileSize,
    hasSettingsChanged,
    revertCompression,
    setCompressedImageDetails,
    applyAllChanges,
  } = store;
  const imageData = images[activeImageIndex] || null;

  const displaySrc = processedImage?.src || imageData?.src || "/placeholder.svg";

  const [compressedSize, setCompressedSize] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const comparisonRef = useRef(null);

  const [smartCompressResult, setSmartCompressResult] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [imageComplexity, setImageComplexity] = useState(null);

  const [tempQuality, setTempQuality] = useState(compressionQuality);
  const [isCustomCompressionEnabled, setIsCustomCompressionEnabled] = useState(false);

  useEffect(() => {
    setTempQuality(compressionQuality);
  }, [compressionQuality]);

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

        setCompressedSize(estimatedSize);
      };

      img.src = displaySrc;
    };

    const timeoutId = setTimeout(generatePreview, 300);
    return () => clearTimeout(timeoutId);
  }, [compressionQuality, imageData, displaySrc]);

  const handleMouseMove = useCallback((e) => {
    if (!isDragging) return;
    updatePosition(e);
  }, [isDragging]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const updatePosition = (e) => {
    if (!comparisonRef.current) return;
    const rect = comparisonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    Math.max(0, Math.min(100, (x / rect.width) * 100));
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
  }, [isDragging, handleMouseMove]);

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

  const handleSmartCompress = useCallback(async () => {
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
        setCompressedSize(result.size);
        setCompressionQuality(result.quality);
        setCompressedImageDetails(result.dataUrl, result.size, result.sizeReduction);
        setIsAnalyzing(false);
      };

      img.src = displaySrc;
    } catch (error) {
      console.error("Smart compression error:", error);
      setIsAnalyzing(false);
    }
  }, [imageData, displaySrc, setSmartCompressResult, setCompressedSize, setCompressionQuality, setIsAnalyzing, setCompressedImageDetails]);


  const downloadSmartCompressed = () => {
    if (!smartCompressResult) {
      reduceFileSize();
      return;
    }

    const link = document.createElement("a");
    link.href = smartCompressResult.dataUrl;
    const fileName = imageData.fileName || "image";
    const baseName = fileName.replace(/\.[^/.]+$/, "");
    link.download = `compressed-smart-${smartCompressResult.quality}q-${baseName}.${smartCompressResult.format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    const compressionRatio = smartCompressResult.sizeReduction;
    const message = `File compressed using AI optimization! Reduced by ${compressionRatio}% to ${formatFileSize(
      smartCompressResult.size
    )} while maintaining ${smartCompressResult.perceptualQuality?.toFixed(
      1
    )}% visual quality.`;
    console.log(message);
  };

  if (!imageData) {
    return null;
  }

  return (
    <div className={styles.container}>
      <TabSection
        icon={Minimize}
        title="File Size Reducer"
        iconColorClass={styles.orangeIcon}
        rightContent={
          <>
            {hasSettingsChanged && hasSettingsChanged().compression && (
              <Button
                onClick={revertCompression}
                size="small"
                className={styles.revertButton}
                icon={<RotateCcw style={{ width: "16px", height: "16px" }} />}
                disabled={isBulkMode}
              >
                Revert
              </Button>
            )}
            <Text type="secondary" className={styles.extraText}>
              AI-powered perceptual compression - maximum file size reduction
              while preserving HD visual quality
            </Text>
          </>
        }
      >
        {isCustomCompressionEnabled && (
          <>
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
                disabled={isBulkMode}
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
                  disabled={isBulkMode}
                >
                  High Quality (85%)
                </Button>
                <Button
                  size="small"
                  onClick={() => setCompressionQuality(70)}
                  className={styles.presetButton}
                  disabled={isBulkMode}
                >
                  Balanced (70%)
                </Button>
                <Button
                  size="small"
                  onClick={() => setCompressionQuality(50)}
                  className={styles.presetButton}
                  disabled={isBulkMode}
                >
                  Web Optimized (50%)
                </Button>
                <Button
                  size="small"
                  onClick={() => setCompressionQuality(30)}
                  className={styles.presetButton}
                  disabled={isBulkMode}
                >
                  Ultra Compression (30%)
                </Button>
              </div>
            </div>
            <Button
              type="primary"
              onClick={() => applyAllChanges()}
              className={styles.smartCompressButton} // Re-using style for now
              size="large"
              style={{
                width: "100%",
                marginTop: "20px",
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                borderColor: "#667eea",
              }}
              disabled={isBulkMode}
            >
              Apply Custom Compression
            </Button>
          </>
        )}

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
                  Edge density: {imageComplexity.edgePercentage}% • Variance:{" "}
                  {imageComplexity.avgVariance}
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
            disabled={isBulkMode}
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

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              backgroundColor: "#f9fafb",
              borderRadius: "8px",
              border: "1px solid #e5e7eb",
              marginTop: "20px",
            }}
          >
            <div>
              <Text
                strong
                style={{
                  fontSize: "13px",
                  color: "#1f2937",
                  display: "block",
                }}
              >
                Custom Compression
              </Text>
              <Text type="secondary" style={{ fontSize: "11px" }}>
                Manually adjust quality settings
              </Text>
            </div>
            <Switch
              checked={isCustomCompressionEnabled}
              onChange={setIsCustomCompressionEnabled}
              disabled={isBulkMode}
            />
          </div>

          {smartCompressResult && (
            <div className={styles.smartResult}>
              <div className={styles.smartResultHeader}>
                <Text strong style={{ color: "#10b981", fontSize: "14px" }}>
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
                  <Text strong style={{ fontSize: "11px", color: "#10b981" }}>
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

        <Button
          type="primary"
          onClick={downloadSmartCompressed}
          className={styles.downloadButton}
          size="large"
          icon={<Download style={{ width: "16px", height: "16px" }} />}
          disabled={isAnalyzing || isBulkMode}
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

        <div className={styles.analysisSection}>
          <Text strong className={styles.analysisSectionTitle}>
            Compression Analysis
          </Text>
          <div className={styles.infoBoxes}>
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
                  Large file detected. Consider 60-70% quality for web use.
                </div>
              </div>
            )}
          </div>
        </div>
      </TabSection>
    </div>
  );
}