import { Card, Button, Input, Typography, Switch } from "antd";
import { Paintbrush, RotateCcw, Download } from "lucide-react";
import styles from "./style.module.css";

const { Text } = Typography;

export default function BackgroundTab({
  imageData,
  backgroundColor,
  setBackgroundColor,
  removeBackground,
  setRemoveBackground,
  changeBackground,
  hasSettingsChanged,
  revertBackground,
}) {
  return (
    <div className={styles.container}>
      <Card
        className={styles.card}
        title={
          <div className={styles.titleContainer}>
            <div className={styles.titleContent}>
              <div className={styles.iconWrapper}>
                <Paintbrush style={{ width: '20px', height: '20px', color: '#db2777' }} />
              </div>
              Background Editor
            </div>
            {hasSettingsChanged().background && (
              <Button
                onClick={revertBackground}
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
            Change or remove the background of your image
          </Text>
        }
      >
        <div className={styles.content}>
          <div className={styles.grid}>
            <div className={styles.leftColumn}>
              <div className={styles.removeBackgroundContainer}>
                <Text strong className={styles.removeBackgroundText}>
                  Remove background (transparent)
                </Text>
                <Switch
                  checked={removeBackground}
                  onChange={setRemoveBackground}
                />
              </div>

              {!removeBackground && (
                <div className={styles.colorSection}>
                  <Text strong className={styles.colorLabel}>
                    Background Color
                  </Text>
                  <div className={styles.colorInputGroup}>
                    <Input
                      type="color"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      className={styles.colorPicker}
                    />
                    <Input
                      type="text"
                      value={backgroundColor}
                      onChange={(e) => setBackgroundColor(e.target.value)}
                      placeholder="#ffffff"
                      className={styles.colorTextInput}
                    />
                  </div>
                </div>
              )}

              <div className={styles.quickColorsSection}>
                <Text strong className={styles.quickColorsTitle}>Quick Colors</Text>
                <div className={styles.quickColorsGrid}>
                  {[
                    "#ffffff",
                    "#000000",
                    "#f3f4f6",
                    "#3b82f6",
                    "#ef4444",
                    "#10b981",
                    "#f59e0b",
                    "#8b5cf6",
                  ].map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setBackgroundColor(color);
                        setRemoveBackground(false);
                      }}
                      className={styles.colorButton}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <Button
                type="primary"
                onClick={changeBackground}
                className={styles.downloadButton}
                size="large"
                icon={<Download style={{ width: '16px', height: '16px' }} />}
              >
                Download with New Background
              </Button>
            </div>

            <div className={styles.rightColumn}>
              <Text strong className={styles.previewLabel}>
                Live Preview
              </Text>
              <div
                className={styles.previewContainer}
                style={{
                  backgroundColor: removeBackground
                    ? "transparent"
                    : backgroundColor,
                  backgroundImage: removeBackground
                    ? "linear-gradient(45deg, #e2e8f0 25%, transparent 25%), linear-gradient(-45deg, #e2e8f0 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e2e8f0 75%), linear-gradient(-45deg, transparent 75%, #e2e8f0 75%)"
                    : "none",
                  backgroundSize: removeBackground ? "20px 20px" : "auto",
                  backgroundPosition: removeBackground
                    ? "0 0, 0 10px, 10px -10px, -10px 0px"
                    : "auto",
                }}
              >
                <img
                  src={imageData.src || "/placeholder.svg"}
                  alt="Background preview"
                  className={styles.previewImage}
                />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
