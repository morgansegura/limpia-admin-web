"use client";

export function hasToken(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.includes("access_token");
}

export function setToken(_: string) {
  // Intentionally left blank — token is set by server
}

export function clearToken() {
  if (typeof document !== "undefined") {
    document.cookie = "access_token=; Max-Age=0; path=/";
  }
}
