import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "UGZIO — Protection & Croissance pour E-commerce Tunisie",
    short_name: "UGZIO",
    description:
      "UGZIO protège votre revenue COD et génère des captions IA pour votre e-commerce en Tunisie.",
    start_url: "/overview",
    display: "standalone",
    background_color: "#0a0a0f",
    theme_color: "#0a0a0f",
    orientation: "portrait-primary",
    categories: ["business", "ecommerce", "productivity"],
    lang: "fr",
    dir: "ltr",
    prefer_related_applications: false,
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon.svg",
        sizes: "512x512",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
    screenshots: [],
    shortcuts: [
      {
        name: "Aperçu",
        short_name: "Overview",
        url: "/overview",
      },
      {
        name: "Commandes",
        short_name: "Orders",
        url: "/orders",
      },
      {
        name: "Confirmation",
        short_name: "Confirm",
        url: "/confirm",
      },
    ],
  };
}

