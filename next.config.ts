import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "http://localhost:3000",
    "http://192.168.1.16:3000",
    "https://looniesapp.dk",
    "https://www.looniesapp.dk",
  ],
};

export default nextConfig;
