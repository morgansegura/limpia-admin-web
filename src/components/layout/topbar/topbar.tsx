"use client";

import { logoutUser } from "@/lib/api/auth";

export function Topbar() {
  return (
    <header className="h-16 px-6 flex items-center justify-between border-b bg-white">
      <div className="text-sm text-gray-500">Welcome to Limpia Admin</div>
      <div className="text-sm font-medium">User Menu</div>
      <button onClick={logoutUser}>Logout</button>
    </header>
  );
}
