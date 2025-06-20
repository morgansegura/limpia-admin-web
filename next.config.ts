import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  matcher: ["/((?!_next|.*\\..*).*)"],
};

export default nextConfig;
