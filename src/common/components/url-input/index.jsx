import { Button, Input, Typography } from "antd";
import { ImageIcon } from "lucide-react";

import styles from "./style.module.css";

const { Text } = Typography;

const EXAMPLE_URLS = [
  "https://picsum.photos/800/600",
  "https://picsum.photos/1920/1080",
  "https://picsum.photos/400/400",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
];

export default function UrlInputTab({
  imageUrl,
  setImageUrl,
  handleUrlSubmit,
  isLoading,
}) {
  return (
    <div className={styles.container}>
      <div className={styles.formSection}>
        <Text strong style={{ fontSize: '16px', fontWeight: 500 }}>
          Image URL
        </Text>
        <div className={styles.inputGroup}>
          <Input
            id="image-url"
            type="url"
            placeholder="https://example.com/image.jpg"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleUrlSubmit()}
            style={{ height: '48px', fontSize: '16px' }}
            size="large"
          />
          <Button
            type="primary"
            onClick={handleUrlSubmit}
            disabled={!imageUrl.trim() || isLoading}
            style={{ height: '48px', paddingLeft: '24px', paddingRight: '24px', backgroundColor: '#2563eb' }}
            size="large"
            icon={<ImageIcon style={{ width: '16px', height: '16px' }} />}
          >
            Load
          </Button>
        </div>
      </div>
      <div className={styles.examplesSection}>
        <Text style={{ fontSize: '14px', fontWeight: 500, color: '#475569' }}>
          Try these example URLs:
        </Text>
        <div className={styles.examplesGrid}>
          {EXAMPLE_URLS.map((exampleUrl, index) => (
            <button
              key={index}
              onClick={() => setImageUrl(exampleUrl)}
              className={styles.exampleUrl}
            >
              {exampleUrl}
            </button>
          ))}
        </div>
      </div>
      <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
        <Text style={{ fontSize: '13px', color: '#64748b' }}>
          <strong>Note:</strong> Some images may have CORS restrictions. If loading fails, try:
          <br />• Right-click the image → &quot;Save image as&quot; → Upload via the Upload tab
          <br />• Use a different image URL that allows cross-origin access
        </Text>
      </div>
    </div>
  );
}
