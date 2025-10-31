/**
 * Clean Professional SaaS Theme
 * Minimal, flat design for production-ready applications
 */

export const antdTheme = {
  token: {
    // Primary Colors
    colorPrimary: '#6366f1', // Indigo
    colorSuccess: '#10b981', // Green
    colorWarning: '#f59e0b', // Amber
    colorError: '#ef4444', // Red
    colorInfo: '#3b82f6', // Blue

    // Background Colors
    colorBgContainer: '#ffffff',
    colorBgElevated: '#ffffff',
    colorBgLayout: '#f8f9fa',

    // Border Colors
    colorBorder: '#e5e7eb',
    colorBorderSecondary: '#f3f4f6',

    // Text Colors
    colorText: '#1f2937',
    colorTextSecondary: '#6b7280',
    colorTextTertiary: '#9ca3af',

    // Font
    fontSize: 14,
    fontSizeHeading1: 30,
    fontSizeHeading2: 24,
    fontSizeHeading3: 20,
    fontSizeHeading4: 18,
    fontSizeHeading5: 16,
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',

    // Border Radius
    borderRadius: 6,
    borderRadiusLG: 8,
    borderRadiusSM: 4,

    // Spacing
    padding: 16,
    paddingLG: 24,
    paddingSM: 12,
    paddingXS: 8,

    // Shadow
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    boxShadowSecondary: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',

    // Control Heights
    controlHeight: 36,
    controlHeightLG: 40,
    controlHeightSM: 32,
  },

  components: {
    Button: {
      colorPrimary: '#6366f1',
      controlHeight: 36,
      controlHeightLG: 40,
      fontWeight: 500,
      fontSize: 14,
    },

    Card: {
      colorBorderSecondary: '#e5e7eb',
      borderRadiusLG: 8,
      paddingLG: 24,
    },

    Input: {
      controlHeight: 36,
      controlHeightLG: 40,
      borderRadius: 6,
      colorBorder: '#d1d5db',
      fontSize: 14,
    },

    Tabs: {
      colorPrimary: '#6366f1',
      itemActiveColor: '#6366f1',
      itemHoverColor: '#818cf8',
      itemSelectedColor: '#6366f1',
      inkBarColor: '#6366f1',
      fontSize: 14,
      fontSizeLG: 16,
      fontWeightStrong: 600,
    },

    Tag: {
      colorPrimary: '#6366f1',
      colorSuccess: '#10b981',
      colorWarning: '#f59e0b',
      colorError: '#ef4444',
      colorInfo: '#3b82f6',
      borderRadiusSM: 4,
      fontSize: 13,
      fontWeight: 500,
    },

    Progress: {
      colorSuccess: '#10b981',
      defaultColor: '#6366f1',
      remainingColor: '#e5e7eb',
    },

    Slider: {
      colorPrimary: '#6366f1',
      colorPrimaryBorder: '#6366f1',
      colorPrimaryBorderHover: '#4f46e5',
      handleSize: 14,
      handleSizeHover: 16,
      railSize: 4,
      trackBg: '#6366f1',
      trackHoverBg: '#4f46e5',
    },

    Switch: {
      colorPrimary: '#6366f1',
      colorPrimaryHover: '#4f46e5',
      handleSize: 18,
      trackHeight: 22,
      trackMinWidth: 44,
    },

    Select: {
      controlHeight: 36,
      controlHeightLG: 40,
      borderRadius: 6,
      colorPrimary: '#6366f1',
      fontSize: 14,
    },

    Divider: {
      colorSplit: '#e5e7eb',
    },

    Typography: {
      colorText: '#1f2937',
      colorTextSecondary: '#6b7280',
      colorTextHeading: '#1f2937',
      fontWeightStrong: 600,
      fontSize: 14,
    },
  },
};
