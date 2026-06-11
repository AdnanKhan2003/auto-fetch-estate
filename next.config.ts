import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "puppeteer-extra-plugin-stealth",
    "playwright-extra",
    "langchain",
    "puppeteer-extra-plugin",
    "clone-deep",
    "merge-deep",
    "is-plain-object",
    "shallow-clone",
    "@langchain/core",
    "@langchain/google-genai",
  ],
};

export default nextConfig;
