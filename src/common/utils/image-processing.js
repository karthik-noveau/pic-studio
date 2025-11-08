// src/common/utils/image-processing.js

/**
 * Applies a series of image transformations to a given image data.
 * Each transformation is applied sequentially to the result of the previous one.
 *
 * @param {HTMLImageElement | HTMLCanvasElement} initialImage The starting image (original or already processed).
 * @param {object} settings Current settings for transformations (cropArea, rotation, cornerRadius, etc.).
 * @param {object} masterSettings Global settings to enable/disable specific transformations.
 * @returns {Promise<HTMLCanvasElement>} A promise that resolves with the processed canvas.
 */
export function applyImageTransformations(initialImage, settings, masterSettings) {
  return new Promise((resolve, reject) => {
    let workingCanvas = document.createElement('canvas');
    let workingCtx = workingCanvas.getContext('2d');

    if (!workingCtx) {
      reject(new Error('Could not get 2D context for canvas.'));
      return;
    }

    // Draw the initial image onto the working canvas
    workingCanvas.width = initialImage.naturalWidth || initialImage.width;
    workingCanvas.height = initialImage.naturalHeight || initialImage.height;
    workingCtx.drawImage(initialImage, 0, 0);

    // Helper to update workingCanvas and workingCtx
    const updateWorkingCanvas = (newCanvas) => {
      workingCanvas = newCanvas;
      workingCtx = newCanvas.getContext('2d');
      if (!workingCtx) {
        throw new Error('Could not get 2D context for new canvas.');
      }
    };

    try {
      // Apply crop if enabled
      if (masterSettings?.applyCrop && settings?.cropArea) {
        const croppedCanvas = document.createElement('canvas');
        const croppedCtx = croppedCanvas.getContext('2d');
        if (!croppedCtx) throw new Error('Could not get 2D context for cropped canvas.');

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
        updateWorkingCanvas(croppedCanvas);
      }

      // Apply rotation if enabled
      if (masterSettings?.applyRotation && settings?.rotation !== 0) {
        const rotatedCanvas = document.createElement('canvas');
        const rotatedCtx = rotatedCanvas.getContext('2d');
        if (!rotatedCtx) throw new Error('Could not get 2D context for rotated canvas.');

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
        updateWorkingCanvas(rotatedCanvas);
      }

      // Apply resize if enabled (assuming resizeDimensions are part of settings)
      if (masterSettings?.applyResize && settings?.resizeDimensions) {
        const { width, height } = settings.resizeDimensions;
        if (width && height) {
          const resizedCanvas = document.createElement("canvas");
          const resizedCtx = resizedCanvas.getContext("2d");
          if (!resizedCtx) throw new Error('Could not get 2D context for resized canvas.');

          resizedCanvas.width = width;
          resizedCanvas.height = height;
          resizedCtx.imageSmoothingEnabled = true;
          resizedCtx.imageSmoothingQuality = "high";

          resizedCtx.drawImage(
            workingCanvas,
            0,
            0,
            width,
            height
          );
          updateWorkingCanvas(resizedCanvas);
        }
      }

      // Apply background if enabled
      if (masterSettings?.applyBackground && settings?.backgroundColor) {
        const bgCanvas = document.createElement('canvas');
        const bgCtx = bgCanvas.getContext('2d');
        if (!bgCtx) throw new Error('Could not get 2D context for background canvas.');

        bgCanvas.width = workingCanvas.width;
        bgCanvas.height = workingCanvas.height;

        if (!settings.removeBackground) {
          bgCtx.fillStyle = settings.backgroundColor;
          bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
        }

        bgCtx.drawImage(workingCanvas, 0, 0);
        updateWorkingCanvas(bgCanvas);
      }

      // Apply border radius if enabled
      if (masterSettings?.applyBorderRadius && settings?.cornerRadius) {
        const radiusCanvas = document.createElement('canvas');
        const radiusCtx = radiusCanvas.getContext('2d');
        if (!radiusCtx) throw new Error('Could not get 2D context for border radius canvas.');

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
        updateWorkingCanvas(radiusCanvas);
      }

      resolve(workingCanvas);
    } catch (error) {
      reject(error);
    }
  });
}
