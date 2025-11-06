import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook to generate a processed image with all cumulative transformations
 * This ensures each tab shows the latest edited state
 */
export function useProcessedImage(imageData, canvasRef, settings, masterSettings) {
  const [processedImageUrl, setProcessedImageUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const generateProcessedImage = useCallback(() => {
    if (!imageData || !canvasRef?.current) {
      setProcessedImageUrl(null);
      return;
    }

    setIsProcessing(true);

    try {
      const canvas = canvasRef.current;
      let workingCanvas = document.createElement('canvas');
      let workingCtx = workingCanvas.getContext('2d');

      if (!workingCtx) {
        setProcessedImageUrl(null);
        setIsProcessing(false);
        return;
      }

      // Start with original image
      workingCanvas.width = canvas.width;
      workingCanvas.height = canvas.height;
      workingCtx.drawImage(canvas, 0, 0);

      // Apply crop if enabled
      if (masterSettings?.applyCrop && settings?.cropArea) {
        const croppedCanvas = document.createElement('canvas');
        const croppedCtx = croppedCanvas.getContext('2d');
        if (!croppedCtx) {
          setProcessedImageUrl(null);
          setIsProcessing(false);
          return;
        }

        const { x, y, width, height } = settings.cropArea;
        croppedCanvas.width = width;
        croppedCanvas.height = height;
        croppedCtx.imageSmoothingEnabled = true;
        croppedCtx.imageSmoothingQuality = 'high';

        croppedCtx.drawImage(
          workingCanvas,
          x,
          y,
          width,
          height,
          0,
          0,
          width,
          height
        );

        workingCanvas = croppedCanvas;
        workingCtx = croppedCtx;
      }

      // Apply rotation if enabled
      if (masterSettings?.applyRotation && settings?.rotation !== 0) {
        const rotatedCanvas = document.createElement('canvas');
        const rotatedCtx = rotatedCanvas.getContext('2d');
        if (!rotatedCtx) {
          setProcessedImageUrl(null);
          setIsProcessing(false);
          return;
        }

        const angle = (settings.rotation * Math.PI) / 180;
        const cos = Math.abs(Math.cos(angle));
        const sin = Math.abs(Math.sin(angle));

        rotatedCanvas.width = workingCanvas.width * cos + workingCanvas.height * sin;
        rotatedCanvas.height = workingCanvas.width * sin + workingCanvas.height * cos;

        rotatedCtx.translate(rotatedCanvas.width / 2, rotatedCanvas.height / 2);
        rotatedCtx.rotate(angle);
        rotatedCtx.drawImage(
          workingCanvas,
          -workingCanvas.width / 2,
          -workingCanvas.height / 2
        );

        workingCanvas = rotatedCanvas;
        workingCtx = rotatedCtx;
      }

      // Apply background if enabled
      if (masterSettings?.applyBackground && settings?.backgroundColor) {
        const bgCanvas = document.createElement('canvas');
        const bgCtx = bgCanvas.getContext('2d');
        if (!bgCtx) {
          setProcessedImageUrl(null);
          setIsProcessing(false);
          return;
        }

        bgCanvas.width = workingCanvas.width;
        bgCanvas.height = workingCanvas.height;

        if (!settings.removeBackground) {
          bgCtx.fillStyle = settings.backgroundColor;
          bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
        }

        bgCtx.drawImage(workingCanvas, 0, 0);
        workingCanvas = bgCanvas;
        workingCtx = bgCtx;
      }

      // Apply border radius if enabled
      if (masterSettings?.applyBorderRadius && settings?.cornerRadius) {
        const radiusCanvas = document.createElement('canvas');
        const radiusCtx = radiusCanvas.getContext('2d');
        if (!radiusCtx) {
          setProcessedImageUrl(null);
          setIsProcessing(false);
          return;
        }

        radiusCanvas.width = workingCanvas.width;
        radiusCanvas.height = workingCanvas.height;

        const { topLeft, topRight, bottomLeft, bottomRight } = settings.cornerRadius;
        const maxRadius = Math.min(workingCanvas.width, workingCanvas.height) * 0.5;

        const tl = (topLeft / 100) * maxRadius;
        const tr = (topRight / 100) * maxRadius;
        const bl = (bottomLeft / 100) * maxRadius;
        const br = (bottomRight / 100) * maxRadius;

        radiusCtx.beginPath();
        radiusCtx.moveTo(tl, 0);
        radiusCtx.lineTo(workingCanvas.width - tr, 0);
        radiusCtx.quadraticCurveTo(workingCanvas.width, 0, workingCanvas.width, tr);
        radiusCtx.lineTo(workingCanvas.width, workingCanvas.height - br);
        radiusCtx.quadraticCurveTo(
          workingCanvas.width,
          workingCanvas.height,
          workingCanvas.width - br,
          workingCanvas.height
        );
        radiusCtx.lineTo(bl, workingCanvas.height);
        radiusCtx.quadraticCurveTo(0, workingCanvas.height, 0, workingCanvas.height - bl);
        radiusCtx.lineTo(0, tl);
        radiusCtx.quadraticCurveTo(0, 0, tl, 0);
        radiusCtx.closePath();
        radiusCtx.clip();

        radiusCtx.drawImage(workingCanvas, 0, 0);
        workingCanvas = radiusCanvas;
        workingCtx = radiusCtx;
      }

      // Convert to data URL
      const dataUrl = workingCanvas.toDataURL('image/png');
      setProcessedImageUrl(dataUrl);
      setIsProcessing(false);
    } catch (error) {
      console.error('Error processing image:', error);
      setProcessedImageUrl(null);
      setIsProcessing(false);
    }
  }, [imageData, canvasRef, settings, masterSettings]);

  // Regenerate whenever settings change
  useEffect(() => {
    generateProcessedImage();
  }, [generateProcessedImage]);

  return {
    processedImageUrl,
    isProcessing,
    regenerate: generateProcessedImage,
  };
}
