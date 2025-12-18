"use client";

import { PageHeader } from "@/components/common";
import { ROUTES } from "@/constants/routes";
import { DefaultStatCards } from "@/components/dashboard/stat-cards";
import { AverageAnnouncementChart } from "@/components/dashboard/average-announcement-chart";
import { EmployeeRingChart } from "@/components/dashboard/employee-ring-chart";
import { DepartmentsTable } from "@/components/departments/departments-table";
import { useAdmin } from "@/hooks/use-admin";

const BREADCRUMBS = [
  { label: "Pages", href: "#" },
  { label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD },
];

export default function AdminHomePage() {
  const { isAdmin } = useAdmin();

  return (
    <>
      <PageHeader title="Dashboard" crumbs={BREADCRUMBS} />
      <div className="px-4 md:px-12 py-4 space-y-6">
        <DefaultStatCards />

        <div className="grid gap-4 lg:grid-cols-3 items-stretch">
          <div className="lg:col-span-2 flex flex-col">
            <AverageAnnouncementChart />
          </div>
          <div className="flex flex-col">
            <EmployeeRingChart />
          </div>
        </div>

        {isAdmin && <DepartmentsTable className="border-[#D0D0D0]" />}
      </div>
    </>
  );
}
