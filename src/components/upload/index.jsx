import { useState } from "react";
import { Button, Typography } from "antd";
import { Upload as LucideUpload } from "lucide-react";
import styles from "./style.module.css";

const { Text } = Typography;

export default function UploadTab({ handleFileUpload, fileInputRef }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set isDragging to false if we're leaving the drop zone container
    if (e.currentTarget === e.target) {
      setIsDragging(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      // Create a synthetic event that matches the file input event structure
      const syntheticEvent = {
        target: { files: files }
      };
      handleFileUpload(syntheticEvent);
    }
  };

  return (
    <div
      className={styles.container}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        className={styles.formSection}
        style={{
          border: isDragging ? '2px dashed #1890ff' : '2px dashed transparent',
          backgroundColor: isDragging ? '#e6f7ff' : 'transparent',
          borderRadius: '8px',
          padding: '20px',
          transition: 'all 0.3s ease'
        }}
      >
        <Text strong style={{ fontSize: '16px' }}>
          {isDragging ? 'Drop images here' : 'Select Image File'}
        </Text>
        <div className={styles.uploadControls}>
          <Button
            type="primary"
            icon={<LucideUpload size={16} />}
            onClick={() => fileInputRef.current?.click()}
            size="large"
            style={{ height: '48px' }}
          >
            Browse Files
          </Button>
        </div>
        <Text type="secondary" style={{ fontSize: '14px' }}>
          {isDragging
            ? 'Release to upload multiple images'
            : 'Supports JPEG, PNG, GIF, WebP, SVG, BMP, AVIF, and TIFF formats. You can select multiple images at once or drag and drop them here.'}
        </Text>
      </div>
    </div>
  );
}
