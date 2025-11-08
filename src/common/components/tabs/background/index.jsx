import { useEffect, useState } from "react";

import { Button, Input, message, Progress, Switch, Typography } from "antd";
import {
  Download,
  Paintbrush,
  RotateCcw,
  Scissors,
  Sparkles,
} from "lucide-react";

import useStore from "@common/store/use-store";
import {
  autoRemoveBackground,
  estimateProcessingTime,
  isBackgroundRemovalSupported,
} from "@common/utils/background-removal";

import TabSection from "../../tab-section"; // Import TabSection

import styles from "./style.module.css";

const { Text } = Typography;

export default function BackgroundTab({ isBulkMode }) {
  const store = useStore();
  const {
    images,
    activeImageIndex,
    backgroundColor,
    setBackgroundColor,
    removeBackground,
    setRemoveBackground,
    hasSettingsChanged,
    revertBackground,
    transparentImage,
    setTransparentImage,
  } = store;
  const imageData = images[activeImageIndex] || null;

  const [isRemoving, setIsRemoving] = useState(false);
  const [removalProgress, setRemovalProgress] = useState(0);
  const [isSupported, setIsSupported] = useState(true);

  useEffect(() => {
    setIsSupported(isBackgroundRemovalSupported());
  }, []);

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

      setTransparentImage({
        src: result.dataUrl,
        width: imageData.width,
        height: imageData.height,
      });
      setRemoveBackground(true);
      setRemovalProgress(100);
      message.success("Background removed successfully! 🎉");
    } catch (error) {
      console.error("Background removal error:", error);
      message.error("Failed to remove background. Please try again.");
    } finally {
      setIsRemoving(false);
    }
  };

  const downloadRemovedBg = () => {
    if (!transparentImage?.src) return;

    const link = document.createElement("a");
    link.href = transparentImage?.src;
    const fileName = imageData.fileName || "image";
    const baseName = fileName.replace(/\.[^/.]+$/, "");
    link.download = `${baseName}-no-bg.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    message.success("Image downloaded successfully!");
  };

  const downloadWithBackground = () => {
    if (!transparentImage?.src) {
      message.error("Please remove the background first.");
      return;
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;

      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.drawImage(img, 0, 0);

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

    img.src = transparentImage?.src;
  };

  if (!imageData) {
    return null;
  }

  return (
    <div className={styles.container}>
      <TabSection
        icon={Paintbrush}
        title="Background Editor"
        iconColorClass={styles.pinkIcon}
        rightContent={
          <>
            {hasSettingsChanged && hasSettingsChanged().background && (
              <Button
                onClick={revertBackground}
                size="small"
                className={styles.revertButton}
                icon={<RotateCcw style={{ width: "16px", height: "16px" }} />}
                disabled={isBulkMode}
              >
                Revert
              </Button>
            )}
            <Text type="secondary" className={styles.extraText}>
              AI-powered background removal for products, people, animals, and
              more - just like remove.bg
            </Text>
          </>
        }
      >
        <div
          className={styles.aiRemovalSection}
          style={{
            padding: "20px",
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
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
            Remove backgrounds from products, people, animals, cars, graphics
            automatically using AI
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
                ⚠️ Your browser doesn&apos;t support WebGL. Background removal
                may not work.
              </Text>
            </div>
          )}

          <Button
            type="default"
            size="large"
            onClick={handleAutoRemoveBackground}
            loading={isRemoving}
            disabled={isRemoving || !isSupported || isBulkMode}
            icon={<Scissors style={{ width: "18px", height: "18px" }} />}
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

          {transparentImage?.src && (
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
                icon={<Download style={{ width: "16px", height: "16px" }} />}
                style={{
                  width: "100%",
                  backgroundColor: "#10b981",
                  borderColor: "#10b981",
                }}
                disabled={isBulkMode}
              >
                Download Transparent PNG
              </Button>
            </div>
          )}
        </div>

        {transparentImage?.src && (
          <div className={styles.removeBackgroundContainer}>
            <div>
              <Text strong className={styles.removeBackgroundText}>
                Export with transparent background
              </Text>
              <br />
              <Text type="secondary" style={{ fontSize: "12px" }}>
                Enable to remove the background color
              </Text>
            </div>
            <Switch
              checked={removeBackground}
              onChange={setRemoveBackground}
              disabled={isBulkMode}
            />
          </div>
        )}

        {!removeBackground && (
          <>
            <div className={styles.colorSection}>
              <Text strong className={styles.colorLabel}>
                {transparentImage?.src
                  ? "Custom Background Color"
                  : "Background Color"}
              </Text>
              <div className={styles.colorInputGroup}>
                <Input
                  type="color"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  className={styles.colorPicker}
                  disabled={isBulkMode}
                />
                <Input
                  type="text"
                  value={backgroundColor}
                  onChange={(e) => setBackgroundColor(e.target.value)}
                  placeholder="#ffffff"
                  className={styles.colorTextInput}
                  disabled={isBulkMode}
                />
              </div>
              {transparentImage?.src && (
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
                    disabled={isBulkMode}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        <Button
          type="primary"
          onClick={downloadWithBackground}
          className={styles.downloadButton}
          size="large"
          icon={<Download style={{ width: "16px", height: "16px" }} />}
          disabled={isBulkMode}
        >
          Download with Custom Background
        </Button>
      </TabSection>
    </div>
  );
}
