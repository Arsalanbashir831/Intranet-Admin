"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dropzone } from "@/components/ui/dropzone";
import { SelectableTags } from "@/components/ui/selectable-tags";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { useCreateEmployee, useUpdateEmployee } from "@/hooks/queries/use-employees";
import { useDepartments, useSearchDepartments } from "@/hooks/queries/use-departments";

import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";
export type OrgChartInitialValues = {
  emp_name?: string;
  email?: string | null;
  phone?: string | null;
  role?: string | null;
  education?: string | null;
  branch_department?: string; // id as string for UI select
  profileImageUrl?: string;
  address?: string | null;
  city?: string | null;
};

export function OrgChartForm({ initialValues, onRegisterSubmit, isEdit = false, employeeId, onSubmitComplete }: { initialValues?: OrgChartInitialValues; onRegisterSubmit?: (submit: () => void) => void; isEdit?: boolean; employeeId?: string; onSubmitComplete?: (success: boolean) => void; }) {
  // Create adapter functions for async search
  const useAllDepartments = () => {
    const result = useDepartments(undefined, { pageSize: 100 }); // Get more departments
    const branchDeptItems = React.useMemo(() => {
      const departmentsPayload = (result.data as { departments?: { results?: unknown[] } })?.departments;
      const results = Array.isArray(departmentsPayload?.results) ? departmentsPayload.results : (Array.isArray(result.data) ? result.data : (result.data?.departments?.results ?? []));
      const items: { id: string; label: string }[] = [];
      for (const dept of results || []) {
        const deptData = dept as {
          dept_name?: string;
          name?: string;
          branch_departments?: unknown[];
        };
        const deptName = String(deptData.dept_name ?? deptData.name ?? "");
        const branchDepartments = deptData.branch_departments as Array<{
          id: number;
          branch?: { branch_name?: string };
          branch_name?: string;
        }> | undefined;
        if (Array.isArray(branchDepartments)) {
          for (const bd of branchDepartments) {
            const bdId = String(bd.id);
            const branchName = String(bd?.branch?.branch_name ?? bd?.branch_name ?? "");
            items.push({ id: bdId, label: `${deptName} - ${branchName}` });
          }
        }
      }
      return items;
    }, [result.data]);
    
    return {
      data: branchDeptItems,
      isLoading: result.isLoading,
    };
  };

  const useSearchDepartmentsAdapter = (query: string) => {
    const result = useSearchDepartments(query, { pageSize: 100 });
    const branchDeptItems = React.useMemo(() => {
      const departmentsPayload = (result.data as { departments?: { results?: unknown[] } })?.departments;
      const results = Array.isArray(departmentsPayload?.results) ? departmentsPayload.results : (Array.isArray(result.data) ? result.data : (result.data?.departments?.results ?? []));
      console.log('Processed results:', results); // Debug log
      const items: { id: string; label: string }[] = [];
      for (const dept of results || []) {
        const deptData = dept as {
          dept_name?: string;
          name?: string;
          branch_departments?: unknown[];
        };
        const deptName = String(deptData.dept_name ?? deptData.name ?? "");
        const branchDepartments = deptData.branch_departments as Array<{
          id: number;
          branch?: { branch_name?: string };
          branch_name?: string;
        }> | undefined;
        if (Array.isArray(branchDepartments)) {
          for (const bd of branchDepartments) {
            const bdId = String(bd.id);
            const branchName = String(bd?.branch?.branch_name ?? bd?.branch_name ?? "");
            items.push({ id: bdId, label: `${deptName} - ${branchName}` });
          }
        }
      }
      console.log('Final items:', items); // Debug log
      return items;
    }, [result.data]);
    
    return {
      data: branchDeptItems,
      isLoading: result.isLoading,
    };
  };

  // File upload state
  const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
  const [isRemovingPicture, setIsRemovingPicture] = React.useState(false);

  // Single-select department, location, and manager
  const [selectedBranchDeptId, setSelectedBranchDeptId] = React.useState<string | undefined>(initialValues?.branch_department);

  // Rich text content state for education is plain string
  const [educationHtml, setEducationHtml] = React.useState<string | undefined>(initialValues?.education ?? undefined);
 
  // React Query mutation for create
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee(employeeId || "");
  const router = useRouter();

  // Reinitialize if initialValues change
  React.useEffect(() => {
    if (initialValues?.branch_department) {
      setSelectedBranchDeptId(initialValues.branch_department);
    }
    setEducationHtml(initialValues?.education ?? undefined);
    // Clear selected files when initialValues change
    setSelectedFiles([]);
    setIsRemovingPicture(false);
  }, [initialValues?.branch_department, initialValues?.education]);

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
      onSubmitComplete?.(false); // Notify parent that submission failed
      return;
    }

    const payload = {
      emp_name: empName,
      branch_department_id: Number(selectedBranchDeptId),
      email: email || undefined,
      phone: phone || undefined,
      role: role || undefined,
      education: educationHtml || undefined,
      address: address || undefined,
      city: city || undefined,
      // Handle profile picture logic
      profile_picture: selectedFiles[0] || (isRemovingPicture ? null : undefined),
    } as import("@/services/employees").EmployeeCreateRequest;

    try {
      if (isEdit && employeeId) {
        await updateEmployee.mutateAsync(payload);
        toast.success("Employee updated successfully");
      } else {
        await createEmployee.mutateAsync(payload);
        toast.success("Employee created successfully");
      }
      onSubmitComplete?.(true); // Notify parent that submission succeeded
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
      onSubmitComplete?.(false); // Notify parent that submission failed
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
            <Input name="address" defaultValue={initialValues?.address as string} placeholder="Address" className="border-[#E2E8F0]"/>
          </div>
        </div>

        <div className="grid grid-cols-12 items-center gap-4">
          <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">City:</Label>
          <div className="col-span-12 md:col-span-10">
            <Input name="city" defaultValue={initialValues?.city as string} placeholder="City" className="border-[#E2E8F0]"/>
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
              items={[]} // Empty since we're using async hooks
              selectedItems={selectedBranchDeptId ? [selectedBranchDeptId] : []}
              onSelectionChange={(ids) => {
                const last = ids[ids.length - 1];
                setSelectedBranchDeptId(last);
              }}
              searchPlaceholder="Search branch departments..."
              emptyMessage="No branch departments found."
              useAllItems={useAllDepartments}
              useSearch={useSearchDepartmentsAdapter}
              searchDebounce={300}
            />
          </div>
        </div>

         <div className="grid grid-cols-12 items-start gap-4 border-t border-[#E9EAEB] pt-4">
          <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">Profile Picture:</Label>
           <div className="col-span-12 md:col-span-10">
            <Dropzone 
               onFileSelect={(files) => {
                 if (files) {
                   setSelectedFiles(Array.from(files));
                   setIsRemovingPicture(false); // Reset removal flag when new file selected
                 }
               }}
               onClear={() => {
                 setSelectedFiles([]);
                 // If there was an initial image, mark for removal
                 if (initialValues?.profileImageUrl) {
                   setIsRemovingPicture(true);
                 }
               }}
               accept="image/*"
               maxSize={800 * 400}
              initialPreviewUrls={initialValues?.profileImageUrl ? [initialValues.profileImageUrl] : []}
             />
           </div>
         </div>

        <div className="grid grid-cols-12 items-start gap-4">
          <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">Qualification or Education</Label>
          <div className="col-span-12 md:col-span-10">
            <RichTextEditor
              content={educationHtml}
              placeholder="Write Education"
              minHeight="200px"
              maxHeight="400px"
              onChange={(html) => setEducationHtml(html)}
            />
          </div>

        </div>
      </form>
  );
}


