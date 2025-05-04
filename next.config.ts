// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 100 % static HTML/CSS/JS
  output: "export",

  // Optional—keeps URLs ending with “/”
  trailingSlash: true,
};

export default nextConfig;
