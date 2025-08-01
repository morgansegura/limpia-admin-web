"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { logoutUser } from "@/lib/api/auth";
import { useAuth } from "@/context/auth-context";

export function LogoutButton() {
  const router = useRouter();
  const { refetchUser } = useAuth();

  const handleLogout = async () => {
    await logoutUser();
    await refetchUser(); // optionally clear user from context
    router.push("/login");
  };

  return (
    <Button variant="ghost" onClick={handleLogout}>
      <LogOut className="mr-2 h-4 w-4" />
      Log out
    </Button>
  );
}
