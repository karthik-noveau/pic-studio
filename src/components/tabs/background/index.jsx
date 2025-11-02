import { useState, useEffect } from "react";
import { Button, Input, Typography, Switch, Progress, message } from "antd";
import {
  Paintbrush,
  RotateCcw,
  Download,
  Maximize,
  Sparkles,
  Scissors,
} from "lucide-react";
import styles from "./style.module.css";
import parentStyles from "../../style.module.css";
import {
  autoRemoveBackground,
  isBackgroundRemovalSupported,
  estimateProcessingTime,
} from "../../../common/backgroundRemoval";

const { Text } = Typography;

export default function BackgroundTab({
  imageData,
  processedImageSrc,
  backgroundColor,
  setBackgroundColor,
  removeBackground,
  setRemoveBackground,
  changeBackground,
  hasSettingsChanged,
  revertBackground,
  zoomLevel,
  openFullscreen,
  isDownloading,
}) {
  const displaySrc = processedImageSrc || imageData?.src || "/placeholder.svg";
  const [isRemoving, setIsRemoving] = useState(false);
  const [removalProgress, setRemovalProgress] = useState(0);
  const [removedBgImage, setRemovedBgImage] = useState(null);
  const [isSupported, setIsSupported] = useState(true);

  // Check if background removal is supported
  useEffect(() => {
    setIsSupported(isBackgroundRemovalSupported());
  }, []);

  // Handle automatic background removal
  const handleAutoRemoveBackground = async () => {
    if (!imageData) {
      message.error("No image loaded");
      return;
    }

    setIsRemoving(true);
    setRemovalProgress(0);

    try {
      const estimatedTime = estimateProcessingTime(
        imageData.width,
        imageData.height
      );
      message.info(`Processing... This may take ${estimatedTime}`);

      const result = await autoRemoveBackground(imageData.src, {
        model: "medium",
        onProgress: (key, current, total) => {
          const progress = Math.round((current / total) * 100);
          setRemovalProgress(progress);
        },
      });

      setRemovedBgImage(result);
      setRemovalProgress(100);
      message.success("Background removed successfully! 🎉");
    } catch (error) {
      console.error("Background removal error:", error);
      message.error("Failed to remove background. Please try again.");
    } finally {
      setIsRemoving(false);
    }
  };

  // Download removed background image
  const downloadRemovedBg = () => {
    if (!removedBgImage) return;

    const link = document.createElement("a");
    link.href = removedBgImage.dataUrl;
    const fileName = imageData.fileName || "image";
    const baseName = fileName.replace(/\.[^/.]+$/, "");
    link.download = `${baseName}-no-bg.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    message.success("Image downloaded successfully!");
  };

  // Download with custom background
  const downloadWithBackground = () => {
    if (!removedBgImage) {
      changeBackground();
      return;
    }

    // Create a canvas with the removed background image and custom background color
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      // Fill background color
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Draw the image with removed background on top
      ctx.drawImage(img, 0, 0);

      // Download
      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        const fileName = imageData.fileName || "image";
        const baseName = fileName.replace(/\.[^/.]+$/, "");
        link.download = `${baseName}-custom-bg.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        message.success("Image with custom background downloaded!");
      });
    };

    img.src = removedBgImage.dataUrl;
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.titleContent}>
            <div className={styles.iconWrapper}>
              <Paintbrush
                style={{ width: "20px", height: "20px", color: "#db2777" }}
              />
            </div>
            Background Editor
          </div>
          <div className={styles.cardHeaderRight}>
            {hasSettingsChanged().background && (
              <Button
                onClick={revertBackground}
                size="small"
                className={styles.revertButton}
                icon={<RotateCcw style={{ width: "16px", height: "16px" }} />}
              >
                Revert
              </Button>
            )}
            <Text type="secondary" className={styles.extraText}>
              AI-powered background removal for products, people, animals, and
              more - just like remove.bg
            </Text>
          </div>
        </div>
        <div className={styles.cardContent}>
          <div className={styles.content}>
            <div className={styles.grid}>
              <div className={styles.leftColumn}>
                {/* AI Background Removal Section */}
                <div
                  className={styles.aiRemovalSection}
                  style={{
                    padding: "20px",
                    background:
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    borderRadius: "12px",
                    marginBottom: "20px",
                    color: "white",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginBottom: "12px",
                    }}
                  >
                    <Sparkles
                      style={{
                        width: "24px",
                        height: "24px",
                        marginRight: "10px",
                      }}
                    />
                    <Text strong style={{ color: "white", fontSize: "16px" }}>
                      AI Background Removal (100% Automatic)
                    </Text>
                  </div>
                  <Text
                    style={{
                      color: "rgba(255,255,255,0.9)",
                      fontSize: "13px",
                      display: "block",
                      marginBottom: "16px",
                    }}
                  >
                    Remove backgrounds from products, people, animals, cars,
                    graphics automatically using AI
                  </Text>

                  {isRemoving && (
                    <div style={{ marginBottom: "16px" }}>
                      <Progress
                        percent={removalProgress}
                        strokeColor={{
                          "0%": "#10b981",
                          "100%": "#059669",
                        }}
                        status="active"
                      />
                      <Text
                        style={{
                          color: "rgba(255,255,255,0.8)",
                          fontSize: "12px",
                          display: "block",
                          marginTop: "8px",
                        }}
                      >
                        Processing with AI model... Please wait
                      </Text>
                    </div>
                  )}

                  {!isSupported && (
                    <div
                      style={{
                        padding: "12px",
                        backgroundColor: "rgba(239, 68, 68, 0.2)",
                        borderRadius: "6px",
                        marginBottom: "12px",
                      }}
                    >
                      <Text style={{ color: "white", fontSize: "12px" }}>
                        ⚠️ Your browser doesn't support WebGL. Background
                        removal may not work.
                      </Text>
                    </div>
                  )}

                  <Button
                    type="default"
                    size="large"
                    onClick={handleAutoRemoveBackground}
                    loading={isRemoving}
                    disabled={isRemoving || !isSupported}
                    icon={
                      <Scissors style={{ width: "18px", height: "18px" }} />
                    }
                    style={{
                      width: "100%",
                      height: "48px",
                      backgroundColor: "white",
                      color: "#667eea",
                      border: "none",
                      fontWeight: "bold",
                    }}
                  >
                    {isRemoving
                      ? "Removing Background..."
                      : "Remove Background Automatically"}
                  </Button>

                  {removedBgImage && (
                    <div
                      style={{
                        marginTop: "16px",
                        padding: "12px",
                        backgroundColor: "rgba(16, 185, 129, 0.2)",
                        borderRadius: "8px",
                      }}
                    >
                      <Text
                        strong
                        style={{
                          color: "white",
                          display: "block",
                          marginBottom: "8px",
                        }}
                      >
                        ✓ Background Removed Successfully!
                      </Text>
                      <Button
                        type="primary"
                        onClick={downloadRemovedBg}
                        icon={
                          <Download style={{ width: "16px", height: "16px" }} />
                        }
                        style={{
                          width: "100%",
                          backgroundColor: "#10b981",
                          borderColor: "#10b981",
                        }}
                      >
                        Download Transparent PNG
                      </Button>
                    </div>
                  )}
                </div>

                {removedBgImage && (
                  <div className={styles.removeBackgroundContainer}>
                    <div>
                      <Text strong className={styles.removeBackgroundText}>
                        Show with transparent background
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        Toggle off to preview with custom color
                      </Text>
                    </div>
                    <Switch
                      checked={removeBackground}
                      onChange={setRemoveBackground}
                    />
                  </div>
                )}

                {!removedBgImage && (
                  <div className={styles.removeBackgroundContainer}>
                    <div>
                      <Text strong className={styles.removeBackgroundText}>
                        Export with transparent background
                      </Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: "12px" }}>
                        For images with transparency (PNG files)
                      </Text>
                    </div>
                    <Switch
                      checked={removeBackground}
                      onChange={setRemoveBackground}
                    />
                  </div>
                )}

                {!removeBackground && (
                  <div className={styles.colorSection}>
                    <Text strong className={styles.colorLabel}>
                      {removedBgImage
                        ? "Custom Background Color"
                        : "Background Color"}
                    </Text>
                    <div className={styles.colorInputGroup}>
                      <Input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className={styles.colorPicker}
                      />
                      <Input
                        type="text"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        placeholder="#ffffff"
                        className={styles.colorTextInput}
                      />
                    </div>
                    {removedBgImage && (
                      <Text
                        type="secondary"
                        style={{
                          fontSize: "11px",
                          marginTop: "8px",
                          display: "block",
                        }}
                      >
                        Preview updates in real-time. Download to save with this
                        background.
                      </Text>
                    )}
                  </div>
                )}

                {!removeBackground && (
                  <div className={styles.quickColorsSection}>
                    <Text strong className={styles.quickColorsTitle}>
                      Quick Colors
                    </Text>
                    <div className={styles.quickColorsGrid}>
                      {[
                        "#ffffff",
                        "#000000",
                        "#f3f4f6",
                        "#3b82f6",
                        "#ef4444",
                        "#10b981",
                        "#f59e0b",
                        "#8b5cf6",
                      ].map((color) => (
                        <button
                          key={color}
                          onClick={() => {
                            setBackgroundColor(color);
                            setRemoveBackground(false);
                          }}
                          className={styles.colorButton}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {removedBgImage ? (
                  <Button
                    type="primary"
                    onClick={downloadWithBackground}
                    className={styles.downloadButton}
                    size="large"
                    icon={
                      <Download style={{ width: "16px", height: "16px" }} />
                    }
                  >
                    Download with Custom Background
                  </Button>
                ) : (
                  <Button
                    type="primary"
                    onClick={changeBackground}
                    className={styles.downloadButton}
                    size="large"
                    loading={isDownloading}
                    icon={
                      <Download style={{ width: "16px", height: "16px" }} />
                    }
                  >
                    Download with New Background
                  </Button>
                )}
              </div>

              <div className={styles.rightColumn}>
                <Text strong className={styles.previewLabel}>
                  {removedBgImage
                    ? "Background Removed Preview"
                    : "Live Preview"}
                </Text>
                <div className={styles.previewContainer}>
                  <div className={parentStyles.imageWithFullscreen}>
                    <img
                      src={removedBgImage ? removedBgImage.dataUrl : displaySrc}
                      alt="Background preview"
                      className={styles.previewImage}
                      style={{
                        backgroundColor:
                          removedBgImage && !removeBackground
                            ? backgroundColor
                            : removeBackground || removedBgImage
                            ? "transparent"
                            : backgroundColor,
                        backgroundImage:
                          (removeBackground || removedBgImage) &&
                          removedBgImage &&
                          removeBackground
                            ? "linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)"
                            : "none",
                        backgroundSize:
                          (removeBackground || removedBgImage) &&
                          removedBgImage &&
                          removeBackground
                            ? "20px 20px"
                            : "auto",
                        backgroundPosition:
                          (removeBackground || removedBgImage) &&
                          removedBgImage &&
                          removeBackground
                            ? "0 0, 0 10px, 10px -10px, -10px 0px"
                            : "auto",
                      }}
                    />
                    <div
                      className={parentStyles.fullscreenOverlay}
                      onClick={openFullscreen}
                    >
                      <Maximize className={parentStyles.fullscreenIcon} />
                    </div>
                  </div>
                </div>
                {removedBgImage && (
                  <div
                    style={{
                      marginTop: "12px",
                      padding: "12px",
                      borderRadius: "8px",
                      border: "1px solid #10b981",
                    }}
                  >
                    <Text style={{ fontSize: "12px", color: "#15803d" }}>
                      ✓ Background successfully removed!{" "}
                      {removeBackground
                        ? "Toggle off transparency to add a custom color."
                        : `Current background: ${backgroundColor}`}
                    </Text>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
