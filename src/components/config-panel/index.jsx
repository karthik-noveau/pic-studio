import { Button, Divider } from "antd";
import { Settings, Download, RotateCcw } from "lucide-react";
import styles from "./style.module.css";

// Import tab components
import AnalysisTab from "../tabs/analysis";
import CropTab from "../tabs/crop";
import RotateTab from "../tabs/rotate";
import FaviconTab from "../tabs/favicon";
import BorderRadiusTab from "../tabs/border-radius";
import BackgroundTab from "../tabs/background";
import CompressTab from "../tabs/compress";
import ConvertTab from "../tabs/convert";

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

export default function ConfigPanel({
  activeTool,
  imageData,
  processedImageSrc,
  // Crop props
  cropArea,
  setCropArea,
  showGrid,
  setShowGrid,
  cropInputMode,
  setCropInputMode,
  simplifyRatio,
  applyCrop,
  hasSettingsChanged,
  revertCrop,
  cropContainerRef,
  commonAspectRatios,
  isDownloading,
  // Rotate props
  rotation,
  setRotation,
  debouncedSetRotation,
  applyAllChanges,
  downloadImage,
  revertRotation,
  openFullscreen,
  // Favicon props
  faviconSizes,
  selectedFaviconSizes,
  setSelectedFaviconSizes,
  customFaviconSize,
  setCustomFaviconSize,
  generateFavicons,
  // Border props
  cornerRadius,
  setCornerRadius,
  uniformRadius,
  setUniformRadius,
  applyBorderRadius,
  revertBorderRadius,
  // Background props
  backgroundColor,
  setBackgroundColor,
  removeBackground,
  setRemoveBackground,
  changeBackground,
  revertBackground,
  // Compress props
  compressionQuality,
  setCompressionQuality,
  debouncedSetCompressionQuality,
  formatFileSize,
  reduceFileSize,
  revertCompression,
  // Convert props
  selectedFormat,
  setSelectedFormat,
  imageFormats,
  convertFormat,
  revertFormat,
  // Analysis props
  copyToClipboard,
  copied,
  transparentImageSrc, // New prop
  setTransparentImageSrc, // New prop
}) {
  const renderToolContent = () => {
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

    switch (activeTool) {
      case "analysis":
        return (
          <AnalysisTab
            imageData={imageData}
            processedImageSrc={processedImageSrc}
            formatFileSize={formatFileSize}
            copyToClipboard={copyToClipboard}
            copied={copied}
            openFullscreen={openFullscreen}
          />
        );
      case "crop":
        return (
          <CropTab
            imageData={imageData}
            cropArea={cropArea}
            setCropArea={setCropArea}
            showGrid={showGrid}
            setShowGrid={setShowGrid}
            cropInputMode={cropInputMode}
            setCropInputMode={setCropInputMode}
            simplifyRatio={simplifyRatio}
            applyCrop={applyCrop}
            hasSettingsChanged={hasSettingsChanged}
            revertCrop={revertCrop}
            cropContainerRef={cropContainerRef}
            commonAspectRatios={commonAspectRatios}
            isDownloading={isDownloading}
          />
        );
      case "rotate":
        return (
          <RotateTab
            imageData={imageData}
            processedImageSrc={processedImageSrc}
            rotation={rotation}
            setRotation={setRotation}
            debouncedSetRotation={debouncedSetRotation}
            applyAllChanges={applyAllChanges}
            downloadImage={downloadImage}
            hasSettingsChanged={hasSettingsChanged}
            revertRotation={revertRotation}
            openFullscreen={openFullscreen}
            isDownloading={isDownloading}
          />
        );
      case "favicon":
        return (
          <FaviconTab
            imageData={imageData}
            processedImageSrc={processedImageSrc}
            faviconSizes={faviconSizes}
            selectedFaviconSizes={selectedFaviconSizes}
            setSelectedFaviconSizes={setSelectedFaviconSizes}
            customFaviconSize={customFaviconSize}
            setCustomFaviconSize={setCustomFaviconSize}
            generateFavicons={generateFavicons}
            isDownloading={isDownloading}
          />
        );
      case "border":
        return (
          <BorderRadiusTab
            imageData={imageData}
            processedImageSrc={processedImageSrc}
            cornerRadius={cornerRadius}
            setCornerRadius={setCornerRadius}
            uniformRadius={uniformRadius}
            setUniformRadius={setUniformRadius}
            applyBorderRadius={applyBorderRadius}
            hasSettingsChanged={hasSettingsChanged}
            revertBorderRadius={revertBorderRadius}
            openFullscreen={openFullscreen}
            isDownloading={isDownloading}
          />
        );
      case "background":
        return (
          <BackgroundTab
            imageData={imageData}
            processedImageSrc={processedImageSrc}
            backgroundColor={backgroundColor}
            setBackgroundColor={setBackgroundColor}
            removeBackground={removeBackground}
            setRemoveBackground={setRemoveBackground}
            changeBackground={changeBackground}
            hasSettingsChanged={hasSettingsChanged}
            revertBackground={revertBackground}
            openFullscreen={openFullscreen}
            isDownloading={isDownloading}
            transparentImageSrc={transparentImageSrc} // Pass transparentImageSrc
            setTransparentImageSrc={setTransparentImageSrc} // Pass setTransparentImageSrc
          />
        );
      case "compress":
        return (
          <CompressTab
            imageData={imageData}
            processedImageSrc={processedImageSrc}
            compressionQuality={compressionQuality}
            setCompressionQuality={setCompressionQuality}
            debouncedSetCompressionQuality={debouncedSetCompressionQuality}
            formatFileSize={formatFileSize}
            reduceFileSize={reduceFileSize}
            hasSettingsChanged={hasSettingsChanged}
            revertCompression={revertCompression}
            openFullscreen={openFullscreen}
            isDownloading={isDownloading}
          />
        );
      case "convert":
        return (
          <ConvertTab
            imageData={imageData}
            processedImageSrc={processedImageSrc}
            selectedFormat={selectedFormat}
            setSelectedFormat={setSelectedFormat}
            imageFormats={imageFormats}
            convertFormat={convertFormat}
            hasSettingsChanged={hasSettingsChanged}
            revertFormat={revertFormat}
            isDownloading={isDownloading}
          />
        );
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

  return (
    <div className={styles.configPanel}>
      {imageData && activeTool && (
        <>
          <div className={styles.configHeader}>
            <div className={styles.headerContent}>
              <Settings className={styles.headerIcon} />
              <div className={styles.headerText}>
                <h3 className={styles.configTitle}>{toolTitles[activeTool]}</h3>
                <p className={styles.configDesc}>{toolDescriptions[activeTool]}</p>
              </div>
            </div>
          </div>
          <Divider className={styles.divider} />
        </>
      )}

      <div className={styles.configContent}>
        {renderToolContent()}
      </div>
    </div>
  );
}
