import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  /* config options here */
  turbopack: {},
  eslint: {
    // Lint errors should not block production builds; run lint separately in CI.
    ignoreDuringBuilds: true,
  },
};

export default withSerwist(nextConfig);
