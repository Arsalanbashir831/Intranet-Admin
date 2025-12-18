"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown, User, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import { useLogout } from "@/hooks/queries/use-auth";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { getInitials } from "@/lib/utils";
import { ProfileDropdownProps } from "@/types/admin";

export function ProfileDropdown({ name, avatarSrc }: ProfileDropdownProps) {
  const { user } = useAuth();
  const logoutMutation = useLogout();

  const displayName = name || user?.name || "User";
  const displayAvatar = avatarSrc || user?.avatar;

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full focus:outline-none">
          <Avatar className="size-8">
            {displayAvatar ? (
              <AvatarImage src={displayAvatar} alt={displayName} />
            ) : null}
            <AvatarFallback className="text-sm">
              {getInitials(displayName)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline text-sm font-medium text-foreground">
            {displayName}
          </span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <Link href={ROUTES.ADMIN.PROFILE}>
          <DropdownMenuItem>
            <User className="mr-2 size-4" />
            Profile
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem
          className="text-red-600 focus:text-red-600"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}>
          <LogOut className="mr-2 size-4 text-destructive" />
          {logoutMutation.isPending ? "Signing out..." : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
