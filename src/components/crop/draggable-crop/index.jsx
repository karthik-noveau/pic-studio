import { useState, useCallback, useEffect } from "react";
import { Move } from "lucide-react";
import { debounce } from "../../../utils/helpers";
import styles from "./style.module.css";

/**
 * Enhanced Draggable Crop Component
 * Provides interactive crop area with draggable handles and grid overlay
 */
export default function DraggableCrop({
  imageData,
  cropArea,
  setCropArea,
  showGrid,
  containerRef,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [dragType, setDragType] = useState(null);

  const handleMouseDown = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    setDragType(type);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = useCallback(
    debounce((e) => {
      if (!isDragging || !dragType || !containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const scaleX = imageData.width / rect.width;
      const scaleY = imageData.height / rect.height;

      const deltaX = (e.clientX - dragStart.x) * scaleX;
      const deltaY = (e.clientY - dragStart.y) * scaleY;

      const newCropArea = { ...cropArea };

      switch (dragType) {
        case "move":
          newCropArea.x = Math.max(
            0,
            Math.min(imageData.width - cropArea.width, cropArea.x + deltaX)
          );
          newCropArea.y = Math.max(
            0,
            Math.min(imageData.height - cropArea.height, cropArea.y + deltaY)
          );
          break;
        case "resize-se":
          newCropArea.width = Math.max(
            50,
            Math.min(imageData.width - cropArea.x, cropArea.width + deltaX)
          );
          newCropArea.height = Math.max(
            50,
            Math.min(imageData.height - cropArea.y, cropArea.height + deltaY)
          );
          break;
        case "resize-sw":
          const newWidthSW = Math.max(50, cropArea.width - deltaX);
          const newXSW = Math.max(
            0,
            Math.min(cropArea.x + deltaX, cropArea.x + cropArea.width - 50)
          );
          newCropArea.x = newXSW;
          newCropArea.width = cropArea.x + cropArea.width - newXSW;
          newCropArea.height = Math.max(
            50,
            Math.min(imageData.height - cropArea.y, cropArea.height + deltaY)
          );
          break;
        case "resize-ne":
          newCropArea.width = Math.max(
            50,
            Math.min(imageData.width - cropArea.x, cropArea.width + deltaX)
          );
          const newHeightNE = Math.max(50, cropArea.height - deltaY);
          const newYNE = Math.max(
            0,
            Math.min(cropArea.y + deltaY, cropArea.y + cropArea.height - 50)
          );
          newCropArea.y = newYNE;
          newCropArea.height = cropArea.y + cropArea.height - newYNE;
          break;
        case "resize-nw":
          const newWidthNW = Math.max(50, cropArea.width - deltaX);
          const newXNW = Math.max(
            0,
            Math.min(cropArea.x + deltaX, cropArea.x + cropArea.width - 50)
          );
          const newHeightNW = Math.max(50, cropArea.height - deltaY);
          const newYNW = Math.max(
            0,
            Math.min(cropArea.y + deltaY, cropArea.y + cropArea.height - 50)
          );
          newCropArea.x = newXNW;
          newCropArea.y = newYNW;
          newCropArea.width = cropArea.x + cropArea.width - newXNW;
          newCropArea.height = cropArea.y + cropArea.height - newYNW;
          break;
        case "resize-n":
          const newHeightN = Math.max(50, cropArea.height - deltaY);
          const newYN = Math.max(
            0,
            Math.min(cropArea.y + deltaY, cropArea.y + cropArea.height - 50)
          );
          newCropArea.y = newYN;
          newCropArea.height = cropArea.y + cropArea.height - newYN;
          break;
        case "resize-s":
          newCropArea.height = Math.max(
            50,
            Math.min(imageData.height - cropArea.y, cropArea.height + deltaY)
          );
          break;
        case "resize-e":
          newCropArea.width = Math.max(
            50,
            Math.min(imageData.width - cropArea.x, cropArea.width + deltaX)
          );
          break;
        case "resize-w":
          const newWidthW = Math.max(50, cropArea.width - deltaX);
          const newXW = Math.max(
            0,
            Math.min(cropArea.x + deltaX, cropArea.x + cropArea.width - 50)
          );
          newCropArea.x = newXW;
          newCropArea.width = cropArea.x + cropArea.width - newXW;
          break;
      }

      setCropArea(newCropArea);
      setDragStart({ x: e.clientX, y: e.clientY });
    }, 16), // 60fps
    [
      isDragging,
      dragType,
      dragStart,
      cropArea,
      setCropArea,
      imageData,
      containerRef,
    ]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setDragType(null);
  }, []);

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging, handleMouseMove, handleMouseUp]);

  if (!containerRef.current) return null;

  const container = containerRef.current;
  const rect = container.getBoundingClientRect();
  const scaleX = rect.width / imageData.width;
  const scaleY = rect.height / imageData.height;

  const cropStyle = {
    position: "absolute",
    left: cropArea.x * scaleX,
    top: cropArea.y * scaleY,
    width: cropArea.width * scaleX,
    height: cropArea.height * scaleY,
    border: "2px solid #3b82f6",
    backgroundColor: "rgba(59, 130, 246, 0.1)",
    cursor: "move",
  };

  return (
    <div style={cropStyle} onMouseDown={(e) => handleMouseDown(e, "move")}>
      {showGrid && (
        <div className={styles.gridContainer}>
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className={styles.gridCell} />
          ))}
        </div>
      )}

      {/* Corner handles */}
      <div
        className={styles.handleCorner + " " + styles.handleNw}
        onMouseDown={(e) => handleMouseDown(e, "resize-nw")}
      />
      <div
        className={styles.handleCorner + " " + styles.handleNe}
        onMouseDown={(e) => handleMouseDown(e, "resize-ne")}
      />
      <div
        className={styles.handleCorner + " " + styles.handleSw}
        onMouseDown={(e) => handleMouseDown(e, "resize-sw")}
      />
      <div
        className={styles.handleCorner + " " + styles.handleSe}
        onMouseDown={(e) => handleMouseDown(e, "resize-se")}
      />

      {/* Edge handles */}
      <div
        className={styles.handleEdge + " " + styles.handleN}
        onMouseDown={(e) => handleMouseDown(e, "resize-n")}
      />
      <div
        className={styles.handleEdge + " " + styles.handleS}
        onMouseDown={(e) => handleMouseDown(e, "resize-s")}
      />
      <div
        className={styles.handleEdge + " " + styles.handleW}
        onMouseDown={(e) => handleMouseDown(e, "resize-w")}
      />
      <div
        className={styles.handleEdge + " " + styles.handleE}
        onMouseDown={(e) => handleMouseDown(e, "resize-e")}
      />

      {/* Move indicator */}
      <div className={styles.moveIndicator}>
        <Move className={styles.moveIcon} />
      </div>
    </div>
  );
}
