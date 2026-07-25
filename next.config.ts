import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent ws from being bundled into client-side or edge bundles
  serverExternalPackages: ["ws"],
};

export default nextConfig;
