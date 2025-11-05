## 🧭 5. Import Order Standard

Maintain this **strict import order**:

```js
// 1️⃣ React and core libraries
import React from "react";

// 2️⃣ Third-party packages
import { motion } from "framer-motion";

// 3️⃣ Aliased/shared imports
import { useExampleHook } from "@common/hooks";
import { Button } from "@components/button";
import Banner from "@assets/home/top-banner.png";

// 4️⃣ Local imports (specific to this component)
import { processImage } from "./utils";

// 5️⃣ Styles (always last)
import styles from "./style.module.css";
```

---

## ⚙️ 6. ESLint + Prettier + VSCode Setup

These settings ensure **auto-format and import order enforcement on save.**

### `.eslintrc.json`

```json
{
  "extends": [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "prettier"
  ],
  "plugins": ["react", "import"],
  "rules": {
    "react/react-in-jsx-scope": "off",
    "import/order": [
      "error",
      {
        "groups": [["builtin", "external"], ["internal"], ["parent", "sibling", "index"]],
        "pathGroups": [
          {
            "pattern": "@common/**",
            "group": "internal",
            "position": "before"
          },
          {
            "pattern": "@components/**",
            "group": "internal",
            "position": "before"
          },
          { "pattern": "@pages/**", "group": "internal", "position": "before" },
          { "pattern": "@assets/**", "group": "internal", "position": "before" }
        ],
        "newlines-between": "always",
        "alphabetize": { "order": "asc", "caseInsensitive": true }
      }
    ]
  },
  "settings": {
    "import/resolver": {
      "alias": {
        "map": [
          ["@common", "./src/common"],
          ["@components", "./src/components"],
          ["@pages", "./src/pages"],
          ["@assets", "./src/assets"]
        ],
        "extensions": [".js", ".jsx"]
      }
    }
  }
}
```

### `.prettierrc`

```json
{
  "singleQuote": false,
  "trailingComma": "es5",
  "semi": true,
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always"
}
```

### `.vscode/settings.json`

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```
