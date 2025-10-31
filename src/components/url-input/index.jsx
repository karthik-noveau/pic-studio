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
    </div>
  );
}
