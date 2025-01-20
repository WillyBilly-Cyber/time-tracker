import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Enable static export */
  output: "export",

  /* Optional: Specify a custom basePath if your app will be hosted in a subdirectory */
  basePath: "/timetracker", // Update this if you are hosting under a subdirectory, e.g., /timetracker.

  /* Optional: Configure asset prefix for static files */
  assetPrefix: "/timetracker/", // Matches the basePath if needed.

  /* Add other custom config options here if necessary */
};

export default nextConfig;
