# 🏗️ Project Architecture & Code Standards

This document defines the **project structure, naming conventions, styling rules, and linting setup** to ensure consistent, scalable, and maintainable React codebases.

---

## 📂 1. Folder Structure Standards

```
src/
  assets/
    ├── logo/
    ├── page-name/

  components/                → Reusable UI components shared across the app

  common/                    → Shared logic and utilities
    ├── utils/
    │   ├── background.removal.js  
    │   └── index.js         // Export all utils here
    ├── constants/
    │   └── index.js         // Export all constants here
    └── hooks/
        ├── processed.image.js  
        └── index.js         // Export all hooks here

  pages/                     → Page-level or feature-specific modules
    page-name/
      ├── index.jsx
      ├── style.module.css
      ├── utils.js
      └── constants.js

  theme/                     → Global styling assets
    ├── override.css         // Base resets (e.g., body { margin: 0; })
    ├── colors.css           // Custom color variables (--black-color, etc.)
    ├── font.css             // Font sizing variables (--font-size-6, etc.)

App.jsx
main.js
README.md
```

### Notes

* ✅ Every **component** or **page** must include its own `style.module.css` file.
* 🧩 Keep each folder **focused**, **self-contained**, and **purpose-driven**.

---

## 🧩 2. General Rules

### 📁 Feature-Based Grouping

* Each **page** or **feature** should contain its logic, styles, and helpers within its folder.
* The structure should be self-explanatory — opening a folder should clearly indicate its purpose.

### ♻️ Shared Logic

* Shared logic → `/common/hooks` or `/common/utils`
* Shared constants → `/common/constants`
* Always **import shared utilities** — never copy-paste between modules.

### 🧱 Reusable Components

* Components reused across multiple areas belong in `/components/`.
* Build complex interfaces by composing **small, modular, and testable** components.

### 🧠 Code Clarity

* Keep components **small, focused, and readable**.
* One file = one responsibility.
* Favor **clarity over cleverness** — code should be understandable at first glance.

---

## ✨ 3. Naming Conventions

| Entity Type               | Format                      | Example                              |
| ------------------------- | --------------------------- | ------------------------------------ |
| Folders                   | kebab-case                  | `image-crop/`, `file-uploader/`      |
| Component Files           | `index.jsx`                 | `src/components/tabs/crop/index.jsx` |
| Style Files               | `style.module.css`          | `src/pages/home/style.module.css`    |
| Utility / Constant Files  | lowercase                   | `utils.js`, `constants.js`           |
| Component Names (in code) | PascalCase                  | `export function ImageCrop()`        |
| Hook Names                | camelCase with “use” prefix | `useImagePreview.js`                 |
| CSS Class Names           | camelCase                   | `.imageContainer`, `.actionButton`   |

---

## 🎨 4. Styling Conventions

* ✅ Use **CSS Modules** (`style.module.css`) for scoped styling.
* ✅ Keep **global styles** (colors, fonts, base resets) in `/theme/`.
* ❌ No inline styles.
* ❌ No Tailwind CSS.

**Example:**

```css
/* style.module.css */
.container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.imagePreview {
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.actionButton {
  margin-top: 12px;
}
```

---

## 🧠 8. Universal AI Code Generation Prompt

### **AI Code Generation Standards**

When generating React code for this project, **always** follow these rules:

1. Follow the **exact folder structure** shown above.
2. ❌ Do **not** create or use `src/App.css` or `src/index.css`.
3. ✅ Use `/theme/` for all global styling and `style.module.css` for component-level styles.
4. Export each component as a **named** PascalCase function — e.g., `export function ImageCrop()`.
5. Use **only CSS Modules** — no inline or Tailwind styles.
6. Keep files **single-purpose**. Split complex logic into smaller components or hooks.
7. Place reusable logic in `/common/hooks` or `/common/utils`, and always update `index.js` exports.
8. Follow all **naming**, **structure**, and **styling** rules defined in this document.

 