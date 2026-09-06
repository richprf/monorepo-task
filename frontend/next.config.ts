import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  transpilePackages: ["socket.io-client", "engine.io-client"],
};

export default nextConfig;
