import { useState } from "react";

import { Button, Input, message, Typography, Upload } from "antd";
import {
  ArrowRight,
  Link as LinkIcon,
  Upload as UploadIcon,
} from "lucide-react";

import logo from "@assets/logo.png";
import useStore from "@common/store/use-store";

import styles from "./style.module.css";

const { Dragger } = Upload;
const { Title, Paragraph } = Typography;

export default function Home() {
  const [imageUrl, setImageUrl] = useState("");
  const navigateToStudio = useStore((state) => state.navigateToStudio);
  const images = useStore((state) => state.images);
  const addImages = useStore((state) => state.addImages);
  const isLoading = useStore((state) => state.isUploading);
  const setIsLoading = useStore((state) => state.setIsUploading);

  const handleFileUpload = async (files) => {
    if (files.length === 0) return;

    const currentImages = useStore.getState().images;

    const newFiles = files.filter((file) => {
      if (!file) return false;
      return !currentImages.some(
        (image) => image.fileName === file.name && image.fileSize === file.size
      );
    });

    if (newFiles.length === 0) return;

    const invalidFiles = newFiles.filter(
      (file) => !file.type.startsWith("image/")
    );
    if (invalidFiles.length > 0) {
      message.error("Invalid file type. Please upload only image files.");
      return;
    }

    await addImages(newFiles);
  };

  const handleUrlSubmit = async () => {
    if (!imageUrl.trim()) return;

    try {
      new URL(imageUrl);
    } catch {
      message.error("Invalid URL. Please enter a valid image URL.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File(
        [blob],
        imageUrl.split("/").pop() || "image-from-url",
        { type: blob.type }
      );
      await addImages([file]);
      setImageUrl("");
    } catch (error) {
      console.error("URL loading error:", error);
      message.error("Failed to load image from URL.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaste = async (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    const imageFiles = [];
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          imageFiles.push(file);
        }
      }
    }

    if (imageFiles.length > 0) {
      e.preventDefault();
      await handleFileUpload(imageFiles);
    }
  };

  const draggerProps = {
    name: "file",
    multiple: true,
    accept: "image/*",
    showUploadList: false,
    customRequest: ({ file, onSuccess }) => {
      handleFileUpload([file]);
      onSuccess("ok");
    },
  };

  return (
    <div className={styles.homeContainer} onPaste={handlePaste}>
      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <img src={logo} alt="Pic Studio Logo" className={styles.logo} />
          <span className={styles.logoText}>Pic Studio</span>
        </div>
      </header>

      <main className={styles.mainContent}>
        <section className={styles.heroSection}>
          <Title level={1} className={styles.heroTitle}>
            The Ultimate Image Editing Studio for Modern Creators
          </Title>
          <Paragraph className={styles.heroSubtitle}>
            Elevate your images with a powerful suite of editing tools, designed
            for speed and simplicity.
          </Paragraph>
          <Dragger {...draggerProps} className={styles.dragger}>
            <p className="ant-upload-drag-icon">
              <UploadIcon size={48} strokeWidth={1.5} />
            </p>
            <p className="ant-upload-text">Drag & Drop Your Images Here</p>
            <p className="ant-upload-hint">or click to browse</p>
          </Dragger>
          <div className={styles.urlSection}>
            <Input
              size="large"
              placeholder="Paste image URL here..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleUrlSubmit();
                }
              }}
              prefix={<LinkIcon size={16} />}
            />
            <Button
              type="primary"
              size="large"
              onClick={handleUrlSubmit}
              loading={isLoading}
            >
              Load Image
            </Button>
          </div>
        </section>

        {images.length > 0 && (
          <section className={styles.uploadedSection}>
            <Title level={3}>Your Images are Ready</Title>
            <div className={styles.imageGrid}>
              {images.map((image) => (
                <div key={image.id} className={styles.imageCard}>
                  <img
                    src={image.src}
                    alt={image.fileName}
                    className={styles.imageThumbnail}
                  />
                </div>
              ))}
            </div>
            <Button
              type="primary"
              size="large"
              icon={<ArrowRight />}
              onClick={navigateToStudio}
              className={styles.studioButton}
            >
              Proceed to Studio
            </Button>
          </section>
        )}
      </main>
    </div>
  );
}
