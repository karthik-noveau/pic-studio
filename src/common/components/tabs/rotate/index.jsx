import { useEffect, useState } from "react";

import { Button, Slider, Typography } from "antd";
import { Download, RotateCcw, RotateCw } from "lucide-react";

import useStore from "@common/store/use-store";

import { toast } from "../../../hooks/use-toast";
import TabSection from "../../tab-section";

import styles from "./style.module.css";

const { Text } = Typography;

export default function Rotate({ isBulkMode }) {
  const store = useStore();
  const {
    rotation,
    setRotation,
    revertRotation,
    hasSettingsChanged,
    applyAllChanges,
    downloadImage,
    isDownloading,
    images,
    activeImageIndex,
  } = store;
  const imageData = images[activeImageIndex] || null;

  const [localRotation, setLocalRotation] = useState(rotation);

  useEffect(() => {
    setLocalRotation(rotation);
  }, [rotation]);

  if (!imageData) {
    return null;
  }

  return (
    <div className={styles.container}>
      <TabSection
        icon={RotateCw}
        title="Image Rotation"
        iconColorClass={styles.blueIcon}
        rightContent={
          <>
            {hasSettingsChanged && hasSettingsChanged().rotation && (
              <Button
                onClick={revertRotation}
                size="small"
                className={styles.revertButton}
                icon={<RotateCcw style={{ width: "16px", height: "16px" }} />}
                disabled={isBulkMode}
              >
                Revert
              </Button>
            )}
            <Text type="secondary" className={styles.extraText}>
              Rotate your image with precision control
            </Text>
          </>
        }
      >
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
            disabled={isBulkMode}
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
              disabled={isBulkMode}
            >
              90° Right
            </Button>
            <Button
              size="small"
              onClick={() => setRotation(-90)}
              className={styles.quickButton}
              disabled={isBulkMode}
            >
              90° Left
            </Button>
            <Button
              size="small"
              onClick={() => setRotation(180)}
              className={styles.quickButton}
              disabled={isBulkMode}
            >
              180° Flip
            </Button>
            <Button
              size="small"
              onClick={() => setRotation(0)}
              className={styles.quickButton}
              disabled={isBulkMode}
            >
              Reset (0°)
            </Button>
          </div>
        </div>

        <Button
          type="primary"
          onClick={() => {
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
          icon={<Download style={{ width: "16px", height: "16px" }} />}
          disabled={isBulkMode}
        >
          Download Rotated Image
        </Button>
      </TabSection>
    </div>
  );
}