Perfect 👍 — here’s your **final, polished, and professional version**, incorporating your last note about handling shared functionality.
This version reads naturally and fits well in a developer handbook, `README`, or `CONTRIBUTING.md`.

---

## 📁 **Folder Structure Example**

```
src/
  components/
    tabs/
      crop/
        ├── index.jsx
        └── style.module.css
      compress/
        ├── constants.js
        ├── utils.js
        ├── index.jsx
        └── style.module.css
      rotate/
        ├── index.jsx
        └── style.module.css
    header/
      ├── index.jsx
      └── style.module.css
  common/
    ├── utils.js
    ├── constants.js
    └── hooks/
        └── useExampleHook.js
  index.jsx
```

---

## 🎨 **Component & Style Guide**

### 1. 🧩 Component Organization

- Group components **by feature or function** within relevant directories.
  Example:

  - `tabs/` contains all tab-related components (`crop`, `compress`, `rotate`).
  - `header/` contains the main layout or header component.

- Each component must reside in its **own folder**, keeping its logic, styles, and helpers self-contained.

- If multiple components share logic, constants, or helpers, move them into a centralized **`/common`** folder (e.g., `common/utils.js` or `common/hooks/`).

---

### 2. 🗂️ File Naming Conventions

| Type                 | Naming Pattern                               | Example                                  |
| -------------------- | -------------------------------------------- | ---------------------------------------- |
| Component File       | `index.jsx` or `draggable.crop.jsx`          | `src/components/header/index.jsx`        |
| Style File           | `style.module.css`                           | `src/components/header/style.module.css` |
| Utility / Helper     | lowercase (e.g., `utils.js`, `constants.js`) | `src/components/tabs/compress/utils.js`  |
| Shared Functionality | Placed under `/common/`                      | `src/common/utils.js`                    |

**Notes:**

- **Folder names:** Use `kebab-case` (e.g., `draggable-crop/`).
- **Component names:** Use **PascalCase** inside code (e.g., `DraggableCrop`).
- **Component filenames (optional):** Use dot notation when needed for clarity (e.g., `draggable.crop.jsx`).

---

### 3. 🎯 CSS Class Naming

- Use **camelCase** for all CSS class names.
- Class names should be **clear and descriptive**, indicating the element’s purpose.

```css
.imageContainer {
  ...;
}
.cropArea {
  ...;
}
.headerTitle {
  ...;
}
```

---

### 4. ⚙️ General Best Practices

- Keep each component **modular and reusable** — avoid unnecessary cross-imports between component folders.
- Co-locate component-specific files like constants or utilities **inside the same folder**.
- If the same file or logic is reused across multiple components, move it to the **`/common`** directory.