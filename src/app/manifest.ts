import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "JazzKeys — Leer Jazz Piano",
    short_name: "JazzKeys",
    description: "Leer jazz piano spelen: akkoorden, theorie, notenlezen en improvisatie",
    start_url: "/",
    display: "standalone",
    background_color: "#020617",
    theme_color: "#020617",
    lang: "nl",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
