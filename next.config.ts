import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["puppeteer-extra-plugin-stealth", "playwright-extra"],
};

export default nextConfig;
