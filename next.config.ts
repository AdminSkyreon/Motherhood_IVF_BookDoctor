import type { NextConfig } from "next";

const repo = "Motherhood_IVF_BookDoctor";
const isGithubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: isGithubPages ? "export" : undefined,
  basePath: isGithubPages ? `/${repo}` : undefined,
  assetPrefix: isGithubPages ? `/${repo}/` : undefined,
  images: { unoptimized: true },
  cacheComponents: !isGithubPages,
  partialPrefetching: !isGithubPages,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
