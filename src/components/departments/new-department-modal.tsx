"use client";

import { AppModal } from "@/components/common/app-modal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox";
import { ChevronDown } from "lucide-react";
import { useState, useMemo } from "react";
import { useLocations } from "@/hooks/queries/use-locations";
import { useEmployees } from "@/hooks/queries/use-employees";
import { useCreateDepartment } from "@/hooks/queries/use-departments";
import { useCreateBranch } from "@/hooks/queries/use-branches";
import { toast } from "sonner";

interface NewDepartmentModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function NewDepartmentModal({ open, setOpen }: NewDepartmentModalProps) {
  const { data: locationsData, isLoading: locationsLoading } = useLocations();
  const { data: employeesData, isLoading: employeesLoading } = useEmployees();
  const createDepartment = useCreateDepartment();
  const createBranch = useCreateBranch();

  // Transform API data
  const branches = useMemo(() => {
    const list = Array.isArray(locationsData) ? locationsData : (locationsData?.results ?? []);
    return list.map((l: { id: number | string; name?: string }) => ({
      id: String(l.id),
      label: l.name || `Location ${l.id}`,
    }));
  }, [locationsData]);

  const managers = useMemo(() => {
    const list = Array.isArray(employeesData) ? employeesData : employeesData?.results;
    if (!list) return [] as { value: string; label: string; username: string; avatar?: string }[];
    type ManagerLite = {
      id: number | string;
      full_name?: string;
      name?: string;
      username?: string;
      email?: string;
      profile_picture?: string;
      profile_picture_url?: string;
    };
    return (list as ManagerLite[]).map((emp) => ({
      value: String(emp.id),
      label: emp.name || emp.full_name || "",
      username: emp.username || (emp.email ? emp.email.split('@')[0] : "user"),
      avatar: emp.profile_picture_url || emp.profile_picture,
    }));
  }, [employeesData]);

