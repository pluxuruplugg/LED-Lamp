import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  cacheMaxMemorySize: 16 * 1024 * 1024,
};

export default nextConfig;
