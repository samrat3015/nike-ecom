import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "127.0.0.1",
        port: "",
        pathname: "/storage/sliders/**",
      },
      {
        protocol: "https",
        hostname: "127.0.0.1",
        port: "",
        pathname: "/storage/products/**",
      },
    ],
  },
};

export default nextConfig;