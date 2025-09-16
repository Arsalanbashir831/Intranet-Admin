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
import { ChevronDown, User, Settings, LogOut } from "lucide-react";

type ProfileDropdownProps = {
  name?: string;
  avatarSrc?: string;
};

export function ProfileDropdown({ name = "Brian F.", avatarSrc }: ProfileDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full focus:outline-none">
          <Avatar className="size-8">
            {avatarSrc ? <AvatarImage src={avatarSrc} alt={name} /> : null}
            <AvatarFallback className="text-sm">{name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline text-sm font-medium text-foreground">{name}</span>
          <ChevronDown className="size-4 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 size-4" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 size-4" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600 focus:text-red-600">
          <LogOut className="mr-2 size-4 text-destructive" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