  const [departmentName, setDepartmentName] = useState("");
  const [branchManagers, setBranchManagers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleManagerChange = (branchId: string, manager: string) => {
    setBranchManagers((prev) => ({ ...prev, [branchId]: manager }));
  };

  const handleSubmit = async () => {
    if (!departmentName.trim()) return;

    setIsSubmitting(true);
    try {
      // Step 1: Create department (only name)
      const dept = await createDepartment.mutateAsync({ name: departmentName });

      const deptId = (dept as { id?: number | string })?.id ?? undefined;
      if (!deptId) {
        toast.error("Department created but no ID returned.");
      }

      // Step 2: For each location with a selected manager, create a branch
      const entries = Object.entries(branchManagers).filter(([, managerId]) => !!managerId);

      if (deptId && entries.length > 0) {
        const results = await Promise.allSettled(
          entries.map(([locationId, managerId]) =>
            createBranch.mutateAsync({
              department: Number(deptId),
              location: Number(locationId),
              manager: Number(managerId),
            })
          )
        );

        const createdCount = results.filter((r) => r.status === "fulfilled").length;
        const failedCount = results.filter((r) => r.status === "rejected").length;
        const skippedCount = Object.keys(branchManagers).length - entries.length;

        if (createdCount > 0) {
          toast.success(`Department and ${createdCount} branch${createdCount > 1 ? "es" : ""} created.`);
        } else {
          toast.success("Department created.");
        }
        if (failedCount > 0) {
          toast.error(`${failedCount} branch creation${failedCount > 1 ? "s" : ""} failed.`);
        }
        if (skippedCount > 0) {
          toast.message(`${skippedCount} location${skippedCount > 1 ? "s were" : " was"} skipped (no manager selected).`);
        }
      } else {
        // No branches to create
        toast.success("Department created.");
        const total = Object.keys(branchManagers).length;
        const skippedCount = total; // all skipped if none with manager
        if (skippedCount > 0) {
          toast.message(`${skippedCount} location${skippedCount > 1 ? "s were" : " was"} skipped (no manager selected).`);
        }
      }

      setOpen(false);
      setDepartmentName("");
      setBranchManagers({});
    } catch (error) {
      console.error("Error creating department or branches:", error);
      toast.error("Failed to create department. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppModal
      open={open}
      onOpenChange={setOpen}
      title="Add New Department"
      description="Create new Department"
      onConfirm={handleSubmit}
      confirmText={isSubmitting ? "Creating..." : "Create"}
      confirmDisabled={isSubmitting || !departmentName.trim()}
      onCancel={() => setOpen(false)}
      icon='/icons/user-hierarchy.svg'
    >
      <div className="space-y-4 px-6">
        <div className="flex justify-between items-start gap-8">
          <Label htmlFor="dept-name">Department:</Label>
          <Input
            id="dept-name"
            value={departmentName}
            onChange={(e) => setDepartmentName(e.target.value)}
            placeholder="Enter department name"
            className="border-[#D5D7DA] max-w-[400px]"
            disabled={isSubmitting}
          />
        </div>

        <div className="rounded-md border border-[#E4E4E4]">
          <div className="grid grid-cols-[1fr_1fr] gap-0 border-b border-[#E4E4E4] px-3 py-2 text-sm text-muted-foreground">
            <span>Branch</span>
            <span>Manager</span>
          </div>
          <div className="divide-y divide-[#E4E4E4]">
            {locationsLoading || employeesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">Loading data...</div>
              </div>
            ) : (
              branches.map((branch) => (
                <div
                  key={branch.id}
                  className="grid grid-cols-[1fr_1fr] items-center px-3 py-2"
                >
                  <div className="text-sm text-[#667085]">{branch.label}</div>
                  <div>
                    <Combobox
                      data={managers as unknown as { value: string; label: string; username: string; avatar: string }[]}
                      type="Manager"
                      value={branchManagers[branch.id] ?? ""}
                      onValueChange={(v) => handleManagerChange(branch.id, v)}
                    >
                      <ComboboxTrigger className="w-full justify-between border-none shadow-none pl-0 hover:bg-transparent">
                        <span className="flex w-full items-center justify-between gap-2">
                          {branchManagers[branch.id] ? (
                            <span className="flex items-center gap-2 truncate">
                              {(() => {
                                const sel = managers.find(
                                  (m) => m.value === branchManagers[branch.id]
                                );
                                if (!sel) return null;
                                const initials = sel.label
                                  .split(" ")
                                  .map((n: string) => n[0])
                                  .join("");
                                return (
                                  <>
                                    <Avatar className="size-8">
                                      <AvatarImage src={sel.avatar} alt={sel.label} />
                                      <AvatarFallback className="text-[10px]">
                                        {initials}
                                      </AvatarFallback>
                                    </Avatar>
                                    <span className="truncate text-left">
                                      <span className="block text-sm leading-4">
                                        {sel.label}
                                      </span>
                                      <span className="block text-xs text-muted-foreground leading-4">
                                        @{sel.username}
                                      </span>
                                    </span>
                                  </>
                                );
                              })()}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">Select Manager...</span>
                          )}
                          <ChevronDown className="shrink-0 text-muted-foreground" size={16} />
                        </span>
                      </ComboboxTrigger>
                      <ComboboxContent>
                        <ComboboxInput />
                        <ComboboxEmpty />
                        <ComboboxList>
                          <ComboboxGroup>
                            {managers.map((m) => (
                              <ComboboxItem key={m.value} value={m.value}>
                                <div className="flex items-center gap-2">
                                  <Avatar className="size-8">
                                    <AvatarImage src={m.avatar} alt={m.label} />
                                    <AvatarFallback className="text-[10px]">
                                      {m.label
                                        .split(" ")
                                        .map((n: string) => n[0])
                                        .join("")}
                                    </AvatarFallback>
                                  </Avatar>
                                  <div className="leading-tight">
                                    <div className="text-sm">{m.label}</div>
                                    <div className="text-xs text-muted-foreground">@{m.username}</div>
                                  </div>
                                </div>
                              </ComboboxItem>
                            ))}
                          </ComboboxGroup>
                        </ComboboxList>
                      </ComboboxContent>
                    </Combobox>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AppModal>
  )
}