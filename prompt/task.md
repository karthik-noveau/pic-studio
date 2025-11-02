Here’s a **refined professional prompt** you can use to design or generate the **Split View Image Studio (Pro-Level Editing UI)** — consistent with your existing structure and functionality (like your current codebase).
It’s rewritten for clarity, hierarchy, and developer-friendly implementation — similar in quality to **Picsart / Fotor / Canva** level studios.

---

### 🧭 **Prompt – “Split View Studio (Pro Image Editing UI)”**

**Goal:**
Design a professional-grade image editing studio interface for **Split View by Skynoveau Technology**, matching a modern web-app design system.
The interface should feel minimal, fast, and pro-level — similar to **Picsart**, but aligned with our **Split View** brand style and existing UI logic.

---

### 🏠 **Home Page**

- **Upload UI:**

  - Support multiple local file uploads and URL-based uploads.
  - Uploaded images instantly appear in the **Gallery UI**.
  - Drag-and-drop zone + “Paste from Clipboard” support.
  - Clean layout with large “Upload or Drop Images” CTA.

- **Gallery UI:**

  - Display uploaded images as cards or tiles.
  - Each card: thumbnail, filename, remove button, and quick “Open in Studio” button.
  - Minimal, responsive grid with hover effects.

---

### 🎨 **Studio Page Layout**

**Three-column responsive layout:**

#### 1️⃣ Left Column → _Navigation Panel_

- Vertical toolbar or collapsible sidebar.
- **Menu Items:**

  - 🏠 **Import** → Navigate back to Home (preserve current studio state).
  - 📊 **Analysis** → Image stats (dimensions, size, colors, metadata).
  - ✂️ **Crop** → Aspect ratio presets, freeform crop, live preview sync.
  - 🔄 **Rotate** → 90°, 180°, flip horizontal/vertical with preview sync.
  - ⬛ **Border** → Border radius, color, thickness; apply via preview.
  - 🎨 **Background** → Fill color, gradient, or transparent toggle.
  - 🗜 **Compress** → Real-time compression preview with size reduction stats.
  - 🔁 **Convert** → Format conversion (PNG, JPG, WEBP, ICO).
  - 🧩 **Favicon** → Generate favicon with preset resolutions.

#### 2️⃣ Center Column → _Live Preview Panel_

- Displays **single active image**.
- All changes (crop, rotate, border, etc.) apply **live in real time**.
- Supports zoom, pan, and reset view.
- Adaptive scaling to fit available space.

#### 3️⃣ Right Column → _Configuration Panel_

- Dynamic content changes based on selected left tab.
- Each tool (crop, rotate, etc.) loads its own configuration controls:

  - e.g., **Crop** → aspect ratio selector, apply/reset buttons.
  - e.g., **Border** → color picker, radius slider, size input.

- Include “Apply” + “Reset” + “Download” actions per tab.

---

### ⚙️ **Functional Requirements**

- **All edits must stay in sync** with the center preview.
- Undo/Redo support across all tools.
- No reload loss of unsaved changes.
- Performance-optimized: handle multiple images in session.
- Fit seamlessly into existing Split View code architecture.

---

### ✅ **Reference**

- Reference: [https://picsart.com/](https://picsart.com/) (for usability + tool layout inspiration)
- Follow **current React**, each feature modular (one component per tool).
