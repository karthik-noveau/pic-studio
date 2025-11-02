import { useState, useEffect } from "react";
import { Button, Typography, Slider } from "antd";
import { RotateCw, RotateCcw, Download, Maximize } from "lucide-react";
import styles from "./style.module.css";
import parentStyles from "../../style.module.css";

const { Text } = Typography;

export default function RotateTab({
  imageData,
  processedImageSrc,
  rotation,
  setRotation,
  debouncedSetRotation,
  applyAllChanges,
  downloadImage,
  toast,
  hasSettingsChanged,
  revertRotation,
  zoomLevel,
  openFullscreen,
  isDownloading,
}) {
  // Use processed image if available (excludes rotation), otherwise use original
  const displaySrc = processedImageSrc || imageData?.src || "/placeholder.svg";

  // Local state for smooth slider interaction
  const [localRotation, setLocalRotation] = useState(rotation);

  // Sync local rotation with prop
  useEffect(() => {
    setLocalRotation(rotation);
  }, [rotation]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.titleContent}>
            <div className={styles.iconWrapper}>
              <RotateCw style={{ width: '20px', height: '20px', color: '#2563eb' }} />
            </div>
            Image Rotation
          </div>
          <div className={styles.cardHeaderRight}>
            {hasSettingsChanged().rotation && (
              <Button
                onClick={revertRotation}
                size="small"
                className={styles.revertButton}
                icon={<RotateCcw style={{ width: '16px', height: '16px' }} />}
              >
                Revert
              </Button>
            )}
            <Text type="secondary" className={styles.extraText}>
              Rotate your image with precision control
            </Text>
          </div>
        </div>
        <div className={styles.cardContent}>
        <div className={styles.content}>
          <div className={styles.grid}>
            <div className={styles.leftColumn}>
              <div className={styles.sliderSection}>
                <Text strong className={styles.sliderLabel}>
                  Rotation: {localRotation}°
                </Text>
                <Slider
                  value={localRotation}
                  onChange={(value) => setLocalRotation(value)}
                  onChangeComplete={(value) => setRotation(value)}
                  max={360}
                  min={-360}
                  step={1}
                />
                <div className={styles.sliderMarkers}>
                  <span>-360°</span>
                  <span>0°</span>
                  <span>360°</span>
                </div>
              </div>

              <div className={styles.quickRotationsSection}>
                <Text strong className={styles.quickRotationsTitle}>
                  Quick Rotations
                </Text>
                <div className={styles.quickRotationsGrid}>
                  <Button
                    size="small"
                    onClick={() => setRotation(90)}
                    className={styles.quickButton}
                  >
                    90° Right
                  </Button>
                  <Button
                    size="small"
                    onClick={() => setRotation(-90)}
                    className={styles.quickButton}
                  >
                    90° Left
                  </Button>
                  <Button
                    size="small"
                    onClick={() => setRotation(180)}
                    className={styles.quickButton}
                  >
                    180° Flip
                  </Button>
                  <Button
                    size="small"
                    onClick={() => setRotation(0)}
                    className={styles.quickButton}
                  >
                    Reset (0°)
                  </Button>
                </div>
              </div>

              <Button
                type="primary"
                onClick={() => {
                  // Save local rotation before downloading
                  setRotation(localRotation);
                  setTimeout(() => {
                    const processedCanvas = applyAllChanges();
                    if (processedCanvas) {
                      const dataUrl = processedCanvas.toDataURL("image/png");
                      downloadImage(
                        dataUrl,
                        `rotated-${localRotation}deg-${
                          imageData?.fileName || "image"
                        }.png`
                      );
                      toast({
                        title: "Image rotated successfully",
                        description: `Downloaded image rotated by ${localRotation}°.`,
                      });
                    }
                  }, 50);
                }}
                className={styles.downloadButton}
                size="large"
                loading={isDownloading}
                icon={<Download style={{ width: '16px', height: '16px' }} />}
              >
                Download Rotated Image
              </Button>
            </div>

            <div className={styles.rightColumn}>
              <Text strong className={styles.previewLabel}>
                Live Preview
              </Text>
              <div className={styles.previewContainer}>
                <div className={parentStyles.imageWithFullscreen}>
                  <img
                    src={displaySrc}
                    alt="Rotation preview"
                    className={styles.previewImage}
                    style={{
                      transform: `rotate(${localRotation}deg)`,
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
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
