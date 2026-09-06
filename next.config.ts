import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow opening the dev server via 127.0.0.1 as well as localhost
  // so client JS / polling actually hydrate in this environment.
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
