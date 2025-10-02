"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { ChevronRight } from "lucide-react";
import { useDashboardStats } from "@/hooks/queries/use-stats";
import { Skeleton } from "@/components/ui/skeleton";

export type StatCardItem = {
  id: string;
  label: string;
  value: string | number;
  iconPath: string; // from public/icons
  padTo?: number; // left pad numbers (e.g., 2 => 07)
};

function formatValue(value: string | number, padTo?: number) {
  if (typeof value === "number" && padTo && padTo > 0) {
    return value.toString().padStart(padTo, "0");
  }
  return value;
}

export function StatCards({ items, className }: { items: StatCardItem[]; className?: string }) {
  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 lg:grid-cols-4", className)}>
      {items.map((item) => (
        <Card
          key={item.id}
          className="rounded-xl border-2 border-secondary bg-[#FFF4F8] px-5 py-4 shadow-none gap-0"
        >
          <div className="flex items-center justify-between">
            <div className="grid size-10 place-items-center rounded-xl bg-secondary text-white">
              <Image src={item.iconPath} alt={item.label} width={20} height={20} />
            </div>
            <ChevronRight className="text-secondary" size={16} />
          </div>
          <div className="mt-4">
            <div className="text-sm text-[#6B7280]">{item.label}</div>
            <div className="mt-1 text-2xl font-bold text-secondary">
              {formatValue(item.value, item.padTo)}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function DefaultStatCards() {
  const { stats, knowledgeBaseStats } = useDashboardStats();
  
  const items = React.useMemo<StatCardItem[]>(
    () => [
      { id: "branches", label: "Office Branches", value: stats.data?.totals.branches || 0, iconPath: "/icons/building-apartment.svg", padTo: 0 },
      { id: "departments", label: "Departments", value: stats.data?.totals.departments || 0, iconPath: "/icons/user-hierarchy.svg", padTo: 0 },
      { id: "policies", label: "Policies", value: knowledgeBaseStats.data?.totals.type_policies || 0, iconPath: "/icons/page-folded.svg", padTo: 0 },
      { id: "people", label: "People", value: stats.data?.totals.employees || 0, iconPath: "/icons/users-filled.svg", padTo: 0 },
    ],
    [stats.data, knowledgeBaseStats.data]
  );
  
  // Show loading state
  if (stats.isLoading || knowledgeBaseStats.isLoading) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card
            key={i}
            className="rounded-xl border-2 border-secondary bg-[#FFF4F8] px-5 py-4 shadow-none gap-0"
          >
            <div className="flex items-center justify-between">
              <div className="grid size-10 place-items-center rounded-xl bg-secondary text-white">
                <Skeleton className="h-5 w-5 rounded-full" />
              </div>
              <ChevronRight className="text-secondary" size={16} />
            </div>
            <div className="mt-4">
              <div className="text-sm text-[#6B7280]"><Skeleton className="h-4 w-24" /></div>
              <div className="mt-1 text-2xl font-bold text-secondary">
                <Skeleton className="h-6 w-8" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }
  
  // Show error state
  if (stats.error || knowledgeBaseStats.error) {
    return (
      <div className="text-center py-4 text-red-500">
        Failed to load statistics. Please try again later.
      </div>
    );
  }
  
  return <StatCards items={items} />;
}


