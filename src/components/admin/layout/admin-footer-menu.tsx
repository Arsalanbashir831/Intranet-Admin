"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Settings, LogOut, Users, ChevronUp, ChevronDown } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/contexts/auth-context";
import { useLogout } from "@/hooks/queries/use-auth";

export function AdminFooterMenu() {
  const { user } = useAuth();
  const logoutMutation = useLogout();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between p-3 text-white hover:bg-white/10 group-data-[collapsible=icon]:justify-center"
        >
          <span className="flex items-center gap-3 group-data-[collapsible=icon]:gap-0">
            <Avatar className="size-8 bg-white text-black rounded-[4px]">
              <AvatarFallback>{user?.name?.split(" ")[0]}</AvatarFallback>
            </Avatar>
            <span className="text-base group-data-[collapsible=icon]:hidden">{user?.name}</span>
          </span>
          <span className="flex flex-col items-center text-white/90 group-data-[collapsible=icon]:hidden">
            <ChevronUp className="size-4" />
            <ChevronDown className="size-4 -mt-1" />
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" side="top" className="w-56">
        <DropdownMenuLabel>Workspace</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Users className="mr-2 size-4" />
            Manage Employees
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Settings className="mr-2 size-4" />
            Settings
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => logoutMutation.mutate()}>
          <LogOut className="mr-2 size-4 text-destructive" />
          {logoutMutation.isPending ? "Signing out..." : "Sign out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


