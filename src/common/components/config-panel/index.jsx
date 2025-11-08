import { Button, Tabs } from "antd";
import { RotateCcw, Settings } from "lucide-react";

import useStore from "@common/store/use-store";

import {
  AnalysisTab,
  BackgroundTab,
  BorderRadiusTab,
  BulkSettingsTab,
  CompressTab,
  ConvertTab,
  CropTab,
  FaviconTab,
  RotateTab,
} from "../index.jsx";

import styles from "./style.module.css";

const toolTitles = {
  analysis: "Image Analysis",
  crop: "Crop & Resize",
  rotate: "Rotate & Flip",
  border: "Border Radius",
  background: "Background",
  compress: "Compress",
  convert: "Format Conversion",
  favicon: "Favicon Generator",
};

const toolDescriptions = {
  analysis: "View detailed information about your image",
  crop: "Adjust aspect ratio and crop your image",
  rotate: "Rotate and flip your image",
  border: "Add rounded corners to your image",
  background: "Change or remove background",
  compress: "Reduce file size while maintaining quality",
  convert: "Convert image to different formats",
  favicon: "Generate favicons in multiple sizes",
};



export default function ConfigPanel({ activeTool, selectedIndices }) {
  const store = useStore();
  const {
    images,
    activeImageIndex,
    revertCrop,
    revertRotation,
    revertBorderRadius,
    revertBackground,
    revertCompression,
    revertFormat,
  } = store;
  const imageData = images[activeImageIndex] || null;

  const revertActions = {
    crop: revertCrop,
    rotate: revertRotation,
    border: revertBorderRadius,
    background: revertBackground,
    compress: revertCompression,
    convert: revertFormat,
  };

  const isBulkMode = selectedIndices && selectedIndices.length > 1;

  const renderToolContent = (isBulk) => {
    if (!imageData) {
      return (
        <div className={styles.emptyState}>
          <Settings className={styles.emptyIcon} />
          <h3 className={styles.emptyTitle}>No Image Loaded</h3>
          <p className={styles.emptyDesc}>
            Please upload an image to access editing tools
          </p>
        </div>
      );
    }

    const props = { isBulkMode: isBulk };

    switch (activeTool) {
      case "analysis":
        return <AnalysisTab {...props} />;
      case "crop":
        return <CropTab {...props} />;
      case "rotate":
        return <RotateTab {...props} />;
      case "favicon":
        return <FaviconTab {...props} />;
      case "border":
        return <BorderRadiusTab {...props} />;
      case "background":
        return <BackgroundTab {...props} />;
      case "compress":
        return <CompressTab {...props} />;
      case "convert":
        return <ConvertTab {...props} />;
      default:
        return (
          <div className={styles.emptyState}>
            <Settings className={styles.emptyIcon} />
            <h3 className={styles.emptyTitle}>Select a Tool</h3>
            <p className={styles.emptyDesc}>
              Choose a tool from the left sidebar to begin editing
            </p>
          </div>
        );
    }
  };

  const onRevert = revertActions[activeTool];

  return (
    <div className={styles.configPanel}>
      {imageData && activeTool && (
        <>
          <div className={styles.configHeader}>
            <div className={styles.headerContent}>
              <div className={styles.headerText}>
                <h3 className={styles.configTitle}>{toolTitles[activeTool]}</h3>
                <p className={styles.configDesc}>
                  {toolDescriptions[activeTool]}
                </p>
              </div>
              {onRevert && (
                <Button
                  size="small"
                  icon={<RotateCcw size={14} />}
                  onClick={onRevert}
                >
                  Reset
                </Button>
              )}
            </div>
          </div>
          {isBulkMode ? (
            <Tabs defaultValue="current" className={styles.tabs}>
              <Tabs.TabPane tab="Current Image" key="current">
                <div className={styles.configContent}>
                  {renderToolContent(true)}
                </div>
              </Tabs.TabPane>
              <Tabs.TabPane tab="Bulk Settings" key="bulk">
                <div className={styles.configContent}>
                  <BulkSettingsTab
                    activeTool={activeTool}
                    selectedIndices={selectedIndices}
                  />
                </div>
              </Tabs.TabPane>
            </Tabs>
          ) : (
            <div className={styles.configContent}>{renderToolContent(false)}</div>
          )}
        </>
      )}
    </div>
  );
}
