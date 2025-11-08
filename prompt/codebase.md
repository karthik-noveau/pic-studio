# 🏗️ **Project Architecture & Code Standards**

For **any** AI-generated output involving code, architecture, documentation, refactoring, optimization, or file creation:

- ✅ Follow **every rule** in this document exactly.
- ✅ Follow naming, structure, examples, and conventions **without modification**.
- ✅ When something is unclear, **AI must ask the user** before generating code.
- ❌ No assumptions, creativity, renaming, reorganizing, or restructuring.
- ❌ No unapproved folders like `lib`, `shared`, `helpers`, `ui`, etc.
- ✅ Use Zustand store when state persistence across components is required.

---

# ✅ 1. Folder Structure (Strict Standard)

```
src/
  assets/
    ├── logo/
    ├── icons/
    ├── page-name/

  common/
    ├── components/
    ├── utils/
    │     ├── background.removal.js
    │     ├── drag.js
    │     └── index.js
    ├── constants/
    │     └── index.js
    └── hooks/
          ├── processed.image.js
          └── index.js

  pages/
    page-name/
      ├── index.jsx
      ├── slider/
      │     └── index.js
      ├── style.module.css
      ├── utils.js
      └── constants.js

  theme/
    ├── override.css
    ├── colors.css
    └── font.css
```

### ✅ Mandatory Notes

- Every page needs a **style.module.css**.
- Page-specific utilities must remain inside their own folders.
- Shared logic lives **only** inside `/common/`.
- Large JSX must be split using `slider/` or additional subcomponents.
- Use central `index.js` files for clean imports.

---

# ✅ 2. Shared Logic Rules

| Use Case               | Location              |
| ---------------------- | --------------------- |
| Reusable UI components | `/common/components/` |
| Shared utilities       | `/common/utils/`      |
| Shared constants       | `/common/constants/`  |
| Shared hooks           | `/common/hooks/`      |

- ❌ No duplicating logic across pages.
- ✅ Always export everything through the **index.js** of each folder.

---

# ✅ 3. Naming Conventions

| Item               | Rule                   | Example                       |
| ------------------ | ---------------------- | ----------------------------- |
| Folders            | kebab-case             | `image-crop/`                 |
| Page component     | index.jsx              | `pages/home/index.jsx`        |
| Subcomponents      | dot.notation           | `slider.card.jsx`     |
| Styles             | style.module.css       | `pages/home/style.module.css` |
| Utils/Constants    | lowercase              | `utils.js`                    |
| Advanced utils     | dot.notation           | `upload.handler.js`           |
| React Components   | PascalCase             | `ImagePreview`                |
| Hooks              | camelCase + use prefix | `useProcessedImage()`         |
| CSS Module classes | camelCase              | `.imageContainer`             |

---

# ✅ 4. Styling Rules

- ✅ Use CSS Modules only.
- ✅ `/theme` defines colors, fonts, and resets.
- ❌ No inline styles.
- ❌ No Tailwind, SCSS, Styled Components, Emotion.

**CSS Example:**

```css
container {
  display: flex;
  align-items: center;
  justify-content: center;
}

buttonPrimary {
  margin-top: 12px;
}
```

---

# ✅ 5. AI Behavior Rules

## 🔒 5.1 Code Generation Requirements

AI must:

- ✅ Mirror the folder structure **exactly**.
- ✅ Generate all mandatory files:

  - `index.jsx`
  - `style.module.css`

- ✅ Use modular structure; split large JSX.
- ✅ Import everything through central `index.js` files.
- ❌ Never introduce new folder names.
- ❌ Never merge unrelated logic.

---

## 📏 5.2 Formatting Rules

Order of imports:

1. React
2. External libraries
3. Internal modules (common, pages)
4. CSS modules

Max file size: **~200 lines**.

---

## 🧩 5.3 Error Prevention

- ❌ Never hallucinate component names or logic.
- ❌ Never add new concepts without user approval.
- ✅ If ANY detail is missing or ambiguous → **ask the user**.

---

## ✅ 5.4 AI Self-Check

AI must verify:

1. Folder structure follows spec
2. File names match exact rules
3. Page has a `style.module.css`
4. No Tailwind or inline styles
5. Imports follow global index exports
6. No unknown folders
7. React components use PascalCase
8. Hooks follow use-prefix naming
9. Zustand used only when needed
