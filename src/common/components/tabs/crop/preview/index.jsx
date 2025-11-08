import { useRef } from "react";

import DraggableCrop from "./DraggableCrop";

import styles from "./style.module.css";

export default function CropPreview({
  imageData,
  cropArea,
  setCropArea,
  showGrid,
  applyAllChanges,
  processedImageUrl, // Add processedImageUrl to props
}) {
  const cropContainerRef = useRef(null);
  return (
    <div ref={cropContainerRef} className={styles.cropContainer}>
      <img
        src={processedImageUrl || imageData.src} // Use processedImageUrl, fallback to original
        alt="Crop preview"
        className={styles.cropImage}
      />
      <DraggableCrop
        key={JSON.stringify(cropArea)} // Add key to force re-render
        imageData={imageData}
        cropArea={cropArea}
        setCropArea={setCropArea}
        showGrid={showGrid}
        containerRef={cropContainerRef}
        applyAllChanges={applyAllChanges}
      />
    </div>
  );
}
