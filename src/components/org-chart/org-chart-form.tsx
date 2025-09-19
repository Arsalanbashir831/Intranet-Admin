"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dropzone } from "@/components/ui/dropzone";
import { SelectableTags, createSelectableItems } from "@/components/ui/selectable-tags";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { useCreateEmployee, useUpdateEmployee } from "@/hooks/queries/use-employees";
import { useDepartments } from "@/hooks/queries/use-departments";
import { useLocations } from "@/hooks/queries/use-locations";
import type { components } from "@/types/api"; 

import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";
export type OrgChartInitialValues = {
  first_name?: string;
  last_name?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  departmentIds?: string[];
  branch?: string;
  profileImageUrl?: string;
  qualificationAndEducation?: string; // HTML content for rich text editor
  job_title?: string;
  emp_role?: string;
  join_date?: string;
};

export function OrgChartForm({ initialValues, onRegisterSubmit, isEdit = false, employeeId }: { initialValues?: OrgChartInitialValues; onRegisterSubmit?: (submit: () => void) => void; isEdit?: boolean; employeeId?: string; }) {
  // Load departments/employees/locations/branches from API
  const { data: deptData } = useDepartments();
  const { data: locationData } = useLocations(); // Fetch location data for branches

  const departments = React.useMemo(() => {
    const list = Array.isArray(deptData) ? deptData : (deptData?.results ?? []);
    return (list as components["schemas"]["Department"][]).map((d) => ({ id: String(d.id), name: d.name }));
  }, [deptData]);

  const locations = React.useMemo(() => {
    const list = Array.isArray(locationData) ? locationData : (locationData?.results ?? []);
    return (list as { id: number | string; name: string }[]).map((l) => ({ id: String(l.id), name: l.name }));
  }, [locationData]);

  // Single-select department, location, and manager
  const [selectedDepartmentId, setSelectedDepartmentId] = React.useState<string | undefined>(initialValues?.departmentIds?.[0]);
  const [selectedLocationId, setSelectedLocationId] = React.useState<string | undefined>(initialValues?.branch);

  // Rich text content state
  const [qualificationHtml, setQualificationHtml] = React.useState<string | undefined>(initialValues?.qualificationAndEducation);

  // React Query mutation for create
  const createEmployee = useCreateEmployee();
  const updateEmployee = useUpdateEmployee(employeeId || "");
  const router = useRouter();

  // Reinitialize if initialValues change
  React.useEffect(() => {
    if (initialValues?.departmentIds?.length) {
      setSelectedDepartmentId(initialValues.departmentIds[0]);
    }
    if (initialValues?.branch) {
      setSelectedLocationId(initialValues.branch);
    }
    setQualificationHtml(initialValues?.qualificationAndEducation);
  }, [initialValues?.departmentIds, initialValues?.branch, initialValues?.qualificationAndEducation]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget as HTMLFormElement;
    const data = new FormData(form);

    const firstName = String(data.get("first_name") || "").trim();
    const lastName = String(data.get("last_name") || "").trim();
    const email = String(data.get("email") || "").trim();
    const password = String(data.get("password") || "").trim();
    const jobTitle = String(data.get("job_title") || "").trim();
    const empRole = String(data.get("emp_role") || "").trim();
    const joinDate = String(data.get("join_date") || "").trim();

    if (!email || (!isEdit && !password) || !firstName) {
      toast.error(!isEdit ? "First name, Email and Password are required" : "First name and Email are required");
      return;
    }

    const payload = {
      email,
      ...(isEdit ? {} : { password: password! }),
      first_name: firstName,
      last_name: lastName,
      phone_number: String(data.get("phone_number") || "") || undefined,
      user_city: String(data.get("user_city") || "") || undefined,
      address: String(data.get("address") || "") || undefined,
      qualification_details: qualificationHtml || undefined,
      job_title: jobTitle || undefined,
      emp_role: empRole || undefined,
      join_date: joinDate || undefined,
      branch: selectedLocationId ? Number(selectedLocationId) : undefined,
    } as components["schemas"]["EmployeeCreateRequest"];

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
          <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">First Name:</Label>
          <div className="col-span-12 md:col-span-10">
            <Input name="first_name" defaultValue={initialValues?.first_name} placeholder="First Name" className="border-[#E2E8F0]"/>
          </div>
        </div>

        <div className="grid grid-cols-12 items-center gap-4">
          <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">Last Name:</Label>
          <div className="col-span-12 md:col-span-10">
            <Input name="last_name" defaultValue={initialValues?.last_name} placeholder="Last Name" className="border-[#E2E8F0]"/>
          </div>
        </div>

        <div className="grid grid-cols-12 items-center gap-4">
          <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">Address:</Label>
          <div className="col-span-12 md:col-span-10">
            <Input name="address" defaultValue={initialValues?.address} placeholder="Address" className="border-[#E2E8F0]"/>
          </div>
        </div>

        <div className="grid grid-cols-12 items-center gap-4">
          <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">City:</Label>
          <div className="col-span-12 md:col-span-10">
            <Input name="user_city" defaultValue={initialValues?.city} placeholder="City" className="border-[#E2E8F0]"/>
          </div>
        </div>

        <div className="grid grid-cols-12 items-center gap-4">
          <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">Phone Number:</Label>
          <div className="col-span-12 md:col-span-10">
            <Input name="phone_number" defaultValue={initialValues?.phone} placeholder="Phone Number" className="border-[#E2E8F0]"/>
          </div>
        </div>

        <div className="grid grid-cols-12 items-center gap-4">
          <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">Email Id:</Label>
          <div className="col-span-12 md:col-span-10">
            <Input name="email" defaultValue={initialValues?.email} placeholder="Email Id" type="email" className="border-[#E2E8F0]"/>
          </div>
        </div>

        <div className="grid grid-cols-12 items-center gap-4">
          <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">Password:</Label>
          <div className="col-span-12 md:col-span-10">
            <Input name="password" placeholder="Password" type="password" className="border-[#E2E8F0]"/>
          </div>
        </div>

        <div className="grid grid-cols-12 items-center gap-4">
          <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">Job Title:</Label>
          <div className="col-span-12 md:col-span-10">
            <Input name="job_title" defaultValue={initialValues?.job_title} placeholder="Job Title" className="border-[#E2E8F0]"/>
          </div>
        </div>

        <div className="grid grid-cols-12 items-center gap-4">
          <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">Role/Position:</Label>
          <div className="col-span-12 md:col-span-10">
            <Input name="emp_role" defaultValue={initialValues?.emp_role} placeholder="Role/Position" className="border-[#E2E8F0]"/>
          </div>
        </div>

        <div className="grid grid-cols-12 items-center gap-4">
          <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">Joining Date:</Label>
          <div className="col-span-12 md:col-span-10">
            <Input name="join_date" defaultValue={initialValues?.join_date} placeholder="YYYY-MM-DD" type="date" className="border-[#E2E8F0]"/>
          </div>
        </div>

        {/* Reporting to removed per request */}

        <div className="grid grid-cols-12 items-center gap-4 border-t border-[#E9EAEB] pt-4">
          <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">Department:</Label>
          <div className="col-span-12 md:col-span-10">
            <SelectableTags
              items={createSelectableItems(departments)}
              selectedItems={selectedDepartmentId ? [selectedDepartmentId] : []}
              onSelectionChange={(ids) => {
                const last = ids[ids.length - 1];
                setSelectedDepartmentId(last);
              }}
              searchPlaceholder="Search departments..."
              emptyMessage="No departments found."
            />
          </div>
        </div>

        <div className="grid grid-cols-12 items-center gap-4">
          <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">Branch/Location:</Label>
          <div className="col-span-12 md:col-span-10">
            <SelectableTags
              items={createSelectableItems(locations)}
              selectedItems={selectedLocationId ? [selectedLocationId] : []}
              onSelectionChange={(ids) => {
                const last = ids[ids.length - 1];
                setSelectedLocationId(last);
              }}
              searchPlaceholder="Search locations..."
              emptyMessage="No locations found."
            />
          </div>
        </div>

         <div className="grid grid-cols-12 items-start gap-4 border-t border-[#E9EAEB] pt-4">
          <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">Profile Picture:</Label>
           <div className="col-span-12 md:col-span-10">
            <Dropzone 
               onFileSelect={(files) => {
                 console.log("Files selected:", files);
                 // Handle file upload logic here
               }}
               accept="image/*"
               maxSize={800 * 400}
              initialPreviewUrls={initialValues?.profileImageUrl ? [initialValues.profileImageUrl] : []}
             />
           </div>
         </div>

        <div className="grid grid-cols-12 items-start gap-4">
          <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">Qualification and Education</Label>
          <div className="col-span-12 md:col-span-10">
            <RichTextEditor
              content={qualificationHtml}
              placeholder="Write Qualification and Education"
              minHeight="200px"
              maxHeight="400px"
              onChange={(html) => setQualificationHtml(html)}
            />
          </div>
        </div>
      </form>
  );
}


