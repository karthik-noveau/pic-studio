import React from 'react';

import styles from './style.module.css';

export default function TabSection({ icon: Icon, title, children, rightContent, iconColorClass }) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={`${styles.iconWrapper} ${iconColorClass}`}>
          {Icon && <Icon style={{ width: "20px", height: "20px" }} />}
        </div>
        <div className={styles.cardTitle}>{title}</div>
        {rightContent && (
          <div className={styles.cardHeaderRight}>
            {rightContent}
          </div>
        )}
      </div>
      <div className={styles.cardContent}>
        {children}
      </div>
    </div>
  );
}
