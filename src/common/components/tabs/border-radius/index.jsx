import { useEffect, useState } from "react";

import { Button, Slider, Switch, Typography } from "antd";
import { CornerUpRight, Download, RotateCcw } from "lucide-react";

import useStore from "@common/store/use-store";

import TabSection from "../../tab-section"; // Import TabSection

import styles from "./style.module.css";

const { Text } = Typography;

export default function BorderRadiusTab({ isBulkMode }) {
  const store = useStore();
  const {
    cornerRadius,
    setCornerRadius,
    uniformRadius,
    setUniformRadius,
    applyBorderRadius,
    hasSettingsChanged,
    revertBorderRadius,
  } = store;

  const [localCornerRadius, setLocalCornerRadius] = useState(cornerRadius);

  useEffect(() => {
    setLocalCornerRadius(cornerRadius);
  }, [cornerRadius]);

  return (
    <div className={styles.container}>
      <TabSection
        icon={CornerUpRight}
        title="Individual Corner Radius Editor"
        iconColorClass={styles.purpleIcon}
        rightContent={
          <>
            {hasSettingsChanged && hasSettingsChanged().border && (
              <Button
                onClick={revertBorderRadius}
                size="small"
                className={styles.revertButton}
                icon={<RotateCcw style={{ width: "16px", height: "16px" }} />}
                disabled={isBulkMode}
              >
                Revert
              </Button>
            )}
            <Text type="secondary" className={styles.extraText}>
              Set different border radius for each corner with precision
            </Text>
          </>
        }
      >
        <div className={styles.uniformRadiusContainer}>
          <Text strong className={styles.uniformRadiusText}>
            Uniform radius for all corners
          </Text>
          <Switch
            checked={uniformRadius}
            onChange={setUniformRadius}
            disabled={isBulkMode}
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
              disabled={isBulkMode}
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
                disabled={isBulkMode}
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
                disabled={isBulkMode}
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
                disabled={isBulkMode}
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
                disabled={isBulkMode}
              />
            </div>
          </div>
        )}

        <div className={styles.presetsSection}>
          <Text strong className={styles.presetsTitle}>
            Quick Presets
          </Text>
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
              disabled={isBulkMode}
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
              disabled={isBulkMode}
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
              disabled={isBulkMode}
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
              disabled={isBulkMode}
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
          icon={<Download style={{ width: "16px", height: "16px" }} />}
          disabled={isBulkMode}
        >
          Download Rounded Image
        </Button>
      </TabSection>
    </div>
  );
}
