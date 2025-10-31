import { Card, Button, Input, Typography, Tag, Divider, Switch } from "antd";
import { Star, Sparkles } from "lucide-react";
import styles from "./style.module.css";

const { Text } = Typography;

export default function FaviconTab({
  imageData,
  faviconSizes,
  selectedFaviconSizes,
  setSelectedFaviconSizes,
  customFaviconSize,
  setCustomFaviconSize,
  generateFavicons,
  toast,
}) {
  return (
    <div className={styles.container}>
      <Card
        className={styles.card}
        title={
          <div className={styles.titleContent}>
            <div className={styles.iconWrapper}>
              <Star style={{ width: '20px', height: '20px', color: '#ca8a04' }} />
            </div>
            Favicon Generator
            <Tag color="yellow" className={styles.tag}>
              Auto-applies all settings
            </Tag>
          </div>
        }
        extra={
          <Text type="secondary" className={styles.extraText}>
            Generate high-quality favicons with all your current modifications
          </Text>
        }
      >
        <div className={styles.content}>
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
                value={customFaviconSize}
                onChange={(e) => setCustomFaviconSize(e.target.value)}
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

          <Divider />

          <div>
            <Text strong className={styles.sectionTitle}>Preview</Text>
            <div className={styles.previewSection}>
              {selectedFaviconSizes.slice(0, 8).map((size) => (
                <div key={size} className={styles.previewItem}>
                  <div
                    className={styles.previewIconContainer}
                    style={{
                      width: Math.min(size, 64),
                      height: Math.min(size, 64),
                    }}
                  >
                    <img
                      src={imageData.src || "/placeholder.svg"}
                      alt={`${size}x${size} favicon`}
                      className={styles.previewImage}
                    />
                  </div>
                  <div className={styles.previewSize}>
                    {size}px
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Button
            type="primary"
            onClick={generateFavicons}
            className={styles.generateButton}
            disabled={selectedFaviconSizes.length === 0}
            size="large"
            icon={<Sparkles style={{ width: '16px', height: '16px' }} />}
          >
            Generate & Download Favicons ({selectedFaviconSizes.length})
          </Button>
        </div>
      </Card>
    </div>
  );
}
