import { useState, useCallback, useEffect, useRef } from "react";
import { Move } from "lucide-react";
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
  const [localCropArea, setLocalCropArea] = useState(cropArea);
  const [, forceUpdate] = useState({});
  const dragStartRef = useRef({ x: 0, y: 0 });
  const dragTypeRef = useRef(null);
  const initialAspectRatioRef = useRef(null);
  const isInitializedRef = useRef(false);

  // Force re-render when container becomes available
  useEffect(() => {
    if (containerRef.current) {
      forceUpdate({});
    }
  }, [imageData]); // Re-run when imageData changes (new image loaded)

  // Sync local crop area with prop when cropArea changes (unless we're dragging)
  useEffect(() => {
    // Always update on first mount or when not dragging
    if (!isDragging || !isInitializedRef.current) {
      setLocalCropArea(cropArea);
      isInitializedRef.current = true;
    }
  }, [cropArea, isDragging]);

  const handleMouseDown = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    dragTypeRef.current = type;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    // Store initial aspect ratio for proportional scaling
    if (type.startsWith("resize") && type.includes("-")) {
      initialAspectRatioRef.current = localCropArea.width / localCropArea.height;
    }
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (!dragTypeRef.current || !containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const scaleX = imageData.width / rect.width;
      const scaleY = imageData.height / rect.height;

      const deltaX = (e.clientX - dragStartRef.current.x) * scaleX;
      const deltaY = (e.clientY - dragStartRef.current.y) * scaleY;

      setLocalCropArea((currentCrop) => {
        const newCropArea = { ...currentCrop };
        const isShiftPressed = e.shiftKey; // Hold Shift for proportional scaling
        const useProportional = isShiftPressed && initialAspectRatioRef.current;

      switch (dragTypeRef.current) {
        case "move":
          newCropArea.x = Math.max(
            0,
            Math.min(imageData.width - currentCrop.width, currentCrop.x + deltaX)
          );
          newCropArea.y = Math.max(
            0,
            Math.min(imageData.height - currentCrop.height, currentCrop.y + deltaY)
          );
          break;
        case "resize-se":
          if (useProportional) {
            // Proportional scaling - maintain aspect ratio
            const newWidth = Math.max(
              50,
              Math.min(imageData.width - currentCrop.x, currentCrop.width + deltaX)
            );
            const newHeight = newWidth / initialAspectRatioRef.current;
            if (newHeight >= 50 && currentCrop.y + newHeight <= imageData.height) {
              newCropArea.width = newWidth;
              newCropArea.height = newHeight;
            }
          } else {
            newCropArea.width = Math.max(
              50,
              Math.min(imageData.width - currentCrop.x, currentCrop.width + deltaX)
            );
            newCropArea.height = Math.max(
              50,
              Math.min(imageData.height - currentCrop.y, currentCrop.height + deltaY)
            );
          }
          break;
        case "resize-sw":
          const newWidthSW = Math.max(50, currentCrop.width - deltaX);
          const newXSW = Math.max(
            0,
            Math.min(currentCrop.x + deltaX, currentCrop.x + currentCrop.width - 50)
          );
          newCropArea.x = newXSW;
          newCropArea.width = currentCrop.x + currentCrop.width - newXSW;
          newCropArea.height = Math.max(
            50,
            Math.min(imageData.height - currentCrop.y, currentCrop.height + deltaY)
          );
          break;
        case "resize-ne":
          newCropArea.width = Math.max(
            50,
            Math.min(imageData.width - currentCrop.x, currentCrop.width + deltaX)
          );
          const newHeightNE = Math.max(50, currentCrop.height - deltaY);
          const newYNE = Math.max(
            0,
            Math.min(currentCrop.y + deltaY, currentCrop.y + currentCrop.height - 50)
          );
          newCropArea.y = newYNE;
          newCropArea.height = currentCrop.y + currentCrop.height - newYNE;
          break;
        case "resize-nw":
          const newWidthNW = Math.max(50, currentCrop.width - deltaX);
          const newXNW = Math.max(
            0,
            Math.min(currentCrop.x + deltaX, currentCrop.x + currentCrop.width - 50)
          );
          const newHeightNW = Math.max(50, currentCrop.height - deltaY);
          const newYNW = Math.max(
            0,
            Math.min(currentCrop.y + deltaY, currentCrop.y + currentCrop.height - 50)
          );
          newCropArea.x = newXNW;
          newCropArea.y = newYNW;
          newCropArea.width = currentCrop.x + currentCrop.width - newXNW;
          newCropArea.height = currentCrop.y + currentCrop.height - newYNW;
          break;
        case "resize-n":
          const newHeightN = Math.max(50, currentCrop.height - deltaY);
          const newYN = Math.max(
            0,
            Math.min(currentCrop.y + deltaY, currentCrop.y + currentCrop.height - 50)
          );
          newCropArea.y = newYN;
          newCropArea.height = currentCrop.y + currentCrop.height - newYN;
          break;
        case "resize-s":
          newCropArea.height = Math.max(
            50,
            Math.min(imageData.height - currentCrop.y, currentCrop.height + deltaY)
          );
          break;
        case "resize-e":
          newCropArea.width = Math.max(
            50,
            Math.min(imageData.width - currentCrop.x, currentCrop.width + deltaX)
          );
          break;
        case "resize-w":
          const newWidthW = Math.max(50, currentCrop.width - deltaX);
          const newXW = Math.max(
            0,
            Math.min(currentCrop.x + deltaX, currentCrop.x + currentCrop.width - 50)
          );
          newCropArea.x = newXW;
          newCropArea.width = currentCrop.x + currentCrop.width - newXW;
          break;
      }

        dragStartRef.current = { x: e.clientX, y: e.clientY };
        return newCropArea;
      });
    },
    [imageData, containerRef]
  );

  const handleMouseUp = useCallback(() => {
    // Save the final crop area when drag ends
    setCropArea(localCropArea);
    setIsDragging(false);
    dragTypeRef.current = null;
  }, [localCropArea, setCropArea]);

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
    left: localCropArea.x * scaleX,
    top: localCropArea.y * scaleY,
    width: localCropArea.width * scaleX,
    height: localCropArea.height * scaleY,
    border: "2px solid #3b82f6",
    boxShadow: "0 0 0 9999px rgba(0, 0, 0, 0.6)",
    cursor: "move",
    zIndex: 2,
  };

  return (
    <div style={cropStyle} onMouseDown={(e) => handleMouseDown(e, "move")}>
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
