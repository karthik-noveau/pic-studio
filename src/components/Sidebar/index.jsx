import {
  Home,
  Eye,
  Crop,
  RotateCw,
  CornerUpRight,
  Paintbrush,
  Minimize,
  RefreshCw,
  Star,
} from "lucide-react";
import styles from "./style.module.css";

const menuItems = [
  { key: "import", label: "Import", icon: Home, description: "Back to Home" },
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

export default function Sidebar({ activeTool, onToolChange, onNavigateToHome }) {
  const handleItemClick = (key) => {
    if (key === "import") {
      onNavigateToHome();
    } else {
      onToolChange(key);
    }
  };

  return (
    <div className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h2 className={styles.sidebarTitle}>Tools</h2>
        <p className={styles.sidebarSubtitle}>Select a tool to begin editing</p>
      </div>

      <nav className={styles.navMenu}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.key === activeTool;
          const isImport = item.key === "import";

          return (
            <button
              key={item.key}
              className={`${styles.navItem} ${
                isActive ? styles.navItemActive : ""
              } ${isImport ? styles.navItemImport : ""}`}
              onClick={() => handleItemClick(item.key)}
            >
              <div className={styles.navItemContent}>
                <Icon className={styles.navIcon} />
                <div className={styles.navText}>
                  <span className={styles.navLabel}>{item.label}</span>
                  <span className={styles.navDescription}>{item.description}</span>
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
