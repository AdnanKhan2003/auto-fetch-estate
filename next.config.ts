import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "puppeteer-extra-plugin-stealth",
    "puppeteer-extra-plugin",
    "playwright-extra",
    "playwright-core",
    "merge-deep",
    "clone-deep",
    "@sparticuz/chromium",
    "shallow-clone",
    "is-plain-object",
    "kind-of",
    "for-own",
    "lazy-cache",
    "langchain",
    "@langchain/core",
    "@langchain/google-genai",
  ],
  outputFileTracingIncludes: {
    "/api/**": [
      "./node_modules/playwright-core/**/*",
      "./node_modules/@sparticuz/chromium/**/*",
      "./node_modules/shallow-clone/**/*",
      "./node_modules/is-plain-object/**/*",
      "./node_modules/kind-of/**/*",
      "./node_modules/for-own/**/*",
      "./node_modules/lazy-cache/**/*",
      "./node_modules/clone-deep/**/*",
      "./node_modules/merge-deep/**/*",
      "./node_modules/puppeteer-extra-plugin-stealth/**/*",
      "./node_modules/puppeteer-extra-plugin/**/*",
    ],
  },
};

export default nextConfig;
