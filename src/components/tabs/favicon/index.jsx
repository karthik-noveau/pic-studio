import { useState, useEffect } from "react";
import { Button, Input, Typography, Divider, Switch } from "antd";
import { Sparkles } from "lucide-react";
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
        <div className={styles.cardContent}>
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
      </div>
    </div>
  );
}
