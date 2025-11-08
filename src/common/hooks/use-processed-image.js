import { useCallback,useEffect, useState } from 'react';

import { applyImageTransformations } from '@common/utils/image-processing';

const channel = new BroadcastChannel('pic_studio_sync');

/**
 * Custom hook to generate a processed image with all cumulative transformations
 * This ensures each tab shows the latest edited state
 */
export function useProcessedImage(imageData, canvasRef, settings, masterSettings, setMasterSettings) {
  const [processedImageUrl, setProcessedImageUrl] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'master_settings_update') {
        setMasterSettings(event.data.payload);
      }
    };

    channel.addEventListener('message', handleMessage);

    return () => {
      channel.removeEventListener('message', handleMessage);
    };
  }, [setMasterSettings]);

  useEffect(() => {
    if (masterSettings) {
      channel.postMessage({
        type: 'master_settings_update',
        payload: masterSettings,
      });
    }
  }, [masterSettings]);

  const generateProcessedImage = useCallback(async () => {
    if (!imageData || !canvasRef?.current) {
      setProcessedImageUrl(null);
      return;
    }

    setIsProcessing(true);

    try {
      const processedCanvas = await applyImageTransformations(
        canvasRef.current, // Pass the original image on canvas
        settings,
        masterSettings
      );
      const dataUrl = processedCanvas.toDataURL('image/png');
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

