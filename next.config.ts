import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  // Allow Turbopack in dev (next-pwa only uses webpack for production builds)
  turbopack: {},
};

export default withPWA(nextConfig);
