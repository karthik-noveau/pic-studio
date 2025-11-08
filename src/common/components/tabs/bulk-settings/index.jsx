import React from "react";

import { Button } from "antd";

import useStore from "@common/store/use-store";

import styles from "./style.module.css";

const BulkSettingsTab = ({ activeTool, selectedIndices }) => {
  const store = useStore();
  const { applyBulkSettings } = store;

  const handleApplyBulk = () => {
    applyBulkSettings(selectedIndices);
  };

  return (
    <div className={styles.container}>
      <p>
        Apply the current settings for <strong>{activeTool}</strong> to all
        selected images.
      </p>
      <Button type="primary" onClick={handleApplyBulk}>
        Apply to All
      </Button>
    </div>
  );
};

export default BulkSettingsTab;
