import { Card, Button, Typography, Slider } from "antd";
import { RotateCw, RotateCcw, Download } from "lucide-react";
import styles from "./style.module.css";

const { Text } = Typography;

export default function RotateTab({
  imageData,
  rotation,
  setRotation,
  debouncedSetRotation,
  applyAllChanges,
  downloadImage,
  toast,
  hasSettingsChanged,
  revertRotation,
}) {
  return (
    <div className={styles.container}>
      <Card
        className={styles.card}
        title={
          <div className={styles.titleContainer}>
            <div className={styles.titleContent}>
              <div className={styles.iconWrapper}>
                <RotateCw style={{ width: '20px', height: '20px', color: '#2563eb' }} />
              </div>
              Image Rotation
            </div>
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
          </div>
        }
        extra={
          <Text type="secondary" className={styles.extraText}>
            Rotate your image with precision control
          </Text>
        }
      >
        <div className={styles.content}>
          <div className={styles.grid}>
            <div className={styles.leftColumn}>
              <div className={styles.sliderSection}>
                <Text strong className={styles.sliderLabel}>
                  Rotation: {rotation}°
                </Text>
                <Slider
                  value={rotation}
                  onChange={(value) => debouncedSetRotation(value)}
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
                  const processedCanvas = applyAllChanges();
                  if (processedCanvas) {
                    const dataUrl = processedCanvas.toDataURL("image/png");
                    downloadImage(
                      dataUrl,
                      `rotated-${rotation}deg-${
                        imageData?.fileName || "image"
                      }.png`
                    );
                    toast({
                      title: "Image rotated successfully",
                      description: `Downloaded image rotated by ${rotation}°.`,
                    });
                  }
                }}
                className={styles.downloadButton}
                size="large"
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
                <img
                  src={imageData.src || "/placeholder.svg"}
                  alt="Rotation preview"
                  className={styles.previewImage}
                  style={{
                    transform: `rotate(${rotation}deg)`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
