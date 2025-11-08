import { useEffect, useState } from "react";

import { Button, Divider, Input, Slider, Switch, Typography } from "antd";
import { Download, MousePointer2, RotateCcw, Settings } from "lucide-react";

import { commonAspectRatios } from "@common/constants";
import useStore from "@common/store/use-store";

import styles from "./style.module.css";

const { Text } = Typography;

export default function CropTab({ isBulkMode }) {
  const store = useStore();
  const {
    images,
    activeImageIndex,
    cropArea,
    setCropArea,
    showGrid,
    setShowGrid,
    cropInputMode,
    setCropInputMode,
    hasSettingsChanged,
    revertCrop,
    isDownloading,
    applyCropAction,
  } = store;
  const imageData = images[activeImageIndex] || null;

  const currentScale =
    imageData && imageData.width ? Math.round((cropArea.width / imageData.width) * 100) : 100;
  const [scaleValue, setScaleValue] = useState(currentScale);

  const [tempWidth, setTempWidth] = useState(cropArea.width);
  const [tempHeight, setTempHeight] = useState(cropArea.height);
  const [tempX, setTempX] = useState(cropArea.x);
  const [tempY, setTempY] = useState(cropArea.y);

  const [showCenterGrid, setShowCenterGrid] = useState(false);

  useEffect(() => {
    setShowCenterGrid(false);
  }, [imageData?.width, imageData?.height]);

  useEffect(() => {
    if (showCenterGrid) {
      const centerX = (imageData.width - cropArea.width) / 2;
      const centerY = (imageData.height - cropArea.height) / 2;

      setCropArea({
        x: Math.max(0, centerX),
        y: Math.max(0, centerY),
        width: cropArea.width,
        height: cropArea.height,
      });
    }
  }, [
    showCenterGrid,
    imageData?.width,
    imageData?.height,
    cropArea.width,
    cropArea.height,
    setCropArea,
  ]);

  useEffect(() => {
    if (imageData && imageData.width) {
      const newScale = Math.round((cropArea.width / imageData.width) * 100);
      setScaleValue(newScale);
    }
  }, [cropArea.width, imageData?.width]);

  useEffect(() => {
    setTempWidth(cropArea.width);
    setTempHeight(cropArea.height);
    setTempX(cropArea.x);
    setTempY(cropArea.y);
  }, [cropArea.width, cropArea.height, cropArea.x, cropArea.y]);

  if (!imageData) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.sidebarContent}>
          <div style={{ marginBottom: "1rem" }}>
            <Button
              type="primary"
              onClick={applyCropAction}
              size="large"
              block
              loading={isDownloading}
              icon={<Download className={styles.icon} />}
              disabled={isBulkMode}
            >
              Apply Crop
            </Button>
          </div>

          {hasSettingsChanged && hasSettingsChanged().crop && (
            <div style={{ marginBottom: "1rem" }}>
              <Button
                onClick={revertCrop}
                size="large"
                block
                className={styles.revertButton}
                icon={<RotateCcw className={styles.icon} />}
                disabled={isBulkMode}
              >
                Revert to Original
              </Button>
            </div>
          )}

          <div className={`${styles.sizeBox} ${styles.originalSizeBox}`}>
            <h3
              className={`${styles.sizeBoxTitle} ${styles.originalSizeTitle}`}
            >
              Original Size
            </h3>
            <div className={styles.sizeDetails}>
              <div className={styles.sizeRow}>
                <span className={styles.originalSizeLabel}>Width:</span>
                <span
                  className={`${styles.sizeValue} ${styles.originalSizeValue}`}
                >
                  {imageData.width}px
                </span>
              </div>
              <div className={styles.sizeRow}>
                <span className={styles.originalSizeLabel}>Height:</span>
                <span
                  className={`${styles.sizeValue} ${styles.originalSizeValue}`}
                >
                  {imageData.height}px
                </span>
              </div>
            </div>
          </div>

          <Divider />

          <div className={styles.exportSettings}>
            <Text strong className={styles.exportTitle}>
              Dimention
            </Text>

            <div className={styles.modeToggle}>
              <Button
                type={cropInputMode === "input" ? "primary" : "default"}
                size="small"
                onClick={() => setCropInputMode("input")}
                className={styles.toggleButton}
                icon={<MousePointer2 className={styles.icon} />}
                disabled={isBulkMode}
              >
                Input
              </Button>
              <Button
                type={cropInputMode === "slider" ? "primary" : "default"}
                size="small"
                onClick={() => setCropInputMode("slider")}
                className={styles.toggleButton}
                icon={<Settings className={styles.icon} />}
                disabled={isBulkMode}
              >
                Slider
              </Button>
            </div>

            {cropInputMode === "input" ? (
              <div className={styles.preciseControls}>
                <div className={styles.inputGrid}>
                  <div className={styles.inputGroup}>
                    <Text strong className={styles.inputLabel}>
                      Width (px)
                    </Text>
                    <Input
                      type="number"
                      value={Math.round(tempWidth)}
                      onChange={(e) => setTempWidth(Number(e.target.value))}
                      onBlur={(e) => {
                        const value = Math.min(
                          Math.max(1, Number(e.target.value)),
                          imageData.width - cropArea.x
                        );
                        setCropArea({
                          ...cropArea,
                          width: value,
                        });
                      }}
                      className={styles.inputField}
                      min={1}
                      max={imageData.width - cropArea.x}
                      disabled={isBulkMode}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <Text strong className={styles.inputLabel}>
                      Height (px)
                    </Text>
                    <Input
                      type="number"
                      value={Math.round(tempHeight)}
                      onChange={(e) => setTempHeight(Number(e.target.value))}
                      onBlur={(e) => {
                        const value = Math.min(
                          Math.max(1, Number(e.target.value)),
                          imageData.height - cropArea.y
                        );
                        setCropArea({
                          ...cropArea,
                          height: value,
                        });
                      }}
                      className={styles.inputField}
                      min={1}
                      max={imageData.height - cropArea.y}
                      disabled={isBulkMode}
                    />
                  </div>
                </div>

                <div className={styles.inputGrid}>
                  <div className={styles.inputGroup}>
                    <Text strong className={styles.inputLabel}>
                      X Position
                    </Text>
                    <Input
                      type="number"
                      value={Math.round(tempX)}
                      onChange={(e) => setTempX(Number(e.target.value))}
                      onBlur={(e) => {
                        const value = Math.min(
                          Math.max(0, Number(e.target.value)),
                          imageData.width - cropArea.width
                        );
                        setCropArea({
                          ...cropArea,
                          x: value,
                        });
                      }}
                      className={styles.inputField}
                      min={0}
                      max={imageData.width - cropArea.width}
                      disabled={isBulkMode}
                    />
                  </div>
                  <div className={styles.inputGroup}>
                    <Text strong className={styles.inputLabel}>
                      Y Position
                    </Text>
                    <Input
                      type="number"
                      value={Math.round(tempY)}
                      onChange={(e) => setTempY(Number(e.target.value))}
                      onBlur={(e) => {
                        const value = Math.min(
                          Math.max(0, Number(e.target.value)),
                          imageData.height - cropArea.height
                        );
                        setCropArea({
                          ...cropArea,
                          y: value,
                        });
                      }}
                      className={styles.inputField}
                      min={0}
                      max={imageData.height - cropArea.height}
                      disabled={isBulkMode}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className={styles.sliderControls}>
                <div>
                  <Text strong className={styles.sliderLabel}>
                    Horizontal Crop
                  </Text>
                  <Slider
                    range
                    value={[cropArea.x, cropArea.x + cropArea.width]}
                    onChange={([startX, endX]) => {
                      const newWidth = endX - startX;
                      if (newWidth > 0) {
                        setCropArea({
                          ...cropArea,
                          x: startX,
                          width: newWidth,
                        });
                      }
                    }}
                    max={imageData.width}
                    min={0}
                    step={1}
                    className={styles.sliderFull}
                    disabled={isBulkMode}
                  />
                </div>
                <div>
                  <Text strong className={styles.sliderLabel}>
                    Vertical Crop
                  </Text>
                  <Slider
                    range
                    value={[cropArea.y, cropArea.y + cropArea.height]}
                    onChange={([startY, endY]) => {
                      const newHeight = endY - startY;
                      if (newHeight > 0) {
                        setCropArea({
                          ...cropArea,
                          y: startY,
                          height: newHeight,
                        });
                      }
                    }}
                    max={imageData.height}
                    min={0}
                    step={1}
                    className={styles.sliderFull}
                    disabled={isBulkMode}
                  />
                </div>
              </div>
            )}
          </div>

          <Divider />

          <div className={styles.scaleControl}>
            <div className={styles.scaleHeader}>
              <Text strong className={styles.scaleTitle}>
                Crop Scale ({scaleValue}%)
              </Text>
              <Text type="secondary" style={{ fontSize: "12px" }}>
                Shrink/Expand from center
              </Text>
            </div>
            <div className={styles.scaleSlider}>
              <Slider
                value={scaleValue}
                onChange={(value) => {
                  setScaleValue(value);
                }}
                onAfterChange={(value) => {
                  const centerX = cropArea.x + cropArea.width / 2;
                  const centerY = cropArea.y + cropArea.height / 2;

                  const newWidth = (imageData.width * value) / 100;
                  const newHeight = (imageData.height * value) / 100;

                  const newX = centerX - newWidth / 2;
                  const newY = centerY - newHeight / 2;

                  const boundedX = Math.max(
                    0,
                    Math.min(newX, imageData.width - newWidth)
                  );
                  const boundedY = Math.max(
                    0,
                    Math.min(newY, imageData.height - newHeight)
                  );
                  const boundedWidth = Math.min(
                    newWidth,
                    imageData.width - boundedX
                  );
                  const boundedHeight = Math.min(
                    newHeight,
                    imageData.height - boundedY
                  );

                  setCropArea({
                    x: boundedX,
                    y: boundedY,
                    width: boundedWidth,
                    height: boundedHeight,
                  });
                }}
                max={100}
                min={10}
                step={1}
                className={styles.sliderFull}
                disabled={isBulkMode}
              />
              <div className={styles.scaleMarkers}>
                <span>10% (Shrink)</span>
                <span>100% (Full)</span>
              </div>
            </div>
          </div>

          <Divider />

          <div className={styles.quickRatios}>
            <div style={{ marginBottom: "12px" }}>
              <Text strong className={styles.quickRatiosTitle}>
                Ratio Setting
              </Text>
            </div>
            <div className={styles.ratioGrid}>
              {commonAspectRatios.slice(0, 6).map((ratio) => (
                <Button
                  key={ratio.name}
                  size="small"
                  onClick={() => {
                    const targetRatio = ratio.ratio;
                    let newWidth = cropArea.width;
                    let newHeight = cropArea.height;

                    if (targetRatio > 1) {
                      newHeight = Math.round(newWidth / targetRatio);
                    } else {
                      newWidth = Math.round(newHeight * targetRatio);
                    }

                    setCropArea({
                      ...cropArea,
                      width: Math.min(newWidth, imageData.width - cropArea.x),
                      height: Math.min(
                        newHeight,
                        imageData.height - cropArea.y
                      ),
                    });
                  }}
                  className={styles.ratioButton}
                  disabled={isBulkMode}
                >
                  {ratio.name.split(" ")[0]}
                </Button>
              ))}
            </div>
          </div>

          <Divider />

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                backgroundColor: "#f9fafb",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
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
                  Show Grid
                </Text>
                <Text type="secondary" style={{ fontSize: "11px" }}>
                  Rule of thirds overlay
                </Text>
              </div>
              <Switch
                checked={showGrid}
                onChange={setShowGrid}
                disabled={isBulkMode}
              />
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                backgroundColor: "#f9fafb",
                borderRadius: "8px",
                border: "1px solid #e5e7eb",
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
                  Center Crop
                </Text>
                <Text type="secondary" style={{ fontSize: "11px" }}>
                  Crop center of image
                </Text>
              </div>
              <Switch
                checked={showCenterGrid}
                onChange={setShowCenterGrid}
                disabled={isBulkMode}
              />
            </div>
          </div>

          <Divider style={{ margin: "16px 0" }} />

        </div>
      </div>
    </div>
  );
}
