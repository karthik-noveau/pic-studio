import { useEffect, useState } from "react";

import { Button } from "antd";
import { Download, RotateCcw, Upload } from "lucide-react";

import logo from "@assets/logo.png";
import {
  ConfigPanel,
  ImagesList,
  PreviewPanel,
  Sidebar,
} from "@common/components";
import useStore from "@common/store/use-store";
import { formatFileSize } from "@common/utils/formatters";

import styles from "./style.module.css";

export default function Studio() {
  const [activeTool, setActiveTool] = useState(null);
  const [isConfigPanelOpen, setIsConfigPanelOpen] = useState(false);
  const [selectedIndices, setSelectedIndices] = useState([]);
  const [editedTools, setEditedTools] = useState([]);

  const store = useStore();
  const {
    images,
    activeImageIndex,
    setActiveImageIndex,
    navigateToHome,
    exportAll,
    revertAll,
    isDownloading,
    hasSettingsChanged,
    compressedImageSrc,
    compressionQuality,
    compressedSize,
    compressionRatio,
    faviconSizes,
    cropArea,
    setCropArea,
    showGrid,
    applyAllChanges,
  } = store;

  const imageData = images[activeImageIndex] || null;

  useEffect(() => {
    if (images.length === 0) {
      navigateToHome();
    }
  }, [images.length, navigateToHome]);

  useEffect(() => {
    if (hasSettingsChanged) {
      const changes = hasSettingsChanged();
      const edited = Object.keys(changes).filter((key) => changes[key]);
      setEditedTools(edited);
    }
  }, [hasSettingsChanged, images, activeImageIndex]);

  const handleToolChange = (tool) => {
    if (activeTool === tool) {
      setIsConfigPanelOpen(!isConfigPanelOpen);
    } else {
      setActiveTool(tool);
      setIsConfigPanelOpen(true);
    }
  };

  const handleImageChange = (newIndex) => {
    setActiveImageIndex(newIndex);
    setSelectedIndices([newIndex]);
  };

  const handleSelectAll = () => {
    if (selectedIndices.length === images.length) {
      setSelectedIndices([]);
    } else {
      setSelectedIndices(images.map((_, i) => i));
    }
  };

  const handleImageSelect = (index) => {
    if (selectedIndices.includes(index)) {
      setSelectedIndices(selectedIndices.filter((i) => i !== index));
    } else {
      setSelectedIndices([...selectedIndices, index]);
    }
  };

  return (
    <div className={styles.studioLayout}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <img src={logo} alt="Logo" className={styles.logo} />
          <h1 className={styles.title}>Pic Studio</h1>
        </div>
        <div className={styles.headerCenter}>
          <Button
            type="primary"
            icon={<Upload size={16} />}
            onClick={navigateToHome}
          >
            Import
          </Button>
        </div>
        <div className={styles.headerActions}>
          <Button
            icon={<RotateCcw size={16} />}
            onClick={() => {
              revertAll();
              setEditedTools([]);
            }}
            disabled={isDownloading}
          >
            Revert All Changes
          </Button>
          <Button
            type="primary"
            icon={<Download size={16} />}
            onClick={exportAll}
            disabled={isDownloading}
          >
            Export All
          </Button>
        </div>
      </header>
      <div className={styles.mainContent}>
        <div className={styles.leftPanel}>
          <Sidebar
            activeTool={activeTool}
            onToolChange={handleToolChange}
            editedTools={editedTools}
          />
          {isConfigPanelOpen && (
            <ConfigPanel
              activeTool={activeTool}
              selectedIndices={selectedIndices}
            />
          )}
        </div>
        <div className={styles.previewPanel}>
          <PreviewPanel
            imageData={imageData}
            compressedImageSrc={compressedImageSrc}
            formatFileSize={formatFileSize}
            activeTool={activeTool}
            compressionQuality={compressionQuality}
            compressedSize={compressedSize}
            compressionRatio={compressionRatio}
            faviconSizes={faviconSizes}
            cropArea={cropArea}
            setCropArea={setCropArea}
            showGrid={showGrid}
            applyAllChanges={applyAllChanges}
          />
        </div>
        <div className={styles.rightPanel}>
          <ImagesList
            images={images}
            activeImageIndex={activeImageIndex}
            onImageChange={handleImageChange}
            onSelectAll={handleSelectAll}
            selectedIndices={selectedIndices}
            onImageSelect={handleImageSelect}
          />
        </div>
      </div>
    </div>
  );
}
