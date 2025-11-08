import { Button, Select, Typography } from "antd";
import { RefreshCw, RotateCcw } from "lucide-react";

import { imageFormats } from "@common/constants";
import useStore from "@common/store/use-store";

import TabSection from "../../tab-section"; // Import TabSection

import styles from "./style.module.css";

const { Text } = Typography;
const { Option } = Select;

export default function ConvertTab({ isBulkMode }) {
  const store = useStore();
  const {
    images,
    activeImageIndex,
    selectedFormat,
    setSelectedFormat,
    convertFormat,
    hasSettingsChanged,
    revertFormat,
    isDownloading,
  } = store;
  const imageData = images[activeImageIndex] || null;

  if (!imageData) {
    return null;
  }

  return (
    <div className={styles.container}>
      <TabSection
        icon={RefreshCw}
        title="Advanced Format Converter"
        iconColorClass={styles.purpleIcon}
        rightContent={
          <>
            {hasSettingsChanged && hasSettingsChanged().format && (
              <Button
                onClick={revertFormat}
                size="small"
                className={styles.revertButton}
                icon={<RotateCcw style={{ width: "16px", height: "16px" }} />}
                disabled={isBulkMode}
              >
                Revert
              </Button>
            )}
            <Text type="secondary" className={styles.extraText}>
              Convert your image to different formats
            </Text>
          </>
        }
      >
        <div className={styles.content}>
          <div className={styles.grid}>
            <div className={styles.leftColumn}>
              <div className={styles.formatSection}>
                <Text strong className={styles.formatLabel}>
                  Target Format
                </Text>
                <Select
                  value={selectedFormat}
                  onChange={setSelectedFormat}
                  size="large"
                  disabled={isBulkMode}
                >
                  {imageFormats && imageFormats.map((format) => (
                    <Option key={format.value} value={format.value}>
                      <div style={{ padding: "0.5rem 0" }}>
                        <div style={{ fontWeight: 500 }}>{format.label}</div>
                        <div
                          style={{ fontSize: "0.75rem", color: "#64748b" }}
                        >
                          {format.description}
                        </div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </div>

              <div className={styles.statsContainer}>
                <div className={styles.statsContent}>
                  <div className={styles.statRow}>
                    <span className={styles.statLabel}>Current format:</span>
                    <span className={styles.statValue}>
                      {imageData.analysis?.format || "Unknown"}
                    </span>
                  </div>
                  <div className={styles.statRow}>
                    <span className={styles.statLabel}>Target format:</span>
                    <span className={styles.statValue}>
                      {selectedFormat.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                type="primary"
                onClick={convertFormat}
                className={styles.downloadButton}
                size="large"
                loading={isDownloading}
                icon={<RefreshCw style={{ width: "16px", height: "16px" }} />}
                disabled={isBulkMode}
              >
                Convert & Download
              </Button>
            </div>

            <div className={styles.rightColumn}>
              <div className={styles.formatInfoSection}>
                <Text strong className={styles.formatInfoTitle}>
                  Format Information
                </Text>
                <div className={styles.formatInfoSection}>
                  {imageFormats && imageFormats.map((format) => (
                    <div
                      key={format.value}
                      className={`${styles.formatCard} ${
                        selectedFormat === format.value
                          ? styles.formatCardSelected
                          : styles.formatCardDefault
                      }`}
                    >
                      <div className={styles.formatCardTitle}>
                        {format.label}
                      </div>
                      <div className={styles.formatCardDescription}>
                        {format.description}
                      </div>
                      <div>
                        <span
                          className={`${styles.formatCardBadge} ${
                            format.supportsTransparency
                              ? styles.formatCardBadgeGreen
                              : styles.formatCardBadgeRed
                          }`}
                        >
                          {format.supportsTransparency
                            ? "✓ Supports transparency"
                            : "✗ No transparency"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </TabSection>
    </div>
  );
}
