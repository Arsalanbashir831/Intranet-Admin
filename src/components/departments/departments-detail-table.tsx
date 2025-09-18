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
import { EllipsisVertical, Trash2 } from "lucide-react";

export type DepartmentEmployeeRow = {
  id: string;
  name: string;
  email: string;
  address: string;
  role: string;
  avatar?: string;
};

const employees: DepartmentEmployeeRow[] = [
  { id: "1", name: "Albert Flores", email: "Fisherman12@gmail.com", address: "3890 Poplar Dr.", role: "Director", avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&auto=format&fit=crop&q=60" },
  { id: "2", name: "Albert Flores", email: "Janecooper@gmail.com", address: "8080 Railroad St.", role: "Manager", avatar: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=200&auto=format&fit=crop&q=60" },
  { id: "3", name: "Albert Flores", email: "Fisherman12@gmail.com", address: "7529 E. Pecan St.", role: "HOD", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=60" },
  { id: "4", name: "Albert Flores", email: "Janecooper@gmail.com", address: "8558 Green Rd.", role: "CEO", avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&auto=format&fit=crop&q=60" },
  { id: "5", name: "Albert Flores", email: "Joneshighman@gmail.com", address: "3605 Parker Rd.", role: "Director" },
  { id: "6", name: "Albert Flores", email: "Savannhabae@yahoo.com", address: "3890 Poplar Dr.", role: "Director" },
  { id: "7", name: "Albert Flores", email: "Ester123@gmail.com", address: "775 Rolling Green Rd.", role: "Lead" },
  { id: "8", name: "Albert Flores", email: "Fisherman12@gmail.com", address: "3605 Parker Rd.", role: "Lead" },
  { id: "9", name: "Albert Flores", email: "Ester123@gmail.com", address: "3605 Parker Rd.", role: "HOD" },
];

export function DepartmentsDetailTable() {
  const [sortedBy, setSortedBy] = React.useState<string>("name");
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
  }, [sortedBy]);

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
          <Button size="icon" variant="ghost" className="text-[#667085]">
            <EllipsisVertical className="size-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card className="border-[#FFF6F6] p-5 shadow-none overflow-hidden">
      <CardTableToolbar
        title="Marketing Staff Directory"
        onSearchChange={() => {}}
        sortOptions={[
          { label: "Employee Name", value: "name" },
          { label: "Employee Email", value: "email" },
          { label: "Address", value: "address" },
          { label: "Role", value: "role" },
        ]}
        activeSort={sortedBy}
        onSortChange={(v) => setSortedBy(v)}
        onFilterClick={() => {}}
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


