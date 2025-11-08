import { useCallback, useEffect, useRef, useState } from "react";

import { Move } from "lucide-react";

import styles from "./style.module.css";

export default function DraggableCrop({
  imageData,
  cropArea,
  setCropArea,
  showGrid,
  containerRef,
}) {
  const [isDragging, setIsDragging] = useState(false);
  const [localCropArea, setLocalCropArea] = useState(cropArea);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const dragTypeRef = useRef(null);
  const initialAspectRatioRef = useRef(null);
  const [containerReady, setContainerReady] = useState(false);

  // Synchronize localCropArea with cropArea prop when cropArea changes
  useEffect(() => {
    console.log("DraggableCrop: cropArea prop changed or mounted:", cropArea);
    setLocalCropArea(cropArea);
  }, [cropArea]);

  // Check if containerRef is ready
  useEffect(() => {
    if (containerRef.current) {
      setContainerReady(true);
    } else {
      setContainerReady(false);
    }
  }, [containerRef]);

  const handleMouseDown = (e, type) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
    dragTypeRef.current = type;

    if (!containerRef.current) return;
    const container = containerRef.current;
    const containerRect = container.getBoundingClientRect();
    const imageAspectRatio = imageData.width / imageData.height;
    const containerAspectRatio = containerRect.width / containerRect.height;

    let renderedImageWidth;
    let renderedImageHeight;

    if (imageAspectRatio > containerAspectRatio) {
      renderedImageWidth = containerRect.width;
      renderedImageHeight = containerRect.width / imageAspectRatio;
    } else {
      renderedImageHeight = containerRect.height;
      renderedImageWidth = containerRect.height * imageAspectRatio;
    }

    const scaleX = renderedImageWidth / imageData.width;
    const scaleY = renderedImageHeight / imageData.height;

    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialCropX: localCropArea.x,
      initialCropY: localCropArea.y,
      initialCropWidth: localCropArea.width,
      initialCropHeight: localCropArea.height,
      scaleX,
      scaleY,
    };

    if (type.startsWith("resize")) {
      initialAspectRatioRef.current =
        localCropArea.width / localCropArea.height;
    }
  };

  const handleMouseMove = useCallback(
    (e) => {
      if (!dragTypeRef.current || !dragStartRef.current) return;

      const {
        x: startX,
        y: startY,
        initialCropX,
        initialCropY,
        initialCropWidth,
        initialCropHeight,
        scaleX,
        scaleY,
      } = dragStartRef.current;

      const deltaX = (e.clientX - startX) / scaleX;
      const deltaY = (e.clientY - startY) / scaleY;

      setLocalCropArea((currentCrop) => {
        const newCropArea = { ...currentCrop };
        const isShiftPressed = e.shiftKey;
        const useProportional = isShiftPressed && initialAspectRatioRef.current;

        switch (dragTypeRef.current) {
          case "move":
            newCropArea.x = Math.max(
              0,
              Math.min(
                imageData.width - initialCropWidth,
                initialCropX + deltaX
              )
            );
            newCropArea.y = Math.max(
              0,
              Math.min(
                imageData.height - initialCropHeight,
                initialCropY + deltaY
              )
            );
            break;
          case "resize-se":
            if (useProportional) {
              const newWidth = Math.max(
                50,
                Math.min(
                  imageData.width - initialCropX,
                  initialCropWidth + deltaX
                )
              );
              const newHeight = newWidth / initialAspectRatioRef.current;
              if (
                newHeight >= 50 &&
                initialCropY + newHeight <= imageData.height
              ) {
                newCropArea.width = newWidth;
                newCropArea.height = newHeight;
              }
            } else {
              newCropArea.width = Math.max(
                50,
                Math.min(
                  imageData.width - initialCropX,
                  initialCropWidth + deltaX
                )
              );
              newCropArea.height = Math.max(
                50,
                Math.min(
                  imageData.height - initialCropY,
                  initialCropHeight + deltaY
                )
              );
            }
            break;
          case "resize-sw": {
            const newXSW = Math.max(
              0,
              Math.min(
                initialCropX + deltaX,
                initialCropX + initialCropWidth - 50
              )
            );
            newCropArea.x = newXSW;
            newCropArea.width = initialCropX + initialCropWidth - newXSW;
            newCropArea.height = Math.max(
              50,
              Math.min(
                imageData.height - initialCropY,
                initialCropHeight + deltaY
              )
            );
            break;
          }
          case "resize-ne": {
            newCropArea.width = Math.max(
              50,
              Math.min(
                imageData.width - initialCropX,
                initialCropWidth + deltaX
              )
            );

            const newYNE = Math.max(
              0,
              Math.min(
                initialCropY + deltaY,
                initialCropY + initialCropHeight - 50
              )
            );
            newCropArea.y = newYNE;
            newCropArea.height = initialCropY + initialCropHeight - newYNE;
            break;
          }
          case "resize-nw": {
            const newXNW = Math.max(
              0,
              Math.min(
                initialCropX + deltaX,
                initialCropX + initialCropWidth - 50
              )
            );

            const newYNW = Math.max(
              0,
              Math.min(
                initialCropY + deltaY,
                initialCropY + initialCropHeight - 50
              )
            );
            newCropArea.x = newXNW;
            newCropArea.y = newYNW;
            newCropArea.width = initialCropX + initialCropWidth - newXNW;
            newCropArea.height = initialCropY + initialCropHeight - newYNW;
            break;
          }
          case "resize-n": {
            const newYN = Math.max(
              0,
              Math.min(
                initialCropY + deltaY,
                initialCropY + initialCropHeight - 50
              )
            );
            newCropArea.y = newYN;
            newCropArea.height = initialCropY + initialCropHeight - newYN;
            break;
          }
          case "resize-s":
            newCropArea.height = Math.max(
              50,
              Math.min(
                imageData.height - initialCropY,
                initialCropHeight + deltaY
              )
            );
            break;
          case "resize-e":
            newCropArea.width = Math.max(
              50,
              Math.min(
                imageData.width - initialCropX,
                initialCropWidth + deltaX
              )
            );
            break;
          case "resize-w": {
            const newXW = Math.max(
              0,
              Math.min(
                initialCropX + deltaX,
                initialCropX + initialCropWidth - 50
              )
            );
            newCropArea.x = newXW;
            newCropArea.width = initialCropX + initialCropWidth - newXW;
            break;
          }
        }
        return newCropArea;
      });
    },
    [imageData]
  );

  const handleMouseUp = useCallback(() => {
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

  if (!containerReady) return null;

  const container = containerRef.current;
  const containerRect = container.getBoundingClientRect();

  // Calculate rendered image dimensions considering object-fit: contain
  const imageAspectRatio = imageData.width / imageData.height;
  const containerAspectRatio = containerRect.width / containerRect.height;

  let renderedImageWidth;
  let renderedImageHeight;

  if (imageAspectRatio > containerAspectRatio) {
    renderedImageWidth = containerRect.width;
    renderedImageHeight = containerRect.width / imageAspectRatio;
  } else {
    renderedImageHeight = containerRect.height;
    renderedImageWidth = containerRect.height * imageAspectRatio;
  }

  const scaleX = renderedImageWidth / imageData.width;
  const scaleY = renderedImageHeight / imageData.height;

  const offsetX = (containerRect.width - renderedImageWidth) / 2;
  const offsetY = (containerRect.height - renderedImageHeight) / 2;

  const cropStyle = {
    position: "absolute",
    left: localCropArea.x * scaleX + offsetX,
    top: localCropArea.y * scaleY + offsetY,
    width: localCropArea.width * scaleX,
    height: localCropArea.height * scaleY,
    border: "2px solid #3b82f6",
    cursor: "move",
    zIndex: 2,
  };

  console.log("DraggableCrop Render:", {
    localCropArea,
    scaleX,
    scaleY,
    offsetX,
    offsetY,
    cropStyle,
    containerReady,
    imageData,
  });

  return (
    <div style={cropStyle} onMouseDown={(e) => handleMouseDown(e, "move")}>
      {showGrid && (
        <div className={styles.gridContainer}>
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className={styles.gridCell} />
          ))}
        </div>
      )}
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
      <div className={styles.moveIndicator}>
        <Move className={styles.moveIcon} />
      </div>
    </div>
  );
}
