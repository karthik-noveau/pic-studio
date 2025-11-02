import { useState, useEffect } from "react";
import { Button, Typography, Slider, Switch } from "antd";
import { CornerUpRight, RotateCcw, Download, Maximize } from "lucide-react";
import styles from "./style.module.css";
import parentStyles from "../../style.module.css";

const { Text } = Typography;

export default function BorderRadiusTab({
  imageData,
  processedImageSrc,
  cornerRadius,
  setCornerRadius,
  uniformRadius,
  setUniformRadius,
  applyBorderRadius,
  hasSettingsChanged,
  revertBorderRadius,
  zoomLevel,
  openFullscreen,
  isDownloading,
}) {
  // Use processed image if available, otherwise use original
  const displaySrc = processedImageSrc || imageData?.src || "/placeholder.svg";

  // Local state for smooth slider interaction
  const [localCornerRadius, setLocalCornerRadius] = useState(cornerRadius);

  // Sync local corner radius with prop
  useEffect(() => {
    setLocalCornerRadius(cornerRadius);
  }, [cornerRadius]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.titleContent}>
            <div className={styles.iconWrapper}>
              <CornerUpRight style={{ width: '20px', height: '20px', color: '#9333ea' }} />
            </div>
            Individual Corner Radius Editor
          </div>
          <div className={styles.cardHeaderRight}>
            {hasSettingsChanged().border && (
              <Button
                onClick={revertBorderRadius}
                size="small"
                className={styles.revertButton}
                icon={<RotateCcw style={{ width: '16px', height: '16px' }} />}
              >
                Revert
              </Button>
            )}
            <Text type="secondary" className={styles.extraText}>
              Set different border radius for each corner with precision
            </Text>
          </div>
        </div>
        <div className={styles.cardContent}>
              <div className={styles.uniformRadiusContainer}>
                <Text strong className={styles.uniformRadiusText}>
                  Uniform radius for all corners
                </Text>
                <Switch
                  checked={uniformRadius}
                  onChange={setUniformRadius}
                />
              </div>

              {uniformRadius ? (
                <div className={styles.sliderSection}>
                  <Text strong className={styles.sliderLabel}>
                    Border Radius: {localCornerRadius.topLeft}%
                  </Text>
                  <Slider
                    value={localCornerRadius.topLeft}
                    onChange={(value) =>
                      setLocalCornerRadius({
                        topLeft: value,
                        topRight: value,
                        bottomLeft: value,
                        bottomRight: value,
                      })
                    }
                    onChangeComplete={(value) =>
                      setCornerRadius({
                        topLeft: value,
                        topRight: value,
                        bottomLeft: value,
                        bottomRight: value,
                      })
                    }
                    max={50}
                    min={0}
                    step={1}
                  />
                </div>
              ) : (
                <div className={styles.cornerGrid}>
                  <div className={styles.cornerSection}>
                    <Text strong className={styles.cornerLabel}>
                      Top Left: {localCornerRadius.topLeft}%
                    </Text>
                    <Slider
                      value={localCornerRadius.topLeft}
                      onChange={(value) =>
                        setLocalCornerRadius({
                          ...localCornerRadius,
                          topLeft: value,
                        })
                      }
                      onChangeComplete={(value) =>
                        setCornerRadius({
                          ...cornerRadius,
                          topLeft: value,
                        })
                      }
                      max={50}
                      min={0}
                      step={1}
                    />
                  </div>
                  <div className={styles.cornerSection}>
                    <Text strong className={styles.cornerLabel}>
                      Top Right: {localCornerRadius.topRight}%
                    </Text>
                    <Slider
                      value={localCornerRadius.topRight}
                      onChange={(value) =>
                        setLocalCornerRadius({
                          ...localCornerRadius,
                          topRight: value,
                        })
                      }
                      onChangeComplete={(value) =>
                        setCornerRadius({
                          ...cornerRadius,
                          topRight: value,
                        })
                      }
                      max={50}
                      min={0}
                      step={1}
                    />
                  </div>
                  <div className={styles.cornerSection}>
                    <Text strong className={styles.cornerLabel}>
                      Bottom Left: {localCornerRadius.bottomLeft}%
                    </Text>
                    <Slider
                      value={localCornerRadius.bottomLeft}
                      onChange={(value) =>
                        setLocalCornerRadius({
                          ...localCornerRadius,
                          bottomLeft: value,
                        })
                      }
                      onChangeComplete={(value) =>
                        setCornerRadius({
                          ...cornerRadius,
                          bottomLeft: value,
                        })
                      }
                      max={50}
                      min={0}
                      step={1}
                    />
                  </div>
                  <div className={styles.cornerSection}>
                    <Text strong className={styles.cornerLabel}>
                      Bottom Right: {localCornerRadius.bottomRight}%
                    </Text>
                    <Slider
                      value={localCornerRadius.bottomRight}
                      onChange={(value) =>
                        setLocalCornerRadius({
                          ...localCornerRadius,
                          bottomRight: value,
                        })
                      }
                      onChangeComplete={(value) =>
                        setCornerRadius({
                          ...cornerRadius,
                          bottomRight: value,
                        })
                      }
                      max={50}
                      min={0}
                      step={1}
                    />
                  </div>
                </div>
              )}

              <div className={styles.presetsSection}>
                <Text strong className={styles.presetsTitle}>Quick Presets</Text>
                <div className={styles.presetsGrid}>
                  <Button
                    size="small"
                    onClick={() =>
                      setCornerRadius({
                        topLeft: 0,
                        topRight: 0,
                        bottomLeft: 0,
                        bottomRight: 0,
                      })
                    }
                    className={styles.presetButton}
                  >
                    No Radius
                  </Button>
                  <Button
                    size="small"
                    onClick={() =>
                      setCornerRadius({
                        topLeft: 10,
                        topRight: 10,
                        bottomLeft: 10,
                        bottomRight: 10,
                      })
                    }
                    className={styles.presetButton}
                  >
                    Slight (10%)
                  </Button>
                  <Button
                    size="small"
                    onClick={() =>
                      setCornerRadius({
                        topLeft: 25,
                        topRight: 25,
                        bottomLeft: 25,
                        bottomRight: 25,
                      })
                    }
                    className={styles.presetButton}
                  >
                    Medium (25%)
                  </Button>
                  <Button
                    size="small"
                    onClick={() =>
                      setCornerRadius({
                        topLeft: 50,
                        topRight: 50,
                        bottomLeft: 50,
                        bottomRight: 50,
                      })
                    }
                    className={styles.presetButton}
                  >
                    Circle (50%)
                  </Button>
                </div>
              </div>

              <Button
                type="primary"
                onClick={applyBorderRadius}
                className={styles.downloadButton}
                size="large"
                loading={isDownloading}
                icon={<Download style={{ width: '16px', height: '16px' }} />}
              >
                Download Rounded Image
              </Button>
        </div>
      </div>
    </div>
  );
}
