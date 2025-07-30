import Link from "next/link";
import { MdChevronRight } from "react-icons/md";

import TypographySmall from "@/components/ui/typography-small";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { cn } from "@/lib/utils";
import { getRoleColor } from "@/lib/utils/get-role-color";
import { createAcronym } from "@/lib/utils/create-acronym";

import "./header-dropdown.css";

import type { AuthContextType } from "@/context/auth-context";

type THeaderDropdownProps = {
  user: AuthContextType["user"];
};

export function HeaderDropdown({ user }: THeaderDropdownProps) {
  const menu = [];

  console.log({ user });

  return (
    <div className="header-dropdown">
      <DropdownMenu>
        <DropdownMenuTrigger className="selector">
          <Avatar className="w-7 h-7 text-sm">
            <AvatarImage src={user?.avatarUrl} />
            <AvatarFallback className={cn(getRoleColor(user?.role))}>
              {createAcronym(`${user?.firstName} ${user?.lastName}`)}
            </AvatarFallback>
          </Avatar>

          <div className="selector-input">
            <span className="selector-name" aria-hidden="true">
              {user?.firstName} {user?.lastName}
            </span>
            <MdChevronRight className="selector-icon" />
          </div>
        </DropdownMenuTrigger>

        <DropdownMenuContent className="menu">
          {/* Profile Details */}
          <DropdownMenuItem className="profile-details">
            <Avatar className="w-9 h-9">
              <AvatarImage src={user?.avatarUrl} />
              <AvatarFallback className={cn(getRoleColor(user?.role))}>
                {createAcronym(`${user?.firstName} ${user?.lastName}`)}
              </AvatarFallback>
            </Avatar>
            <div className="grid gap-1">
              <TypographySmall>
                {user?.firstName} {user?.lastName}
              </TypographySmall>
              <TypographySmall className="text-xs text-neutral-400">
                {user?.email}
              </TypographySmall>
            </div>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel className="grid gap-1">
            <Label className="text-neutral-400">Account</Label>
            <TypographySmall className="text-sm">
              {user?.organization?.name} {user?.region}
            </TypographySmall>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Link href="/profile">View Profile</Link>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
