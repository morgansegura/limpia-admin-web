"use client";

import { useEffect, useState } from "react";

type DeviceType = "mobile" | "tablet" | "laptop" | "desktop" | null;

export function useDeviceType(): DeviceType {
  const [deviceType, setDeviceType] = useState<DeviceType>(null);

  useEffect(() => {
    const getDeviceType = (width: number): DeviceType => {
      if (width < 768) return "mobile";
      if (width < 1024) return "tablet";
      if (width < 1280) return "laptop";
      return "desktop";
    };

    const handleResize = () => {
      setDeviceType(getDeviceType(window.innerWidth));
    };

    handleResize(); // Set on mount
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return deviceType;
}
