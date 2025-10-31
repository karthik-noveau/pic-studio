import { Button, Typography } from "antd";
import { Upload as LucideUpload } from "lucide-react";
import styles from "./style.module.css";

const { Text } = Typography;

export default function UploadTab({ handleFileUpload, fileInputRef }) {
  return (
    <div className={styles.container}>
      <div className={styles.formSection}>
        <Text strong style={{ fontSize: '16px' }}>Select Image File</Text>
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
          Supports JPEG, PNG, GIF, WebP, SVG, BMP, AVIF, and TIFF formats. You can select multiple images at once.
        </Text>
      </div>
    </div>
  );
}
