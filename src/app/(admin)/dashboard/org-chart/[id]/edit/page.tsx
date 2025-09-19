"use client";

import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { OrgChartForm, type OrgChartInitialValues } from "@/components/org-chart/org-chart-form";
// import { ScrollArea } from "@radix-ui/react-scroll-area";
import { useParams } from "next/navigation";
import { useEmployee } from "@/hooks/queries/use-employees";

export default function EditOrgChartPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const { data: employee, isLoading, isError } = useEmployee(String(id));

  const expanded = employee as unknown as {
    branch_detail?: {
      department_detail?: { id?: number };
      location_detail?: { id?: number };
    };
    profile_picture_url?: string;
  } | undefined;

  const initialValues: OrgChartInitialValues | undefined = employee
    ? {
        first_name: employee.first_name || (employee.full_name ? String(employee.full_name).split(" ")[0] : ""),
        last_name: employee.last_name || (employee.full_name ? String(employee.full_name).split(" ").slice(1).join(" ") : ""),
        address: employee.address || "",
        city: employee.user_city || "",
        phone: employee.phone_number || "",
        email: employee.user_email,
        // Pull expanded details defensively from runtime payload without using any
        departmentIds: expanded?.branch_detail?.department_detail?.id ? [String(expanded.branch_detail.department_detail.id)] : [],
        branch: expanded?.branch_detail?.location_detail?.id ? String(expanded.branch_detail.location_detail.id) : undefined,
        profileImageUrl: expanded?.profile_picture_url || employee.profile_picture || undefined,
        qualificationAndEducation: employee.qualification_details || "",
        job_title: employee.job_title || "",
        emp_role: employee.emp_role || "",
        join_date: employee.join_date || "",
      }
    : undefined;

  let submitFn: (() => void) | null = null;

  return (
    <>
      <PageHeader
        title="Org Chart/Directory"
        crumbs={[{ label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD }, { label: "Org Chart/Directory", href: ROUTES.ADMIN.ORG_CHART }, 
          { label: employee?.full_name || "Employee", href: ROUTES.ADMIN.ORG_CHART_PROFILE_ID(String(id)) },
          { label: "Edit", href: ROUTES.ADMIN.ORG_CHART_PROFILE_ID_EDIT(String(id)) }]}
        action={<div className="flex gap-2"><Button onClick={() => submitFn?.()}>Save</Button></div>}
      />
      <div className="px-4 md:px-12 py-4">
        {isLoading && <div>Loading employee...</div>}
        {isError && <div>Failed to load employee.</div>}
        {initialValues && (
          <OrgChartForm
            initialValues={initialValues}
            isEdit
            employeeId={String(id)}
            onRegisterSubmit={(fn) => { submitFn = fn; }}
          />
        )}
      </div>
    </>
  );
}


