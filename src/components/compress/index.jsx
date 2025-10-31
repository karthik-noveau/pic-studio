import { Card, Button, Typography, Slider } from "antd";
import { Minimize, RotateCcw, Download } from "lucide-react";
import styles from "./style.module.css";

const { Text } = Typography;

export default function CompressTab({
  imageData,
  compressionQuality,
  setCompressionQuality,
  debouncedSetCompressionQuality,
  formatFileSize,
  reduceFileSize,
  hasSettingsChanged,
  revertCompression,
}) {
  return (
    <div className={styles.container}>
      <Card
        className={styles.card}
        title={
          <div className={styles.titleContainer}>
            <div className={styles.titleContent}>
              <div className={styles.iconWrapper}>
                <Minimize style={{ width: '20px', height: '20px', color: '#ea580c' }} />
              </div>
              File Size Reducer
            </div>
            {hasSettingsChanged().compression && (
              <Button
                onClick={revertCompression}
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
            Optimize your image for web with smart compression
          </Text>
        }
      >
        <div className={styles.content}>
          <div className={styles.grid}>
            <div className={styles.leftColumn}>
              <div className={styles.sliderSection}>
                <Text strong className={styles.sliderLabel}>
                  Compression Quality: {compressionQuality}%
                </Text>
                <Slider
                  value={compressionQuality}
                  onChange={(value) =>
                    debouncedSetCompressionQuality(value)
                  }
                  max={100}
                  min={10}
                  step={5}
                />
                <div className={styles.sliderMarkers}>
                  <span>Smaller file</span>
                  <span>Better quality</span>
                </div>
              </div>

              <div className={styles.presetsSection}>
                <Text strong className={styles.presetsTitle}>
                  Recommended Settings
                </Text>
                <div className={styles.presetsGrid}>
                  <Button
                    size="small"
                    onClick={() => setCompressionQuality(60)}
                    className={styles.presetButton}
                  >
                    Web Optimized (60%)
                  </Button>
                  <Button
                    size="small"
                    onClick={() => setCompressionQuality(80)}
                    className={styles.presetButton}
                  >
                    Balanced (80%)
                  </Button>
                  <Button
                    size="small"
                    onClick={() => setCompressionQuality(95)}
                    className={styles.presetButton}
                  >
                    High Quality (95%)
                  </Button>
                  <Button
                    size="small"
                    onClick={() => setCompressionQuality(40)}
                    className={styles.presetButton}
                  >
                    Maximum Compression (40%)
                  </Button>
                </div>
              </div>

              {imageData.fileSize && (
                <div className={styles.statsContainer}>
                  <div className={styles.statsContent}>
                    <div className={styles.statRow}>
                      <span className={styles.statLabel}>Original size:</span>
                      <span className={styles.statValue}>
                        {formatFileSize(imageData.fileSize)}
                      </span>
                    </div>
                    <div className={styles.statRow}>
                      <span className={styles.statLabel}>
                        Estimated new size:
                      </span>
                      <span className={styles.statValue}>
                        {formatFileSize(
                          Math.round(
                            imageData.fileSize * (compressionQuality / 100)
                          )
                        )}
                      </span>
                    </div>
                    <div className={styles.statRow}>
                      <span className={styles.statLabel}>Savings:</span>
                      <span className={styles.statValueGreen}>
                        {Math.round(100 - compressionQuality)}% reduction
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <Button
                type="primary"
                onClick={reduceFileSize}
                className={styles.downloadButton}
                size="large"
                icon={<Download style={{ width: '16px', height: '16px' }} />}
              >
                Download Compressed Image
              </Button>
            </div>

            <div className={styles.rightColumn}>
              <div className={styles.analysisSection}>
                <Text strong className={styles.analysisSectionTitle}>
                  Compression Analysis
                </Text>
                <div className={styles.analysisSection}>
                  <div className={`${styles.infoBox} ${styles.infoBoxBlue}`}>
                    <div className={`${styles.infoBoxTitle} ${styles.infoBoxTitleBlue}`}>
                      Format Recommendations
                    </div>
                    <div className={`${styles.infoBoxContent} ${styles.infoBoxContentBlue}`}>
                      {imageData.analysis?.hasTransparency
                        ? "Keep PNG format to preserve transparency"
                        : "JPEG recommended for photos, WebP for best compression"}
                    </div>
                  </div>

                  <div className={`${styles.infoBox} ${styles.infoBoxGreen}`}>
                    <div className={`${styles.infoBoxTitle} ${styles.infoBoxTitleGreen}`}>
                      Quality Guidelines
                    </div>
                    <div className={`${styles.infoBoxContent} ${styles.infoBoxContentGreen} ${styles.guidelinesList}`}>
                      <div>• 90-100%: Print quality</div>
                      <div>• 80-90%: High web quality</div>
                      <div>• 60-80%: Standard web</div>
                      <div>• 40-60%: Thumbnails</div>
                    </div>
                  </div>

                  {imageData.fileSize && imageData.fileSize > 1024 * 1024 && (
                    <div className={`${styles.infoBox} ${styles.infoBoxAmber}`}>
                      <div className={`${styles.infoBoxTitle} ${styles.infoBoxTitleAmber}`}>
                        Size Warning
                      </div>
                      <div className={`${styles.infoBoxContent} ${styles.infoBoxContentAmber}`}>
                        Large file detected. Consider 60-70% quality for web
                        use.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
