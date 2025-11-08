# 🧭 **Pic Studio — Pro Image Editing SaaS Product**

### **UI & Interaction Specification (Refined)**

A professional-grade, high-performance photo editing workspace for **Pic Studio by Skynoveau Technology**.
Built with **Ant Design core components only** (Button, Upload, Tabs, Slider, Checkbox, Select, Input, Dragger, etc.).
Avoid decorative AntD components like Typography or Card.

---

# 🏠 1. **Home Page**

### ✅ Purpose

A clean, distraction-free starting point for image onboarding before entering the Studio.

### ✅ UI Layout

#### **Header**

- Left: Pic Studio logo + brand text
- Right: Empty

#### **Central Upload Panel**

All input methods must be visible and minimal:

- Click-to-upload (**Upload**)
- Drag-and-drop (**Upload.Dragger**)
- URL import input + button
- Paste-from-clipboard support

#### **After Upload**

- Show a large **“Go to Studio”** Button
- Multi-file uploads can auto-navigate to Studio

---

# 🎨 2. **Studio Page**

A four-column professional editing interface with global state, per-tool configuration, and real-time preview.

### ✅ Header Bar

| Position   | Content                                                                                                     |
| ---------- | ----------------------------------------------------------------------------------------------------------- |
| **Left**   | Logo                                                                                                        |
| **Center** | **Import Images** button (returns to Home)                                                                  |
| **Right**  | **Export** button<br>• Exports each image individually<br>• No ZIP<br>• Favicon tool handles its own export |

---

# 🧱 3. **Four-Column Main Layout**

| Column                | Role              | Notes                        |
| --------------------- | ----------------- | ---------------------------- |
| **1. Left Menu**      | Tools list        | Click to toggle config panel |
| **1A. Nested Panel**  | Tool Config Panel | Dynamic per-tool settings    |
| **2. Center Preview** | Main workspace    | Zoom, pan, edits preview     |
| **3. Right Panel**    | Images List       | Selection + active image     |

Desktop layout should stay consistent; responsive adjustments only when needed.

---

# 🔧 4. **Tools Menu (Left Column)**

### ✅ Interaction Rules

- Clicking a tool expands its config panel
- Clicking again collapses it
- Panel state persists when switching images
- Multi-select behavior depends on tool
- Show a small dot when tool changes are applied

### ✅ Tools Overview

| Tool           | Description                                                                                                            | Preview Interaction    |
| -------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------- |
| **Analysis**   | Metadata, dimensions, color values, size. Tabs: Original, Modified, Layout Settings (single column, auto, two-column). | Read-only panel        |
| **Crop**       | Aspect ratios, presets, freeform, sliders. Default covers full image.                                                  | Crop handles           |
| **Rotate**     | 90/180 presets, Flip H/V, custom slider.                                                                               | Rotation overlay       |
| **Border**     | Thickness presets, custom width, radius sliders.                                                                       | Border outline         |
| **Background** | Color fill, gradient, remove background, transparency toggle. Transparent auto-uses PNG.                               | Background overlay     |
| **Compress**   | Smart (default) + Custom. Indicator if uncompressed. Right panel shows comparison.                                     | Compression comparison |
| **Convert**    | JPG, PNG, WEBP. Always uses latest state.                                                                              | Conversion preview     |
| **Favicon**    | Generates multiple icon resolutions. Disabled for multi-select. Has dedicated export.                                  | Tool-specific          |

---

# ⚙️ 5. **Tool Config Panel**

### ✅ Behavior

- analysis tool config panel opened defaultly 
- Header shows tool name, description, and **Reset** (resets only that tool)

### ✅ Multi-Select Handling

Visible only when more than one image is selected.

Tabs:

1. **Current Image Settings**
2. **Bulk Settings**

**Bulk Settings Rules:**

- Applies settings to all selected images
- Switching to “Current” shows inherited values as read-only
- Individual overrides require switching to single-select
- Unselected images retain their own states

### ✅ Favicon Exception

- Has its own **Export** button
- Skips global export rules

---

# 🖼️ 6. **Preview Panel (Center Column)**

Primary interactive workspace with real-time editing.

### ✅ Features

- Real-time preview for all tools
- Interactive crop and rotate handles
- Zoom, pan, fit-to-screen
- **Undo / Redo** (global stack)
- **Revert All**

  - Single image → reset that image
  - Multi-select → reset selected images

- Always synced with:

  - Tool settings
  - Image selection
  - Global state

---

# 🗂️ 7. **Images List (Right Column)**

### ✅ Layout

- Fixed width: **150px**
- Single-column scrollable list

### ✅ Features

- **Select All** checkbox in header

  - Auto-updates when user manually toggles items

- Thumbnails show:

  - Active-state highlight
  - Checkbox (always visible, stronger on hover)
  - Edited badge/icon
  - Unedited state

- Deselecting doesn’t remove edits
- Reselecting restores retained state instantly

---

# ⚙️ 8. **Global Functional Requirements**

### ✅ Core System Behavior

- Real-time sync across all panels with preview panel
- Each panel changes should apply on last processed Image
- Global undo/redo
- Every tool maintains its own internal state history
- State persists when:

  - Changing tools
  - Switching images
  - Switching between bulk and individual mode

- Optimized for:

  - Multi-image editing
  - High-resolution images

- Responsive adjustments without breaking four-column logic
- Optional local autosave until:

  - Export
  - Clear workspace
  - Reset All
