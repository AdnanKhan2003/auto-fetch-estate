import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "puppeteer-extra-plugin-stealth",
    "playwright-extra",
    "langchain",
    "@langchain/core",
    "@langchain/google-genai",
  ],
};

export default nextConfig;
