import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import PreviewPanel from "../../components/PreviewPanel";
import ConfigPanel from "../../components/ConfigPanel";
import styles from "./style.module.css";

export default function Studio({
  onNavigateToHome,
  images,
  activeImageIndex,
  setActiveImageIndex,
  // All image editing state and functions passed from parent
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
  rotation,
  setRotation,
  debouncedSetRotation,
  applyAllChanges,
  downloadImage,
  revertRotation,
  openFullscreen,
  faviconSizes,
  selectedFaviconSizes,
  setSelectedFaviconSizes,
  customFaviconSize,
  setCustomFaviconSize,
  generateFavicons,
  cornerRadius,
  setCornerRadius,
  uniformRadius,
  setUniformRadius,
  applyBorderRadius,
  revertBorderRadius,
  backgroundColor,
  setBackgroundColor,
  removeBackground,
  setRemoveBackground,
  changeBackground,
  revertBackground,
  compressionQuality,
  setCompressionQuality,
  debouncedSetCompressionQuality,
  formatFileSize,
  reduceFileSize,
  revertCompression,
  selectedFormat,
  setSelectedFormat,
  imageFormats,
  convertFormat,
  revertFormat,
  copyToClipboard,
  copied,
  processedImageSrc,
  compressedImageSrc,
  compressedSize,
  compressionRatio,
}) {
  const [activeTool, setActiveTool] = useState("analysis");

  const imageData = images[activeImageIndex] || null;

  // If no images, redirect to home
  useEffect(() => {
    if (images.length === 0) {
      onNavigateToHome();
    }
  }, [images.length, onNavigateToHome]);

  const handleImageChange = (newIndex) => {
    setActiveImageIndex(newIndex);
  };

  return (
    <div className={styles.studioContainer}>
      <Sidebar
        activeTool={activeTool}
        onToolChange={setActiveTool}
        onNavigateToHome={onNavigateToHome}
      />
      <PreviewPanel
        imageData={imageData}
        processedImageSrc={processedImageSrc}
        compressedImageSrc={compressedImageSrc}
        images={images}
        activeImageIndex={activeImageIndex}
        onImageChange={handleImageChange}
        formatFileSize={formatFileSize}
        activeTool={activeTool}
        compressionQuality={compressionQuality}
        compressedSize={compressedSize}
        compressionRatio={compressionRatio}
        faviconSizes={[16, 32, 48, 64, 128, 256]}
        copyToClipboard={copyToClipboard}
        copied={copied}
        cropArea={cropArea}
        setCropArea={setCropArea}
        showGrid={showGrid}
        cropContainerRef={cropContainerRef}
        hasSettingsChanged={hasSettingsChanged}
        revertCrop={revertCrop}
      />
      <ConfigPanel
        activeTool={activeTool}
        imageData={imageData}
        processedImageSrc={processedImageSrc}
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
        rotation={rotation}
        setRotation={setRotation}
        debouncedSetRotation={debouncedSetRotation}
        applyAllChanges={applyAllChanges}
        downloadImage={downloadImage}
        revertRotation={revertRotation}
        openFullscreen={openFullscreen}
        faviconSizes={faviconSizes}
        selectedFaviconSizes={selectedFaviconSizes}
        setSelectedFaviconSizes={setSelectedFaviconSizes}
        customFaviconSize={customFaviconSize}
        setCustomFaviconSize={setCustomFaviconSize}
        generateFavicons={generateFavicons}
        cornerRadius={cornerRadius}
        setCornerRadius={setCornerRadius}
        uniformRadius={uniformRadius}
        setUniformRadius={setUniformRadius}
        applyBorderRadius={applyBorderRadius}
        revertBorderRadius={revertBorderRadius}
        backgroundColor={backgroundColor}
        setBackgroundColor={setBackgroundColor}
        removeBackground={removeBackground}
        setRemoveBackground={setRemoveBackground}
        changeBackground={changeBackground}
        revertBackground={revertBackground}
        compressionQuality={compressionQuality}
        setCompressionQuality={setCompressionQuality}
        debouncedSetCompressionQuality={debouncedSetCompressionQuality}
        formatFileSize={formatFileSize}
        reduceFileSize={reduceFileSize}
        revertCompression={revertCompression}
        selectedFormat={selectedFormat}
        setSelectedFormat={setSelectedFormat}
        imageFormats={imageFormats}
        convertFormat={convertFormat}
        revertFormat={revertFormat}
        copyToClipboard={copyToClipboard}
        copied={copied}
      />
    </div>
  );
}
