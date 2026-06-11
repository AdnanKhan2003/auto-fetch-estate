import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "puppeteer-extra-plugin-stealth",
    "puppeteer-extra-plugin",
    "playwright-extra",
    "merge-deep",
    "clone-deep",
    "shallow-clone",
    "is-plain-object",
    "kind-of",
    "for-own",
    "lazy-cache",
    "langchain",
    "@langchain/core",
    "@langchain/google-genai",
  ],
};

export default nextConfig;
