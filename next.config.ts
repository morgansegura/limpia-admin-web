import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  devIndicators: {
    buildActivity: false, // This specifically hides the build activity indicator
    buildActivityPosition: "bottom-right", // You can also change its position if you want to keep it
  },
};

export default nextConfig;
