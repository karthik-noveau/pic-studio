import { Card, Button, Typography, Slider, Switch } from "antd";
import { CornerUpRight, RotateCcw, Download } from "lucide-react";
import styles from "./style.module.css";

const { Text } = Typography;

export default function BorderRadiusTab({
  imageData,
  cornerRadius,
  setCornerRadius,
  uniformRadius,
  setUniformRadius,
  applyBorderRadius,
  hasSettingsChanged,
  revertBorderRadius,
}) {
  return (
    <div className={styles.container}>
      <Card
        className={styles.card}
        title={
          <div className={styles.titleContainer}>
            <div className={styles.titleContent}>
              <div className={styles.iconWrapper}>
                <CornerUpRight style={{ width: '20px', height: '20px', color: '#9333ea' }} />
              </div>
              Individual Corner Radius Editor
            </div>
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
          </div>
        }
        extra={
          <Text type="secondary" className={styles.extraText}>
            Set different border radius for each corner with precision
          </Text>
        }
      >
        <div className={styles.content}>
          <div className={styles.grid}>
            <div className={styles.leftColumn}>
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
                    Border Radius: {cornerRadius.topLeft}%
                  </Text>
                  <Slider
                    value={cornerRadius.topLeft}
                    onChange={(value) =>
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
                      Top Left: {cornerRadius.topLeft}%
                    </Text>
                    <Slider
                      value={cornerRadius.topLeft}
                      onChange={(value) =>
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
                      Top Right: {cornerRadius.topRight}%
                    </Text>
                    <Slider
                      value={cornerRadius.topRight}
                      onChange={(value) =>
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
                      Bottom Left: {cornerRadius.bottomLeft}%
                    </Text>
                    <Slider
                      value={cornerRadius.bottomLeft}
                      onChange={(value) =>
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
                      Bottom Right: {cornerRadius.bottomRight}%
                    </Text>
                    <Slider
                      value={cornerRadius.bottomRight}
                      onChange={(value) =>
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
                icon={<Download style={{ width: '16px', height: '16px' }} />}
              >
                Download Rounded Image
              </Button>
            </div>

            <div className={styles.rightColumn}>
              <Text strong className={styles.previewLabel}>
                Live Preview
              </Text>
              <div className={styles.previewContainer}>
                <img
                  src={imageData.src || "/placeholder.svg"}
                  alt="Border radius preview"
                  className={styles.previewImage}
                  style={{
                    borderTopLeftRadius: `${cornerRadius.topLeft}%`,
                    borderTopRightRadius: `${cornerRadius.topRight}%`,
                    borderBottomLeftRadius: `${cornerRadius.bottomLeft}%`,
                    borderBottomRightRadius: `${cornerRadius.bottomRight}%`,
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
