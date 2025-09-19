import { SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { TopbarSearch } from "./topbar-search";
import { ProfileDropdown } from "./profile-dropdown";
import { cn } from "@/lib/utils";

export function AdminTopbar() {
    const { state } = useSidebar();
    const isCollapsed = state === "collapsed";

  return (
    <div className="sticky top-0 z-10 bg-background flex h-16 items-center gap-3 px-4">
    <SidebarTrigger className={cn("md:-ml-8 z-[10] transition-all", isCollapsed && "md:-ml-0")} />
    <div className="hidden flex-1 items-center md:flex transition-all">
      <TopbarSearch />
    </div>
    <div className="ml-auto flex items-center gap-6">
      <ProfileDropdown />
    </div>
  </div>
  );
}
