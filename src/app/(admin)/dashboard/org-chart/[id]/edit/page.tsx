"use client";

import * as React from "react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { OrgChartForm, type OrgChartInitialValues } from "@/components/org-chart/org-chart-form";
// import { ScrollArea } from "@radix-ui/react-scroll-area";
import { useParams } from "next/navigation";
import { useEmployee } from "@/hooks/queries/use-employees";
import type { components } from "@/types/api";
import { Loader2 } from "lucide-react";

export default function EditOrgChartPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const { data, isLoading, isError } = useEmployee(String(id));
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  type ApiEmployee = components["schemas"]["Employee"];
  const isDetailWrapper = (value: unknown): value is { employee: ApiEmployee } => {
    return Boolean(value) && typeof value === "object" && "employee" in (value as Record<string, unknown>);
  };
  const apiEmployee: ApiEmployee | undefined = isDetailWrapper(data) ? data.employee : (data as ApiEmployee | undefined);

  const branchDepartmentId = apiEmployee?.branch_department ? String((apiEmployee as unknown as { branch_department: { id?: number | string } }).branch_department.id ?? "") : undefined;

  const initialValues: OrgChartInitialValues | undefined = apiEmployee
    ? {
        emp_name: (apiEmployee as unknown as { emp_name?: string }).emp_name ?? "",
        email: (apiEmployee as unknown as { email?: string | null }).email ?? undefined,
        phone: (apiEmployee as unknown as { phone?: string | null }).phone ?? undefined,
        role: (apiEmployee as unknown as { role?: string | null }).role ?? undefined,
        education: (apiEmployee as unknown as { education?: string | null }).education ?? undefined,
        branch_department: branchDepartmentId,
        profileImageUrl: (apiEmployee as unknown as { profile_picture?: string | null }).profile_picture ?? undefined,
        address: (apiEmployee as unknown as { address?: string | null }).address ?? undefined,
        city: (apiEmployee as unknown as { city?: string | null }).city ?? undefined,
      }
    : undefined;

  let submitFn: (() => void) | null = null;

  const handleSave = () => {
    setIsSubmitting(true);
    submitFn?.();
  };

  return (
    <>
      <PageHeader
        title="Org Chart/Directory"
        crumbs={[{ label: "Dashboard", href: ROUTES.ADMIN.DASHBOARD }, { label: "Org Chart/Directory", href: ROUTES.ADMIN.ORG_CHART }, 
          { label: apiEmployee?.emp_name || "Employee", href: ROUTES.ADMIN.ORG_CHART_PROFILE_ID(String(id)) },
          { label: "Edit", href: ROUTES.ADMIN.ORG_CHART_PROFILE_ID_EDIT(String(id)) }]}
        action={<div className="flex gap-2"><Button onClick={handleSave} disabled={isSubmitting}>{isSubmitting ? <><Loader2 className="animate-spin mr-2 h-4 w-4" /> <span>Saving...</span></> : "Save"}</Button></div>}
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


