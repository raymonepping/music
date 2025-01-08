import vue from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";

export default [
  {
    ignores: ["node_modules/**", "dist/**"],
  },
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser, // Use the vue-eslint-parser for Vue files
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: "module",
        ecmaFeatures: {
          jsx: true, // Enable JSX support
        },
      },
    },
    plugins: {
      vue,
    },
    rules: {
      "no-unused-vars": "warn",
      semi: ["error", "always"],
      quotes: ["error", "double"],
      "vue/no-unused-components": "warn",
    },
  },
  {
    files: ["**/*.js"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
    },
    rules: {
      "no-unused-vars": "warn",
      semi: ["error", "always"],
      quotes: ["error", "double"],
    },
  },
];
