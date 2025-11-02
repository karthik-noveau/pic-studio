### 🎨 **UI / Font Color**

- Audit and fix **light or low-contrast font colors**.
- Ensure text (like tool labels, tab names, sliders) is **readable on both light and dark backgrounds**.

---

### Crop**

**Right Panel (Properties / Controls):**

- Should be **fixed position** with its own **scrollable content**.


- When user **drags corners**, the image should **scale proportionally** (maintaining width–height ratio).
- Default display mode → **“Fit to screen”** using a **slider**.

  - The slider should adjust **zoom** but always keep the image fully visible in view area.

---

### ⛶ **Border**

- Border should apply **only to the image’s rounded area**,
  not to the **transparent / empty space** outside the image bounds.
- Border-radius should **follow the image shape** exactly.


---

### 🪄 **Tab Sync Behavior**

- Each editing tab (Crop, Rotate, Resize, Compress, etc.) should show the **latest edited state**.
- Example:

  - If user rotates image in **Rotate tab**,
  - Then opens **border radius tab**,
  - border radius should apply on rotated result image
  - So each tab should show the final exportable result only
  - if i revert in tab, that tab change only revert
