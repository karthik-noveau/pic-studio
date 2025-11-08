import {
  CornerUpRight,
  Crop,
  Eye,
  Minimize,
  Paintbrush,
  RefreshCw,
  RotateCw,
  Star,
} from "lucide-react";

import styles from "./style.module.css";

const menuItems = [
  {
    key: "analysis",
    label: "Analysis",
    icon: Eye,
    description: "Image stats & metadata",
  },
  { key: "crop", label: "Crop", icon: Crop, description: "Aspect ratio & crop" },
  {
    key: "rotate",
    label: "Rotate",
    icon: RotateCw,
    description: "Rotate & flip",
  },
  {
    key: "border",
    label: "Border",
    icon: CornerUpRight,
    description: "Border radius",
  },
  {
    key: "background",
    label: "Background",
    icon: Paintbrush,
    description: "Fill & gradient",
  },
  {
    key: "compress",
    label: "Compress",
    icon: Minimize,
    description: "Reduce file size",
  },
  {
    key: "convert",
    label: "Convert",
    icon: RefreshCw,
    description: "Format conversion",
  },
  {
    key: "favicon",
    label: "Favicon",
    icon: Star,
    description: "Generate favicons",
  },
];

export default function Sidebar({ activeTool, onToolChange, editedTools }) {
  const handleItemClick = (key) => {
    onToolChange(key);
  };

  return (
    <div className={styles.sidebar}>
      <nav className={styles.navMenu}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.key === activeTool;
          const isEdited = editedTools.includes(item.key);

          return (
            <button
              key={item.key}
              className={`${styles.navItem} ${
                isActive ? styles.navItemActive : ""
              }`}
              onClick={() => handleItemClick(item.key)}
            >
              <div className={styles.navItemContent}>
                <div className={styles.iconContainer}>
                  <Icon className={styles.navIcon} />
                  {isEdited && <div className={styles.editedDot} />}
                </div>
                <div className={styles.navText}>
                  <span className={styles.navLabel}>{item.label}</span>
                </div>
              </div>
              {isActive && <div className={styles.activeIndicator} />}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
