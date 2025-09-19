"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { CardTable } from "@/components/card-table/card-table";
import { CardTableColumnHeader } from "@/components/card-table/card-table-column-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { CardTableToolbar } from "@/components/card-table/card-table-toolbar";
import { CardTablePagination } from "@/components/card-table/card-table-pagination";
import { usePinnedRows } from "@/hooks/use-pinned-rows";
import { PinRowButton } from "../card-table/pin-row-button";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import { useBranches } from "@/hooks/queries/use-branches";
import type { components } from "@/types/api";

export type DepartmentRow = {
  id: string;
  department: string;
  location: string;
  managerName: string;
  managerAvatar?: string;
  staffCount: number;
};

export function DepartmentsTable({ className }: { className?: string }) {
  const [sortedBy, setSortedBy] = React.useState<string>("name");
  const { data: branchesData, isLoading, error } = useBranches();
  const router = useRouter();

  // Transform API data to match our UI structure
  const departments: DepartmentRow[] = React.useMemo(() => {
    const list = Array.isArray(branchesData)
      ? (branchesData as components["schemas"]["Branch"][])
      : ((branchesData?.results ?? []) as components["schemas"]["Branch"][]);
    if (!list) return [];

    type BranchWithExtras = components["schemas"]["Branch"] & {
      employee_count?: number | string;
      manager_detail?: components["schemas"]["Employee"] & { profile_picture_url?: string };
    };

    return (list as BranchWithExtras[]).map((item) => ({
      id: String(item.id),
      department: item.department_detail?.name ?? "N/A",
      location: item.location_detail?.name ?? "N/A",
      managerName: item.manager_detail?.full_name || item.manager_detail?.user_email || "--",
      managerAvatar: item.manager_detail?.profile_picture_url || item.manager_detail?.profile_picture || undefined,
      staffCount: Number(item.employee_count ?? 0) || 0,
    }));
  }, [branchesData]);

  const [data, setData] = React.useState<DepartmentRow[]>(departments);
  const { pinnedIds, togglePin, ordered } = usePinnedRows<DepartmentRow>(data);

  React.useEffect(() => {
    const copy = [...departments];
    copy.sort((a, b) => {
      const key = sortedBy as keyof DepartmentRow;
      const av = (a[key] ?? "") as string;
      const bv = (b[key] ?? "") as string;
      if (typeof av === "number" && typeof bv === "number") return av - bv;
      return String(av).localeCompare(String(bv));
    });
    setData(copy);
  }, [departments, sortedBy]);

  if (isLoading) {
    return (
      <Card className={cn("border-[#FFF6F6] p-5 shadow-none overflow-hidden", className)}>
        <div className="flex items-center justify-center h-32">
          <div className="text-sm text-muted-foreground">Loading departments...</div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("border-[#FFF6F6] p-5 shadow-none overflow-hidden", className)}>
        <div className="flex items-center justify-center h-32">
          <div className="text-sm text-red-500">Error loading departments</div>
        </div>
      </Card>
    );
  }
  const columns: ColumnDef<DepartmentRow>[] = [
    {
      accessorKey: "department",
      header: ({ column }) => <CardTableColumnHeader column={column} title="Department" />,
      cell: ({ row }) => (
        <Badge variant="secondary" className="bg-[#FFF1F5] text-[#D64575] border-0">
          {row.original.department}
        </Badge>
      ),
    },
    { accessorKey: "location", header: ({ column }) => <CardTableColumnHeader column={column} title="Branch/Location" />, cell: ({ getValue }) => <span className="text-sm text-[#667085]">{String(getValue())}</span> },
    {
      accessorKey: "managerName",
      header: ({ column }) => <CardTableColumnHeader column={column} title="Manager" />,
      cell: ({ row }) => {
        const name = row.original.managerName;
        if (!name) {
          return <span className="text-sm text-[#667085]">--</span>;
        }
        return (
          <div className="flex items-center gap-2">
            <Avatar className="size-6">
              <AvatarImage src={row.original.managerAvatar} alt={name} />
              <AvatarFallback className="text-[10px]">
                {name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-[#667085]">{name}</span>
          </div>
        );
      },
    },
    { accessorKey: "staffCount", header: ({ column }) => <CardTableColumnHeader column={column} title="Staff Count" />, cell: ({ getValue }) => <span className="text-sm text-[#667085]">{String(getValue())}</span> },
    {
      id: "actions",
      header: () => <span className="text-sm font-medium text-[#727272]">Action</span>,
      cell: ({ row }) => (
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" className="text-[#D64575]">
            <Trash2 className="size-4" />
          </Button>

          <PinRowButton row={row} pinnedIds={pinnedIds} togglePin={togglePin} />
        </div>
      ),
    },
  ];

  return (
    <Card className={cn("border-[#FFF6F6] p-5 shadow-none overflow-hidden", className)}>
      <CardTableToolbar
        title="Departments"
        onSearchChange={() => { }}
        sortOptions={[
          { label: "Department", value: "department" },
          { label: "Branch/Location", value: "location" },
          { label: "Manager", value: "managerName" },
          { label: "Staff Count", value: "staffCount" },
        ]}
        activeSort={sortedBy}
        onSortChange={(v) => setSortedBy(v)}
        onFilterClick={() => { }}
      />
      <CardTable<DepartmentRow, unknown>
        columns={columns}
        data={ordered}
        headerClassName="grid-cols-[0.9fr_1.4fr_1.2fr_0.8fr_0.8fr]"
        rowClassName={() => "hover:bg-[#FAFAFB] grid-cols-[0.9fr_1.4fr_1.2fr_0.8fr_0.8fr] cursor-pointer"}
        onRowClick={(row) => router.push(ROUTES.ADMIN.DEPARTMENTS_ID(row.original.id))}
        footer={(table) => <CardTablePagination table={table} />}
      />
    </Card>
  );
}


