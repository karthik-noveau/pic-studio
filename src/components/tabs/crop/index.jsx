import { useState, useEffect } from "react";
import { Button, Input, Typography, Slider, Divider, Switch } from "antd";
import {
  Download,
  MousePointer2,
  Settings,
  RotateCcw,
} from "lucide-react";

import styles from "./style.module.css";

const { Text } = Typography;

export default function CropTab({
  imageData,
  cropArea,
  setCropArea,
  showGrid,
  setShowGrid,
  cropInputMode,
  setCropInputMode,
  simplifyRatio,
  applyCrop,
  hasSettingsChanged,
  revertCrop,
  cropContainerRef,
  commonAspectRatios,
  isDownloading,
}) {
  // Calculate current scale based on crop area
  const currentScale = Math.round((cropArea.width / imageData.width) * 100);
  const [scaleValue, setScaleValue] = useState(currentScale);

  // Temporary slider values for smooth dragging
  const [tempWidth, setTempWidth] = useState(cropArea.width);
  const [tempHeight, setTempHeight] = useState(cropArea.height);
  const [tempX, setTempX] = useState(cropArea.x);
  const [tempY, setTempY] = useState(cropArea.y);

  // Center grid toggle state
  const [showCenterGrid, setShowCenterGrid] = useState(false);

  // Reset center grid when image changes
  useEffect(() => {
    setShowCenterGrid(false);
  }, [imageData.width, imageData.height]);

  // When center crop is toggled, move existing crop to center position
  useEffect(() => {
    if (showCenterGrid) {
      // Keep current dimensions, just center the position
      const centerX = (imageData.width - cropArea.width) / 2;
      const centerY = (imageData.height - cropArea.height) / 2;

      setCropArea({
        x: Math.max(0, centerX),
        y: Math.max(0, centerY),
        width: cropArea.width,
        height: cropArea.height,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showCenterGrid]);

  // Update scale value when crop area changes (from dragging/resizing)
  useEffect(() => {
    const newScale = Math.round((cropArea.width / imageData.width) * 100);
    setScaleValue(newScale);
  }, [cropArea.width, imageData.width]);

  // Update temp values when crop area changes
  useEffect(() => {
    setTempWidth(cropArea.width);
    setTempHeight(cropArea.height);
    setTempX(cropArea.x);
    setTempY(cropArea.y);
  }, [cropArea.width, cropArea.height, cropArea.x, cropArea.y]);
  return (
    <div className={styles.container}>
        {/* Crop Controls */}
          <div className={styles.card}>
            <div className={styles.sidebarContent}>
              {/* Revert Button */}
              {hasSettingsChanged().crop && (
                <div style={{ marginBottom: "1rem" }}>
                  <Button
                    onClick={revertCrop}
                    size="large"
                    block
                    className={styles.revertButton}
                    icon={<RotateCcw className={styles.icon} />}
                  >
                    Revert to Original
                  </Button>
                </div>
              )}

              {/* Original Size */}
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

              {/* Export Settings */}
              <div className={styles.exportSettings}>
                <Text strong className={styles.exportTitle}>
                  Dimention
                </Text>

                {/* Input/Slider Toggle */}
                <div className={styles.modeToggle}>
                  <Button
                    type={cropInputMode === "input" ? "primary" : "default"}
                    size="small"
                    onClick={() => setCropInputMode("input")}
                    className={styles.toggleButton}
                    icon={<MousePointer2 className={styles.icon} />}
                  >
                    Input
                  </Button>
                  <Button
                    type={cropInputMode === "slider" ? "primary" : "default"}
                    size="small"
                    onClick={() => setCropInputMode("slider")}
                    className={styles.toggleButton}
                    icon={<Settings className={styles.icon} />}
                  >
                    Slider
                  </Button>
                </div>

                {/* Precise Controls */}
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
                        />
                      </div>
                      <div className={styles.inputGroup}>
                        <Text strong className={styles.inputLabel}>
                          Height (px)
                        </Text>
                        <Input
                          type="number"
                          value={Math.round(tempHeight)}
                          onChange={(e) =>
                            setTempHeight(Number(e.target.value))
                          }
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
                          max={imageData.height - cropArea.y}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={styles.sliderControls}>
                    <div>
                      <Text strong className={styles.sliderLabel}>
                        Width: {Math.round(tempWidth)}px
                      </Text>
                      <Slider
                        value={tempWidth}
                        onChange={(value) => setTempWidth(value)}
                        onAfterChange={(value) =>
                          setCropArea({
                            ...cropArea,
                            width: value,
                          })
                        }
                        max={imageData.width - cropArea.x}
                        min={50}
                        step={1}
                        className={styles.sliderFull}
                      />
                    </div>
                    <div>
                      <Text strong className={styles.sliderLabel}>
                        Height: {Math.round(tempHeight)}px
                      </Text>
                      <Slider
                        value={tempHeight}
                        onChange={(value) => setTempHeight(value)}
                        onAfterChange={(value) =>
                          setCropArea({
                            ...cropArea,
                            height: value,
                          })
                        }
                        max={imageData.height - cropArea.y}
                        min={50}
                        step={1}
                        className={styles.sliderFull}
                      />
                    </div>
                    <div>
                      <Text strong className={styles.sliderLabel}>
                        X Position: {Math.round(tempX)}px
                      </Text>
                      <Slider
                        value={tempX}
                        onChange={(value) => setTempX(value)}
                        onAfterChange={(value) =>
                          setCropArea({ ...cropArea, x: value })
                        }
                        max={imageData.width - cropArea.width}
                        min={0}
                        step={1}
                        className={styles.sliderFull}
                      />
                    </div>
                    <div>
                      <Text strong className={styles.sliderLabel}>
                        Y Position: {Math.round(tempY)}px
                      </Text>
                      <Slider
                        value={tempY}
                        onChange={(value) => setTempY(value)}
                        onAfterChange={(value) =>
                          setCropArea({ ...cropArea, y: value })
                        }
                        max={imageData.height - cropArea.height}
                        min={0}
                        step={1}
                        className={styles.sliderFull}
                      />
                    </div>
                  </div>
                )}
              </div>

              <Divider />

              {/* Scale Control */}
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
                      // Update slider value immediately for smooth visual feedback
                      setScaleValue(value);
                    }}
                    onAfterChange={(value) => {
                      // Apply crop area changes only on mouse up/leave
                      const centerX = cropArea.x + cropArea.width / 2;
                      const centerY = cropArea.y + cropArea.height / 2;

                      // Calculate new dimensions based on scale
                      const newWidth = (imageData.width * value) / 100;
                      const newHeight = (imageData.height * value) / 100;

                      // Calculate new position to keep center point
                      const newX = centerX - newWidth / 2;
                      const newY = centerY - newHeight / 2;

                      // Ensure crop area stays within image bounds
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
                  />
                  <div className={styles.scaleMarkers}>
                    <span>10% (Shrink)</span>
                    <span>100% (Full)</span>
                  </div>
                </div>
              </div>

              <Divider />

              {/* Aspect Ratios */}
              <div className={styles.quickRatios}>
                <div style={{ marginBottom: "12px" }}>
                  <Text strong className={styles.quickRatiosTitle}>
                    Ratio Setting
                  </Text>
                  <div
                    style={{
                      marginTop: "8px",
                      padding: "8px 12px",
                      backgroundColor: "#eff6ff",
                      borderRadius: "6px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      Current Ratio:
                    </Text>
                    <Text strong style={{ fontSize: "14px", color: "#2563eb" }}>
                      {simplifyRatio(
                        Math.round(cropArea.width),
                        Math.round(cropArea.height)
                      )}
                    </Text>
                  </div>
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
                          width: Math.min(
                            newWidth,
                            imageData.width - cropArea.x
                          ),
                          height: Math.min(
                            newHeight,
                            imageData.height - cropArea.y
                          ),
                        });
                      }}
                      className={styles.ratioButton}
                    >
                      {ratio.name.split(" ")[0]}
                    </Button>
                  ))}
                </div>
              </div>

              <Divider />

              {/* Grid Toggles */}
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
                  <Switch checked={showGrid} onChange={setShowGrid} />
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
                  />
                </div>
              </div>

              <Divider style={{ margin: "16px 0" }} />

              {/* Action Buttons */}
              <div className={styles.actionButtons}>
                <Button
                  type="primary"
                  onClick={applyCrop}
                  className={styles.downloadButton}
                  size="large"
                  loading={isDownloading}
                  icon={<Download className={styles.icon} />}
                >
                  Download Cropped Image
                  <div className={styles.downloadSize}>
                    ({Math.round(cropArea.width)}×{Math.round(cropArea.height)})
                  </div>
                </Button>
              </div>
            </div>
          </div>
    </div>
  );
}
