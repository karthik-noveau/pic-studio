import { useState, useEffect } from "react";
import { Button, Input, Typography, Tag, Divider, Switch } from "antd";
import { Star, Sparkles } from "lucide-react";
import styles from "./style.module.css";

const { Text } = Typography;

export default function FaviconTab({
  imageData,
  processedImageSrc,
  faviconSizes,
  selectedFaviconSizes,
  setSelectedFaviconSizes,
  customFaviconSize,
  setCustomFaviconSize,
  generateFavicons,
  toast,
  isDownloading,
}) {
  // Use processed image if available, otherwise use original
  const displaySrc = processedImageSrc || imageData?.src || "/placeholder.svg";

  // Temporary state for custom size input
  const [tempCustomSize, setTempCustomSize] = useState(customFaviconSize);

  // Sync temp value when parent state changes
  useEffect(() => {
    setTempCustomSize(customFaviconSize);
  }, [customFaviconSize]);

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div className={styles.titleContent}>
            <div className={styles.iconWrapper}>
              <Star style={{ width: '20px', height: '20px', color: '#ca8a04' }} />
            </div>
            Favicon Generator
            <Tag color="yellow" className={styles.tag}>
              Auto-applies all settings
            </Tag>
          </div>
          <Text type="secondary" className={styles.extraText}>
            Generate high-quality favicons with all your current modifications
          </Text>
        </div>
        <div className={styles.cardContent}>
        <div className={styles.content}>
          <div className={styles.grid}>
            {/* Left Column - Controls */}
            <div className={styles.leftColumn}>
              <div>
                <Text strong className={styles.sectionTitle}>
                  Select Favicon Sizes
                </Text>
                <div className={styles.faviconGrid}>
                  {faviconSizes.map((favicon) => (
                    <div
                      key={favicon.size}
                      className={styles.faviconItem}
                    >
                      <Switch
                        id={`favicon-${favicon.size}`}
                        checked={selectedFaviconSizes.includes(favicon.size)}
                        onChange={(checked) => {
                          if (checked) {
                            setSelectedFaviconSizes([
                              ...selectedFaviconSizes,
                              favicon.size,
                            ]);
                          } else {
                            setSelectedFaviconSizes(
                              selectedFaviconSizes.filter((s) => s !== favicon.size)
                            );
                          }
                        }}
                      />
                      <label
                        htmlFor={`favicon-${favicon.size}`}
                        className={styles.faviconLabel}
                      >
                        <div className={styles.faviconName}>{favicon.name}</div>
                        <div className={styles.faviconDescription}>
                          {favicon.description}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.buttonGroup}>
                <Button
                  onClick={() =>
                    setSelectedFaviconSizes(faviconSizes.map((f) => f.size))
                  }
                  size="small"
                >
                  Select All
                </Button>
                <Button
                  onClick={() => setSelectedFaviconSizes([])}
                  size="small"
                >
                  Clear All
                </Button>
                <Button
                  onClick={() =>
                    setSelectedFaviconSizes([16, 32, 48, 96, 180, 192])
                  }
                  size="small"
                >
                  Web Standard
                </Button>
              </div>

              <Divider />

              {/* Custom size input */}
              <div className={styles.customSizeSection}>
                <Text strong className={styles.sectionTitle}>Custom Size</Text>
                <div className={styles.customSizeInputGroup}>
                  <Input
                    type="number"
                    placeholder="Enter custom size (e.g., 256)"
                    value={tempCustomSize}
                    onChange={(e) => setTempCustomSize(e.target.value)}
                    onBlur={(e) => setCustomFaviconSize(e.target.value)}
                    className={styles.customSizeInput}
                    min="16"
                    max="1024"
                  />
                  <Button
                    onClick={() => {
                      const size = Number.parseInt(customFaviconSize);
                      if (
                        size >= 16 &&
                        size <= 1024 &&
                        !selectedFaviconSizes.includes(size)
                      ) {
                        setSelectedFaviconSizes([...selectedFaviconSizes, size]);
                        setCustomFaviconSize("");
                        toast({
                          title: "Custom size added",
                          description: `${size}x${size}px favicon size added to selection.`,
                        });
                      }
                    }}
                    disabled={
                      !customFaviconSize ||
                      Number.parseInt(customFaviconSize) < 16 ||
                      Number.parseInt(customFaviconSize) > 1024
                    }
                  >
                    Add Size
                  </Button>
                </div>
                <p className={styles.customSizeHint}>
                  Size must be between 16px and 1024px
                </p>
              </div>

              <Button
                type="primary"
                onClick={generateFavicons}
                className={styles.generateButton}
                disabled={selectedFaviconSizes.length === 0}
                size="large"
                loading={isDownloading}
                icon={<Sparkles style={{ width: '16px', height: '16px' }} />}
              >
                Generate & Download Favicons ({selectedFaviconSizes.length})
              </Button>
            </div>

            {/* Right Column - Preview */}
            <div className={styles.rightColumn}>
              <Text strong className={styles.previewLabel}>
                Live Preview - Selected Sizes
              </Text>
              <div className={styles.previewContainer}>
                {selectedFaviconSizes.length === 0 ? (
                  <div className={styles.emptyPreview}>
                    <Text type="secondary">Select favicon sizes to preview</Text>
                  </div>
                ) : (
                  <div className={styles.previewSection}>
                    {selectedFaviconSizes.map((size) => (
                      <div key={size} className={styles.previewItem}>
                        <div
                          className={styles.previewIconContainer}
                          style={{
                            width: Math.min(size, 96),
                            height: Math.min(size, 96),
                          }}
                        >
                          <img
                            src={displaySrc}
                            alt={`${size}x${size} favicon`}
                            className={styles.previewImage}
                          />
                        </div>
                        <div className={styles.previewSize}>
                          {size}×{size}px
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
