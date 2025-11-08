import { Button, Progress, Tag, Typography } from "antd";
import {
  Calculator,
  Check,
  Copy,
  ImageIcon,
  Layers,
  Maximize as MaximizeIcon,
  Palette,
  RotateCw,
} from "lucide-react";

import useStore from "@common/store/use-store";
import { formatFileSize } from "@common/utils/formatters";

import TabSection from "../../tab-section"; // Import TabSection

import styles from "./style.module.css";

const { Text } = Typography;

export default function AnalysisTab() {
  const store = useStore();
  const { images, activeImageIndex, copyToClipboard, copied } = store;
  const imageData = images[activeImageIndex] || null;

  if (!imageData) {
    return null;
  }

  return (
    <div className={styles.container}>
      <div className={styles.singleColumn}>
        <TabSection
          icon={ImageIcon}
          title="Image Metadata"
          iconColorClass={styles.blueIcon}
        >
          <div className={styles.imageMetadata}>
            <div className={styles.metadataGrid}>
              <div className={styles.metadataBox}>
                <Text className={styles.metadataLabel}>Dimensions</Text>
                <div className={styles.metadataValue}>
                  {imageData.width} × {imageData.height}px
                </div>
              </div>
              {imageData.fileSize && (
                <div className={styles.metadataBox}>
                  <Text className={styles.metadataLabel}>File Size</Text>
                  <div className={styles.metadataValueLarge}>
                    {formatFileSize(imageData.fileSize)}
                  </div>
                </div>
              )}
              {imageData.analysis?.format && (
                <div className={styles.metadataBox}>
                  <Text className={styles.metadataLabel}>Format</Text>
                  <div className={styles.metadataValueLarge}>
                    {imageData.analysis.format}
                  </div>
                </div>
              )}
              {imageData.analysis?.megapixels && (
                <div className={styles.metadataBox}>
                  <Text className={styles.metadataLabel}>Megapixels</Text>
                  <div className={styles.metadataValueLarge}>
                    {imageData.analysis.megapixels} MP
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabSection>

        <TabSection
          icon={Calculator}
          title="Aspect Ratio Analysis"
          iconColorClass={styles.greenIcon}
        >
          <div className={styles.aspectRatioSection}>
            <div className={styles.aspectRatioHighlight}>
              <Text
                strong
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#15803d",
                }}
              >
                Aspect Ratio
              </Text>
              <div className={styles.aspectRatioContent}>
                <span className={styles.aspectRatioValue}>
                  {imageData.simplifiedRatio}
                </span>
                <Button
                  size="small"
                  onClick={() => copyToClipboard(imageData.simplifiedRatio)}
                  style={{ borderColor: "#bbf7d0" }}
                  icon={
                    copied ? (
                      <Check
                        style={{
                          width: "16px",
                          height: "16px",
                          color: "#059669",
                        }}
                      />
                    ) : (
                      <Copy style={{ width: "16px", height: "16px" }} />
                    )
                  }
                />
              </div>
              <div className={styles.aspectRatioDecimal}>
                Decimal: {imageData.aspectRatio.toFixed(4)}
              </div>
            </div>

            {imageData.commonName && (
              <div className={styles.commonFormatBox}>
                <Text
                  strong
                  style={{
                    fontSize: "14px",
                    fontWeight: 500,
                    color: "#1d4ed8",
                  }}
                >
                  Common Format
                </Text>
                <div style={{ marginTop: "8px" }}>
                  <Tag
                    style={{
                      backgroundColor: "#dbeafe",
                      color: "#1e40af",
                      borderColor: "#bfdbfe",
                    }}
                  >
                    {imageData.commonName}
                  </Tag>
                </div>
              </div>
            )}

            <div className={styles.orientationBox}>
              <Text
                strong
                style={{
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#6b21a8",
                  marginBottom: "12px",
                  display: "block",
                }}
              >
                Orientation
              </Text>
              <div className={styles.orientationTags}>
                <Tag
                  color={
                    imageData.analysis?.isLandscape ? "purple" : "default"
                  }
                >
                  <MaximizeIcon
                    style={{
                      width: "12px",
                      height: "12px",
                      marginRight: "4px",
                      display: "inline",
                    }}
                  />
                  Landscape
                </Tag>
                <Tag
                  color={imageData.analysis?.isPortrait ? "purple" : "default"}
                >
                  <RotateCw
                    style={{
                      width: "12px",
                      height: "12px",
                      marginRight: "4px",
                      display: "inline",
                    }}
                  />
                  Portrait
                </Tag>
                <Tag
                  color={imageData.analysis?.isSquare ? "purple" : "default"}
                >
                  <Layers
                    style={{
                      width: "12px",
                      height: "12px",
                      marginRight: "4px",
                      display: "inline",
                    }}
                  />
                  Square
                </Tag>
              </div>
            </div>
          </div>
        </TabSection>

        {/* Enhanced Color Analysis */}
        {imageData.analysis && (
          <TabSection
            icon={Palette}
            title="Advanced Color Analysis"
            iconColorClass={styles.pinkIcon}
          >
            <div className={styles.colorAnalysisSection}>
              <div className={styles.colorAnalysisGrid}>
                <div className={styles.dominantColorsSection}>
                  <Text
                    strong
                    style={{
                      fontSize: "16px",
                      fontWeight: 500,
                      color: "#334155",
                    }}
                  >
                    Dominant Colors
                  </Text>
                  <div className={styles.colorList}>
                    {imageData.analysis.dominantColors
                      .slice(0, 5)
                      .map((color, index) => (
                        <div key={index} className={styles.colorItem}>
                          <div
                            className={styles.colorSwatch}
                            style={{ backgroundColor: color.hex }}
                          />
                          <div className={styles.colorInfo}>
                            <div className={styles.colorHex}>{color.hex}</div>
                            <div className={styles.colorPercentage}>
                              {color.percentage}% coverage
                            </div>
                          </div>
                          <Button
                            size="small"
                            onClick={() => copyToClipboard(color.hex)}
                            icon={
                              <Copy
                                style={{ width: "16px", height: "16px" }}
                              />
                            }
                          />
                        </div>
                      ))}
                  </div>
                </div>

                <div className={styles.propertiesSection}>
                  <div className={styles.brightnessBox}>
                    <Text
                      strong
                      style={{
                        fontSize: "16px",
                        fontWeight: 500,
                        color: "#b45309",
                      }}
                    >
                      Average Brightness
                    </Text>
                    <div className={styles.brightnessProgress}>
                      <Progress
                        percent={
                          (imageData.analysis.averageBrightness / 255) * 100
                        }
                        strokeColor="#f59e0b"
                        trailColor="#fef3c7"
                        showInfo={false}
                      />
                      <div className={styles.brightnessInfo}>
                        <span>
                          {imageData.analysis.averageBrightness}/255
                        </span>
                        <span>
                          {Math.round(
                            (imageData.analysis.averageBrightness / 255) * 100
                          )}
                          %
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className={styles.imagePropertiesBox}>
                    <Text
                      strong
                      style={{
                        fontSize: "16px",
                        fontWeight: 500,
                        color: "#334155",
                      }}
                    >
                      Image Properties
                    </Text>
                    <div className={styles.propertyList}>
                      <div className={styles.propertyItem}>
                        <span className={styles.propertyLabel}>
                          Transparency:
                        </span>
                        <Tag
                          color={
                            imageData.analysis.hasTransparency
                              ? "blue"
                              : "default"
                          }
                        >
                          {imageData.analysis.hasTransparency ? "Yes" : "No"}
                        </Tag>
                      </div>
                      <div className={styles.propertyItem}>
                        <span className={styles.propertyLabel}>
                          Color Depth:
                        </span>
                        <span className={styles.propertyValue}>
                          {imageData.analysis.colorDepth}-bit
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabSection>
        )}
      </div>
    </div>
  );
}
