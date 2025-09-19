"use client";

import * as React from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { ChevronRight } from "lucide-react";

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
  const items = React.useMemo<StatCardItem[]>(
    () => [
      { id: "branches", label: "Office Branches", value: 10, iconPath: "/icons/building-apartment.svg", padTo: 0 },
      { id: "departments", label: "Departments", value: 7, iconPath: "/icons/user-hierarchy.svg", padTo: 2 },
      { id: "policies", label: "Policies", value: 83, iconPath: "/icons/page-folded.svg", padTo: 0 },
      { id: "people", label: "People", value: 131, iconPath: "/icons/users-filled.svg", padTo: 0 },
    ],
    []
  );
  return <StatCards items={items} />;
}


