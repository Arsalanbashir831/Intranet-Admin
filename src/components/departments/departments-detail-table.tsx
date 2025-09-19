"use client";

import * as React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Card } from "@/components/ui/card";
import { CardTable } from "@/components/card-table/card-table";
import { CardTableColumnHeader } from "@/components/card-table/card-table-column-header";
import { CardTableToolbar } from "@/components/card-table/card-table-toolbar";
import { CardTablePagination } from "@/components/card-table/card-table-pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useEmployees } from "@/hooks/queries/use-employees";

export type DepartmentEmployeeRow = {
  id: string;
  name: string;
  email: string;
  address: string;
  role: string;
  avatar?: string;
};

interface DepartmentsDetailTableProps {
  departmentId?: string;
}

export function DepartmentsDetailTable({ departmentId }: DepartmentsDetailTableProps) {
  const [sortedBy, setSortedBy] = React.useState<string>("name");
  const { data: employeesData, isLoading, error } = useEmployees(
    departmentId ? { department: departmentId } : undefined
  );

  // Transform API data to match our UI structure
  const employees: DepartmentEmployeeRow[] = React.useMemo(() => {
    const list = Array.isArray(employeesData) ? employeesData : employeesData?.results;
    if (!list) return [];

    return list.map((emp: { id: number | string; full_name?: string; user_email?: string; address?: string; job_title?: string; emp_role?: string; profile_picture?: string; profile_picture_url?: string }) => ({
      id: String(emp.id),
      name: emp.full_name || "N/A",
      email: emp.user_email || "N/A",
      address: emp.address || "N/A",
      role: emp.job_title || emp.emp_role || "N/A",
      avatar: emp.profile_picture_url || emp.profile_picture,
    }));
  }, [employeesData]);

  const [data, setData] = React.useState<DepartmentEmployeeRow[]>(employees);

  React.useEffect(() => {
    const copy = [...employees];
    copy.sort((a, b) => {
      const key = sortedBy as keyof DepartmentEmployeeRow;
      const av = (a[key] ?? "") as string;
      const bv = (b[key] ?? "") as string;
      if (typeof av === "number" && typeof bv === "number") return av - bv;
      return String(av).localeCompare(String(bv));
    });
    setData(copy);
  }, [employees, sortedBy]);

  if (isLoading) {
    return (
      <Card className="border-[#FFF6F6] p-5 shadow-none overflow-hidden">
        <div className="flex items-center justify-center h-32">
          <div className="text-sm text-muted-foreground">Loading employees...</div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="border-[#FFF6F6] p-5 shadow-none overflow-hidden">
        <div className="flex items-center justify-center h-32">
          <div className="text-sm text-red-500">Error loading employees</div>
        </div>
      </Card>
    );
  }

  const columns: ColumnDef<DepartmentEmployeeRow>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <CardTableColumnHeader column={column} title="Employee Name" />
      ),
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Avatar className="size-6">
            <AvatarImage src={row.original.avatar} alt={row.original.name} />
            <AvatarFallback className="text-[10px]">
              {row.original.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-[#667085]">{row.original.name}</span>
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: ({ column }) => (
        <CardTableColumnHeader column={column} title="Employee Email" />
      ),
      cell: ({ getValue }) => (
        <span className="text-sm text-[#667085]">{String(getValue())}</span>
      ),
    },
    {
      accessorKey: "address",
      header: ({ column }) => (
        <CardTableColumnHeader column={column} title="Address" />
      ),
      cell: ({ getValue }) => (
        <span className="text-sm text-[#667085]">{String(getValue())}</span>
      ),
    },
    {
      accessorKey: "role",
      header: ({ column }) => <CardTableColumnHeader column={column} title="Role" />,
      cell: ({ getValue }) => (
        <span className="text-sm text-[#667085]">{String(getValue())}</span>
      ),
    },
    {
      id: "actions",
      header: () => <span className="text-sm font-medium text-[#727272]">Action</span>,
      cell: () => (
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" className="text-[#D64575]">
            <Trash2 className="size-4" />
          </Button>

        </div>
      ),
    },
  ];

  return (
    <Card className="border-[#FFF6F6] p-5 shadow-none overflow-hidden">
      <CardTableToolbar
        title="Marketing Staff Directory"
        onSearchChange={() => { }}
        sortOptions={[
          { label: "Employee Name", value: "name" },
          { label: "Employee Email", value: "email" },
          { label: "Address", value: "address" },
          { label: "Role", value: "role" },
        ]}
        activeSort={sortedBy}
        onSortChange={(v) => setSortedBy(v)}
        onFilterClick={() => { }}
      />
      <CardTable<DepartmentEmployeeRow, unknown>
        columns={columns}
        data={data}
        headerClassName="grid-cols-[1.4fr_1.6fr_1.6fr_0.8fr_0.8fr]"
        rowClassName={() => "hover:bg-[#FAFAFB] grid-cols-[1.4fr_1.6fr_1.6fr_0.8fr_0.8fr]"}
        footer={(table) => <CardTablePagination table={table} />}
      />
    </Card>
  );
}


