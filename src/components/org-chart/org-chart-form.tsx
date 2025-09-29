"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dropzone } from "@/components/ui/dropzone";
import { SelectableTags } from "@/components/ui/selectable-tags";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { useCreateEmployee, useUpdateEmployee } from "@/hooks/queries/use-employees";
import { useDepartments } from "@/hooks/queries/use-departments";

import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";
export type OrgChartInitialValues = {
  emp_name?: string;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  education?: string | null;
  bio?: string | null;
  branch_department?: string; // id as string for UI select
  profileImageUrl?: string;
  address?: string | null;
  city?: string | null;
};

export function OrgChartForm({ initialValues, onRegisterSubmit, isEdit = false, employeeId }: { initialValues?: OrgChartInitialValues; onRegisterSubmit?: (submit: () => void) => void; isEdit?: boolean; employeeId?: string; }) {
  // Load departments/employees/locations/branches from API
  const { data: deptData } = useDepartments();

  const branchDeptItems = React.useMemo(() => {
    const departmentsPayload = (deptData as any)?.departments;
    const results = Array.isArray(departmentsPayload?.results) ? departmentsPayload.results : (Array.isArray(deptData) ? deptData : (deptData?.results ?? []));
    const items: { id: string; label: string }[] = [];
    for (const dept of results || []) {
      const deptName = String((dept as any).dept_name ?? (dept as any).name ?? "");
      const branchDepartments = (dept as any).branch_departments as Array<any> | undefined;
      if (Array.isArray(branchDepartments)) {
        for (const bd of branchDepartments) {
          const bdId = String(bd.id);
          const branchName = String(bd?.branch?.branch_name ?? bd?.branch_name ?? "");
          items.push({ id: bdId, label: `${deptName} - ${branchName}` });
        }
      }
    }
    return items;
  }, [deptData]);

  // Single-select department, location, and manager
  const [selectedBranchDeptId, setSelectedBranchDeptId] = React.useState<string | undefined>(initialValues?.branch_department);

  // Rich text content state for bio; education is plain string
  const [bioHtml, setBioHtml] = React.useState<string | undefined>(initialValues?.bio ?? undefined);
  const [educationText, setEducationText] = React.useState<string | undefined>(initialValues?.education ?? undefined);

  // React Query mutation for create
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee(employeeId || "");
  const router = useRouter();

  // Reinitialize if initialValues change
  React.useEffect(() => {
    if (initialValues?.branch_department) {
      setSelectedBranchDeptId(initialValues.branch_department);
    }
    setBioHtml(initialValues?.bio ?? undefined);
    setEducationText(initialValues?.education ?? undefined);
  }, [initialValues?.branch_department, initialValues?.bio, initialValues?.education]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const data = new FormData(form);

    const empName = String(data.get("emp_name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const role = String(data.get("role") || "").trim();
    const phone = String(data.get("phone") || "").trim();
    const address = String(data.get("address") || "").trim();
    const city = String(data.get("city") || "").trim();

    if (!empName || !selectedBranchDeptId) {
      toast.error("Name and Branch/Department are required");
      return;
    }

    const payload = {
      emp_name: empName,
      branch_department_id: Number(selectedBranchDeptId),
      email: email || undefined,
      phone: phone || undefined,
      role: role || undefined,
      education: educationText || undefined,
      bio: bioHtml || undefined,
      address: address || undefined,
      city: city || undefined,
    } as import("@/services/employees").EmployeeCreateRequest;

    try {
      if (isEdit && employeeId) {
        await updateEmployee.mutateAsync(payload);
        toast.success("Employee updated successfully");
      } else {
        await createEmployee.mutateAsync(payload);
        toast.success("Employee created successfully");
      }
      router.push(ROUTES.ADMIN.ORG_CHART);
    } catch (error: unknown) {
      const err = error as { response?: { data?: Record<string, unknown> } };
      const dataErr = err?.response?.data;
      const messages: string[] = [];
      if (dataErr && typeof dataErr === 'object') {
        for (const key of Object.keys(dataErr)) {
          const value = dataErr[key];
          if (Array.isArray(value)) {
            value.forEach((msg: unknown) => messages.push(`${key}: ${String(msg)}`));
          } else if (typeof value === 'string') {
            messages.push(`${key}: ${value}`);
          }
        }
      }
      if (messages.length) {
        messages.forEach((m) => toast.error(m));
      } else {
        toast.error("Failed to save. Please try again.");
      }
    }
  };

  // Allow parent to trigger submit from outside via PageHeader Save button
  const formRef = React.useRef<HTMLFormElement | null>(null);
  React.useEffect(() => {
    if (onRegisterSubmit) {
      onRegisterSubmit(() => {
        if (formRef.current) {
          // Trigger native form submission to use handleSubmit
          formRef.current.requestSubmit();
        }
      });
    }
  }, [onRegisterSubmit]);

  return (
      <form ref={formRef} className="grid gap-6" onSubmit={handleSubmit}>
        <div className="grid grid-cols-12 items-center gap-4 border-t border-[#E9EAEB] pt-4">
          <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">Full Name:</Label>
          <div className="col-span-12 md:col-span-10">
            <Input name="emp_name" defaultValue={initialValues?.emp_name || ""} placeholder="Employee Name" className="border-[#E2E8F0]"/>
          </div>
        </div>

        <div className="grid grid-cols-12 items-center gap-4">
          <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">Address:</Label>
          <div className="col-span-12 md:col-span-10">
            <Input name="address" defaultValue={initialValues?.address as any} placeholder="Address" className="border-[#E2E8F0]"/>
          </div>
        </div>

        <div className="grid grid-cols-12 items-center gap-4">
          <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">City:</Label>
          <div className="col-span-12 md:col-span-10">
            <Input name="city" defaultValue={initialValues?.city as any} placeholder="City" className="border-[#E2E8F0]"/>
          </div>
        </div>

        <div className="grid grid-cols-12 items-center gap-4">
          <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">Phone:</Label>
          <div className="col-span-12 md:col-span-10">
            <Input name="phone" defaultValue={initialValues?.phone || undefined} placeholder="Phone" className="border-[#E2E8F0]"/>
          </div>
        </div>

        <div className="grid grid-cols-12 items-center gap-4">
          <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">Email Id:</Label>
          <div className="col-span-12 md:col-span-10">
            <Input name="email" defaultValue={initialValues?.email ?? undefined} placeholder="Email Id" type="email" className="border-[#E2E8F0]"/>
          </div>
        </div>

        {/* No password in Employee schema */}

        <div className="grid grid-cols-12 items-center gap-4">
          <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">Role:</Label>
          <div className="col-span-12 md:col-span-10">
            <Input name="role" defaultValue={initialValues?.role || undefined} placeholder="Role" className="border-[#E2E8F0]"/>
          </div>
        </div>

        {/* No join_date/job_title in Employee schema */}

        {/* Reporting to not part of Employee schema here */}

        <div className="grid grid-cols-12 items-center gap-4 border-t border-[#E9EAEB] pt-4">
          <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">Branch Department:</Label>
          <div className="col-span-12 md:col-span-10">
            <SelectableTags
              items={branchDeptItems}
              selectedItems={selectedBranchDeptId ? [selectedBranchDeptId] : []}
              onSelectionChange={(ids) => {
                const last = ids[ids.length - 1];
                setSelectedBranchDeptId(last);
              }}
              searchPlaceholder="Search branch departments..."
              emptyMessage="No branch departments found."
            />
          </div>
        </div>

         <div className="grid grid-cols-12 items-start gap-4 border-t border-[#E9EAEB] pt-4">
          <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">Profile Picture:</Label>
           <div className="col-span-12 md:col-span-10">
            <Dropzone 
               onFileSelect={(files) => {
                 console.log("Files selected:", files);
                 // Handle file upload logic here (use key 'profile_picture' in FormData)
               }}
               accept="image/*"
               maxSize={800 * 400}
              initialPreviewUrls={initialValues?.profileImageUrl ? [initialValues.profileImageUrl] : []}
             />
           </div>
         </div>

        <div className="grid grid-cols-12 items-start gap-4">
          <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">Education</Label>
          <div className="col-span-12 md:col-span-10">
            <Input name="education" defaultValue={educationText || undefined} onChange={(e) => setEducationText(e.target.value)} placeholder="Education" className="border-[#E2E8F0]"/>
          </div>
        </div>

        <div className="grid grid-cols-12 items-start gap-4">
          <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">Bio</Label>
          <div className="col-span-12 md:col-span-10">
            <RichTextEditor
              content={bioHtml}
              placeholder="Write Bio"
              minHeight="200px"
              maxHeight="400px"
              onChange={(html) => setBioHtml(html)}
            />
          </div>

        </div>
      </form>
  );
}


