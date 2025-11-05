## 🧭 **Prompt — “Pic Studio (Pro Image Editing SaaS Product)”**

**Goal:**
Design a **professional-grade image editing interface** for **Pic Studio by Skynoveau Technology** — a modern, minimal, and high-performance web-based photo editor.
The experience should feel **clean, responsive, and pro-level**, comparable to **Pixlr**, while maintaining **Pic Studio’s unique design language and UX logic**.

---

## 🏠 **Home Page**

- **Purpose:** Entry point for users to upload or import images.
- **UI Elements:**
  - Header with **Pic Studio logo and brand name**.
  - Central **upload card** with minimal styling.
  - Support for:
    - Local file upload.
    - URL-based upload.
    - Paste from clipboard.
    - Drag & drop upload.

  - On successful upload → enable **“Go to Studio”** button to navigate to the editing workspace.

---

## 🎨 **Studio Page**

### 🧩 **Header Bar**

| Section   | Content                                                                                                            |
| :-------- | :----------------------------------------------------------------------------------------------------------------- |
| **Left**  | Pic Studio logo (clickable to return to home).                                                                     |
| **Right** | • **Export** → Exports selected images.<br>• **Revert All Changes** → Restores all images to their original state. |

---

## 🧱 **Main Layout – Four-Column Responsive Grid**

| Column          | Purpose              | Description                                         |
| :-------------- | :------------------- | :-------------------------------------------------- |
| **1️⃣**          | **Navigation Menus** | List of editing and analysis tools.                 |
| **1️⃣ (nested)** | **Config Panel**     | Displays dynamic tool configuration options.        |
| **2️⃣**          | **Preview Panel**    | Central live image preview with editing tools.      |
| **3️⃣**          | **Images List**      | Thumbnail grid with selection and state management. |

---

### 1️⃣ **Left Column 1 — Navigation Menus**

Two-column structure:
**Menu List** (primary column) and **Config Panel** (secondary column).

- When a menu item is clicked:
  - Its corresponding **Config Panel** opens automatically.
  - The panel is **collapsible** to maximize preview space.

**Menu Items:**

| Tool              | Description                                                                                                                                                                              | Preview Behavior                                |
| :---------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------- |
| 📊 **Analysis**   | Displays image stats (dimensions, size, color distribution, metadata).                                                                                                                   | Shows **original image** only.                  |
| ✂️ **Crop**       | Offers aspect ratio presets, freeform crop, and dual-slider crop. Default crop fits full image dimensions.                                                                               | Shows **crop handles** on selected images.      |
| 🔄 **Rotate**     | Provides presets (90°, 180°, flip H/V) and custom rotation via slider.                                                                                                                   | Shows **rotation tool** for selected images.    |
| ⬛ **Border**     | Allows border presets (25%, 50%, 75%) and custom radius/width via sliders.                                                                                                               | Shows **border adjustment** on selected images. |
| 🎨 **Background** | Controls fill color, gradient, and background transparency removal. When transparency is removed → show “Transparent Only” toggle. If enabled → reveal color picker for background fill. | Shows **background tool** for selected images.  |
| 🗜 **Compress**   | Modes: **Smart (default)** or **Custom**. Custom mode provides preset % compression or manual slider for fine-tuning.                                                                    | Shows **compression tool** for selected images. |
| 🔁 **Convert**    | Converts images between formats: PNG, JPG, WEBP. Displays **latest processed image** before conversion, or converted version if already processed.                                       | Shows **conversion result preview**.            |
| 🧩 **Favicon**    | Generates favicons in standard resolutions. Disabled if multiple images are selected.                                                                                                    | Active only for **single-image mode**.          |

---

### 1️⃣ **Left Column 2 — Config Panel**

- Displays context-specific settings for the selected tool.
- Auto-opens upon selection.
- Collapsible toggle to expand preview area.
- All parameter changes apply **live** in the **Preview Panel**.
- Remains persistent across tab switches and image selections.

---

### 2️⃣ **Preview Column — Live Preview Panel**

- Displays the **currently active image**.
- All transformations (crop, rotate, border, background, etc.) apply **live in real time** across all tools (except Analysis).
- Supports:
  - Zoom and pan gestures.
  - Reset to original view.
  - Adaptive scaling to available space.
  - Multi-image editing flow: processes one image at a time but remembers all edits.

- Fully synced with right-column image states.

---

### 3️⃣ **Right Column — Images List**

- Displays uploaded images as thumbnails with selectable states.
- Features:
  - “**Select All**” checkbox in header.
  - Multi-image batch editing support.
  - Deselection retains unsaved changes; reselecting restores prior edit state.
  - Visual state indicators:
    - Active image (highlighted)
    - Edited (badge or icon)
    - Unedited (default)

---

## ⚙️ **Functional Requirements**

- **Real-time sync:** All edits reflect instantly in the Preview Panel.
- **Undo/Redo:** Works across all editing tools and configurations.
- **Persistent state:** No data loss on tab or image switches.
- **Multi-image workflow:** Optimized for performance with several images open simultaneously.
- **Responsive layout:** Adaptive grid and controls for all screen sizes.
- **Autosave (optional):** Retain session edits until export or manual reset.

---

## 🎯 **Design Reference**

- **Visual Inspiration:** [Pixlr Express](https://pixlr.com/express)
- **Style Direction:** Flat, minimal, modular grid design.
- **Typography:** Modern sans-serif (e.g., Inter / Manrope).
- **Color Palette:** Neutral base with brand accent highlights.
- **Interaction Tone:** Snappy, fluid animations and transitions.
- **Overall Feel:** Pro-level SaaS studio — minimal UI, maximum clarity.
