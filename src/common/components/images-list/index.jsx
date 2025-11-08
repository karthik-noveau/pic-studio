import React from "react";

import { Checkbox } from "antd";
import { Edit } from "lucide-react";

import useStore from "@common/store/use-store";

import styles from "./style.module.css";

const ImagesList = ({
  images,
  activeImageIndex,
  onImageChange,
  onSelectAll,
  selectedIndices,
  onImageSelect,
}) => {
  const hasSettingsChanged = useStore((state) => state.hasSettingsChanged);

  return (
    <div className={styles.imagesListContainer}>
      <div className={styles.header}>
        <Checkbox
          checked={selectedIndices.length === images.length}
          indeterminate={
            selectedIndices.length > 0 &&
            selectedIndices.length < images.length
          }
          onChange={onSelectAll}
        />
        <span>{images.length} Images</span>
      </div>
      <div className={styles.thumbnailGrid}>
        {images.map((image, index) => {
          const isSelected = selectedIndices.includes(index);
          const isActive = index === activeImageIndex;
          const changes = hasSettingsChanged && hasSettingsChanged(image);
          const isEdited = changes && Object.values(changes).some((c) => c);

          return (
            <div
              key={image.id}
              className={`${styles.thumbnail} ${
                isActive ? styles.active : ""
              } ${isSelected ? styles.selected : ""}`}
              onClick={() => onImageChange(index)}
            >
              <Checkbox
                className={styles.checkbox}
                checked={isSelected}
                onClick={(e) => {
                  e.stopPropagation();
                  onImageSelect(index);
                }}
              />
              <img src={image.src} alt={`thumbnail-${index}`} />
              {isEdited && <Edit className={styles.editIcon} size={12} />}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ImagesList;
