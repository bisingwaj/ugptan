import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import nextPlugin from "@next/eslint-plugin-next";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";

/**
 * Config plate ESLint 10.
 *
 * On n'utilise PAS `eslint-config-next` tel quel : il embarque
 * eslint-plugin-react / jsx-a11y / import, dont les versions actuelles
 * plafonnent à ESLint 9 et cassent au chargement des règles (l'API `context`
 * a changé en 10). On garde donc les briques réellement compatibles : les
 * règles Next, les règles React Hooks, et le socle JS/TypeScript.
 *
 * Le parser TypeScript ne tourne que grâce au TypeScript 6 imbriqué installé
 * par `.pnpmfile.cjs` — voir l'explication détaillée dans ce fichier.
 *
 * Le typage est couvert par `pnpm typecheck` (tsc), pas par le linter : aucune
 * règle « type-aware » ici, ce qui évite d'avoir à construire un programme TS.
 */
export default [
  {
    ignores: [
      ".next/**",
      "out/**",
      "node_modules/**",
      "src/generated/**",
      "remotion/**",
      "reference/**",
      "*.config.mjs",
      ".pnpmfile.cjs",
    ],
  },

  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      globals: {
        console: "readonly",
        process: "readonly",
        fetch: "readonly",
        crypto: "readonly",
        btoa: "readonly",
        atob: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        TextEncoder: "readonly",
        TextDecoder: "readonly",
        URL: "readonly",
        Buffer: "readonly",
        window: "readonly",
        document: "readonly",
        localStorage: "readonly",
        requestAnimationFrame: "readonly",
        cancelAnimationFrame: "readonly",
budget: "readonly",
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      "@next/next": nextPlugin,
      "react-hooks": reactHooks,
    },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs["core-web-vitals"].rules,

      // Le compilateur TypeScript gère déjà ces cas, et la version « core »
      // produit des faux positifs sur les types et les enums.
      "no-unused-vars": "off",
      "no-undef": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", caughtErrors: "none" },
      ],
    },
  },

  // Composants : React Hooks + accessibilité.
  {
    files: ["src/**/*.tsx"],
    plugins: { "react-hooks": reactHooks, "jsx-a11y": jsxA11y },
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // Sous-ensemble exact d'eslint-config-next (et non le `recommended` de
      // jsx-a11y, qui remonterait 25 erreurs préexistantes) : on garde la
      // parité avec la configuration que le projet visait, sans créer de dette.
      "jsx-a11y/alt-text": ["warn", { elements: ["img"], img: ["Image"] }],
      "jsx-a11y/aria-props": "warn",
      "jsx-a11y/aria-proptypes": "warn",
      "jsx-a11y/aria-unsupported-elements": "warn",
      "jsx-a11y/role-has-required-aria-props": "warn",
      "jsx-a11y/role-supports-aria-props": "warn",
    },
  },
];
