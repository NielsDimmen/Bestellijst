import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Cookie-session app: avoid Cache Components prerender requirements
  // around cookies()/auth in layouts and API route handlers.
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
