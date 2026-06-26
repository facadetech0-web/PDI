import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PreCar Inspect",
    short_name: "PreCar",
    description: "Mobile-first Pre-Owned Car Inspection Platform",
    start_url: "/",
    display: "standalone",
    background_color: "#020617", // slate-950 background
    theme_color: "#3b82f6", // royal blue primary theme
    icons: [
      {
        src: "/icons/icon-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
