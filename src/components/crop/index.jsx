import { Card, Button, Input, Typography, Slider, Divider, Switch } from "antd";
import {
  Crop,
  RotateCcw,
  Download,
  MousePointer2,
  Settings,
} from "lucide-react";

import styles from "./style.module.css";
import DraggableCrop from "./draggable-crop";

const { Text } = Typography;

export default function CropTab({
  imageData,
  cropArea,
  setCropArea,
  showGrid,
  setShowGrid,
  cropScale,
  setCropScale,
  cropInputMode,
  setCropInputMode,
  debouncedSetCropScale,
  simplifyRatio,
  applyCrop,
  hasSettingsChanged,
  revertCrop,
  cropContainerRef,
  commonAspectRatios,
}) {
  return (
    <div className={styles.container}>
      <div className={styles.mainGrid}>
        {/* Main Crop Canvas */}
        <div className={styles.canvasColumn}>
          <Card
            title={
              <div className={styles.cardHeader}>
                <div className={styles.cardTitle}>
                  <div className={styles.iconWrapper}>
                    <Crop
                      style={{
                        width: "20px",
                        height: "20px",
                        color: "#059669",
                      }}
                    />
                  </div>
                  Professional Crop Tool
                </div>
                {hasSettingsChanged().crop && (
                  <Button
                    onClick={revertCrop}
                    size="small"
                    className={styles.revertButton}
                    icon={<RotateCcw className={styles.icon} />}
                  >
                    Revert
                  </Button>
                )}
              </div>
            }
            extra={
              <Text type="secondary" className={styles.extraText}>
                Drag to move, use handles to resize with precision
              </Text>
            }
          >
            {/* Update the crop container styling */}
            <div
              ref={cropContainerRef}
              className={styles.cropContainer}
              style={{
                aspectRatio: `${imageData.width}/${imageData.height}`,
              }}
            >
              <img
                src={imageData.src || "/placeholder.svg"}
                alt="Crop preview"
                className={styles.cropImage}
              />

              <DraggableCrop
                imageData={imageData}
                cropArea={cropArea}
                setCropArea={setCropArea}
                showGrid={showGrid}
                containerRef={cropContainerRef}
              />
            </div>
          </Card>
        </div>

        {/* Enhanced Sidebar */}
        <div className={styles.sidebarColumn}>
          <Card className={styles.sidebarCard}>
            <div className={styles.sidebarContent}>
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

              {/* Selection Size */}
              <div className={`${styles.sizeBox} ${styles.selectionSizeBox}`}>
                <h3
                  className={`${styles.sizeBoxTitle} ${styles.selectionSizeTitle}`}
                >
                  Selection Size
                </h3>
                <div className={styles.sizeDetails}>
                  <div className={styles.sizeRow}>
                    <span className={styles.selectionSizeLabel}>Width:</span>
                    <span
                      className={`${styles.sizeValue} ${styles.selectionSizeValue}`}
                    >
                      {Math.round(cropArea.width)}px
                    </span>
                  </div>
                  <div className={styles.sizeRow}>
                    <span className={styles.selectionSizeLabel}>Height:</span>
                    <span
                      className={`${styles.sizeValue} ${styles.selectionSizeValue}`}
                    >
                      {Math.round(cropArea.height)}px
                    </span>
                  </div>
                  <div className={styles.sizeRow}>
                    <span className={styles.selectionSizeLabel}>Ratio:</span>
                    <span
                      className={`${styles.sizeValue} ${styles.selectionSizeValue}`}
                    >
                      {simplifyRatio(
                        Math.round(cropArea.width),
                        Math.round(cropArea.height)
                      )}
                    </span>
                  </div>
                </div>
              </div>

              <Divider />

              {/* Final Size */}
              <div className={`${styles.sizeBox} ${styles.finalSizeBox}`}>
                <h3
                  className={`${styles.sizeBoxTitle} ${styles.finalSizeTitle}`}
                >
                  Final Size
                </h3>
                <div className={styles.sizeDetails}>
                  <div className={styles.sizeRow}>
                    <span className={styles.finalSizeLabel}>Width:</span>
                    <span
                      className={`${styles.sizeValue} ${styles.finalSizeValue}`}
                    >
                      {Math.round(cropArea.width * (cropScale / 100))}px
                    </span>
                  </div>
                  <div className={styles.sizeRow}>
                    <span className={styles.finalSizeLabel}>Height:</span>
                    <span
                      className={`${styles.sizeValue} ${styles.finalSizeValue}`}
                    >
                      {Math.round(cropArea.height * (cropScale / 100))}px
                    </span>
                  </div>
                </div>
              </div>

              <Divider />

              {/* Scale Control */}
              <div className={styles.scaleControl}>
                <div className={styles.scaleHeader}>
                  <Text strong className={styles.scaleTitle}>
                    Scale ({cropScale}%)
                  </Text>
                  <Button
                    size="small"
                    onClick={() => setCropScale(100)}
                    className={styles.resetButton}
                  >
                    Reset
                  </Button>
                </div>
                <div className={styles.scaleSlider}>
                  <Slider
                    value={cropScale}
                    onChange={(value) => debouncedSetCropScale(value)}
                    max={200}
                    min={25}
                    step={5}
                    className={styles.sliderFull}
                  />
                  <div className={styles.scaleMarkers}>
                    <span>25%</span>
                    <span>100%</span>
                    <span>200%</span>
                  </div>
                </div>
              </div>

              <Divider />

              {/* Export Settings */}
              <div className={styles.exportSettings}>
                <Text strong className={styles.exportTitle}>
                  Export Settings
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
                          value={Math.round(cropArea.width)}
                          onChange={(e) =>
                            setCropArea({
                              ...cropArea,
                              width: Math.min(
                                Number(e.target.value),
                                imageData.width - cropArea.x
                              ),
                            })
                          }
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
                          value={Math.round(cropArea.height)}
                          onChange={(e) =>
                            setCropArea({
                              ...cropArea,
                              height: Math.min(
                                Number(e.target.value),
                                imageData.height - cropArea.y
                              ),
                            })
                          }
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
                          value={Math.round(cropArea.x)}
                          onChange={(e) =>
                            setCropArea({
                              ...cropArea,
                              x: Math.min(
                                Number(e.target.value),
                                imageData.width - cropArea.width
                              ),
                            })
                          }
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
                          value={Math.round(cropArea.y)}
                          onChange={(e) =>
                            setCropArea({
                              ...cropArea,
                              y: Math.min(
                                Number(e.target.value),
                                imageData.height - cropArea.height
                              ),
                            })
                          }
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
                        Width: {Math.round(cropArea.width)}px
                      </Text>
                      <Slider
                        value={cropArea.width}
                        onChange={(value) =>
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
                        Height: {Math.round(cropArea.height)}px
                      </Text>
                      <Slider
                        value={cropArea.height}
                        onChange={(value) =>
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
                        X Position: {Math.round(cropArea.x)}px
                      </Text>
                      <Slider
                        value={cropArea.x}
                        onChange={(value) =>
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
                        Y Position: {Math.round(cropArea.y)}px
                      </Text>
                      <Slider
                        value={cropArea.y}
                        onChange={(value) =>
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

              {/* Quick Aspect Ratios */}
              <div className={styles.quickRatios}>
                <Text strong className={styles.quickRatiosTitle}>
                  Quick Ratios
                </Text>
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

              {/* Grid Toggle */}
              <div className={styles.gridToggle}>
                <Text strong className={styles.gridToggleLabel}>
                  Show rule of thirds grid
                </Text>
                <Switch checked={showGrid} onChange={setShowGrid} />
              </div>

              <Divider />

              {/* Action Buttons */}
              <div className={styles.actionButtons}>
                <Button
                  type="primary"
                  onClick={applyCrop}
                  className={styles.downloadButton}
                  size="large"
                  icon={<Download className={styles.icon} />}
                >
                  Download Cropped Image
                  <div className={styles.downloadSize}>
                    ({Math.round(cropArea.width * (cropScale / 100))}×
                    {Math.round(cropArea.height * (cropScale / 100))})
                  </div>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
