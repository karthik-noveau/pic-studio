import { Card, Button, Typography, Slider, Select } from "antd";
import { RefreshCw, RotateCcw } from "lucide-react";
import styles from "./style.module.css";

const { Text } = Typography;
const { Option } = Select;

export default function ConvertTab({
  imageData,
  selectedFormat,
  setSelectedFormat,
  conversionQuality,
  setConversionQuality,
  imageFormats,
  convertFormat,
  hasSettingsChanged,
  revertFormat,
}) {
  return (
    <div className={styles.container}>
      <Card
        className={styles.card}
        title={
          <div className={styles.titleContainer}>
            <div className={styles.titleContent}>
              <div className={styles.iconWrapper}>
                <RefreshCw style={{ width: '20px', height: '20px', color: '#4f46e5' }} />
              </div>
              Advanced Format Converter
            </div>
            {hasSettingsChanged().format && (
              <Button
                onClick={revertFormat}
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
            Convert your image to different formats with quality control
          </Text>
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
                >
                  {imageFormats.map((format) => (
                    <Option key={format.value} value={format.value}>
                      <div style={{ padding: '0.5rem 0' }}>
                        <div style={{ fontWeight: 500 }}>{format.label}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {format.description}
                        </div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </div>

              <div className={styles.qualitySection}>
                <Text strong className={styles.qualityLabel}>
                  Quality: {conversionQuality}%
                </Text>
                <Slider
                  value={conversionQuality}
                  onChange={(value) => setConversionQuality(value)}
                  max={100}
                  min={10}
                  step={5}
                />
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
                  <div className={styles.statRow}>
                    <span className={styles.statLabel}>Quality setting:</span>
                    <span className={styles.statValue}>
                      {conversionQuality}%
                    </span>
                  </div>
                </div>
              </div>

              <Button
                type="primary"
                onClick={convertFormat}
                className={styles.downloadButton}
                size="large"
                icon={<RefreshCw style={{ width: '16px', height: '16px' }} />}
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
                  {imageFormats.map((format) => (
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
      </Card>
    </div>
  );
}
