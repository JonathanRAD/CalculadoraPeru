import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next and exclude external agent skills & build artifacts.
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "node_modules/**",
    ".agents/**",
    ".codex/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
