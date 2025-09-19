"use client";

import { PageHeader } from "@/components/page-header";
import { ROUTES } from "@/constants/routes";
import { DefaultStatCards } from "@/components/dashboard/stat-cards";
import { AverageAnnouncementChart } from "@/components/dashboard/average-announcement-chart";
import { EmployeeRingChart } from "@/components/dashboard/employee-ring-chart";
import { DepartmentsTable } from "@/components/departments/departments-table";

export default function AdminHomePage() {
  return (
    <>
      <PageHeader title="Dashboard" crumbs={[{ label: "Pages", href: "#" }, { label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD }]} />
      <div className="px-4 md:px-12 py-4 space-y-6">
        <DefaultStatCards />

        <div className="grid gap-4 lg:grid-cols-3 items-stretch">
          <div className="lg:col-span-2 flex flex-col">
            <AverageAnnouncementChart
              data={["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((m, i) => ({ month: m, value: [25, 50, 35, 60, 22, 70, 15, 40, 55, 30, 65, 45][i] }))}
            />
          </div>
          <div className="flex flex-col">
          <EmployeeRingChart />
          </div>
        </div>

        <DepartmentsTable className="border-[#D0D0D0]" />
      </div>
    </>
  );
}


