import js from "@eslint/js";
import eslintPluginImport from "eslint-plugin-import";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import globals from "globals";

export default [
  {
    ignores: ["dist", "node_modules", "eslint.config.js"],
  },
  {
    files: ["**/*.{js,jsx}"],

    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      globals: globals.browser,
    },

    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
      "simple-import-sort": simpleImportSort,
      import: eslintPluginImport,
    },

    rules: {
      ...js.configs.recommended.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,

      // ❌ Disable prop-types rule (not needed)
      "react/prop-types": "off",

      // ✅ Turn off the old rule that expects `React` to be imported
      "react/react-in-jsx-scope": "off",

      // ✅ React Refresh HMR safety
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],

      // ✅ Import order — matches your expected style exactly
      "simple-import-sort/imports": [
        "error",
        {
          groups: [
            // 1️⃣ React and core libs
            ["^react", "^react-dom"],
            // 2️⃣ External packages (Antd, Lucide, etc.)
            ["^antd", "^lucide-react", "^@?\\w"],
            // 3️⃣ Internal aliases
            [
              "^@assets(/.*|$)",
              "^@common(/.*|$)",
              "^@pages(/.*|$)",
              "^@theme(/.*|$)",
            ],
            // 4️⃣ Relative imports (current project files)
            ["^\\.{1,2}/"],
            // 5️⃣ Side effects (e.g., CSS or global styles)
            ["^\\u0000", "^.+\\.(css|scss)$"],
            // 6️⃣ Assets (images, videos, etc.)
            ["^.+\\.(png|jpe?g|gif|svg|webp|mp4|mp3|ogg|wav)$"],
          ],
        },
      ],

      // ✅ Sort exports too
      "simple-import-sort/exports": "error",

      // ✅ Enforce newline between import groups
      "import/newline-after-import": ["error", { count: 1 }],
    },
  },
];
