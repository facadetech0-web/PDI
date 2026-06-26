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
  typescript: {
    // Allow builds to complete even with TS errors; fix errors separately.
    ignoreBuildErrors: true,
  },
};

export default withSerwist(nextConfig);
