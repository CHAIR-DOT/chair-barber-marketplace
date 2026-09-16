import type { NextConfig } from "next";

const isPagesBuild = process.env.GITHUB_PAGES === "true";
const basePath = isPagesBuild ? (process.env.NEXT_PUBLIC_BASE_PATH ?? "") : "";

const config: NextConfig = {
  poweredByHeader: false,
  agentRules: false,
  devIndicators: false,
  ...(isPagesBuild ? { output: "export", trailingSlash: true, basePath } : {}),
  // Keep native public assets and forms aligned with Next's routing prefix.
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};
export default config;
