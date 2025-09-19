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
import { useBranches } from "@/hooks/queries/use-branches";
import { useEmployees } from "@/hooks/queries/use-employees";
import { useCreateDepartment } from "@/hooks/queries/use-departments";

interface NewDepartmentModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function NewDepartmentModal({ open, setOpen }: NewDepartmentModalProps) {
  const { data: branchesData, isLoading: branchesLoading } = useBranches();
  const { data: employeesData, isLoading: employeesLoading } = useEmployees();
  const createDepartment = useCreateDepartment();

  // Transform API data
  const branches = useMemo(() => {
    if (!branchesData?.results) return [];
    return branchesData.results.map((branch: any) => branch.name || branch.branch_name);
  }, [branchesData]);

  const managers = useMemo(() => {
    if (!employeesData?.results) return [];
    return employeesData.results.map((emp: any) => ({
      value: emp.id.toString(),
      label: emp.name || emp.full_name,
      username: emp.username || emp.email?.split('@')[0] || 'user',
      avatar: emp.avatar || emp.profile_image,
    }));
  }, [employeesData]);

  const [departmentName, setDepartmentName] = useState("");
  const [branchManagers, setBranchManagers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleManagerChange = (branch: string, manager: string) => {
    setBranchManagers((prev) => ({ ...prev, [branch]: manager }));
  };

  const handleSubmit = async () => {
    if (!departmentName.trim()) return;

    setIsSubmitting(true);
    try {
      // Create department with branch managers
      await createDepartment.mutateAsync({
        name: departmentName,
        branch_managers: Object.entries(branchManagers).map(([branch, managerId]) => ({
          branch: branch,
          manager: parseInt(managerId)
        }))
      });

      setOpen(false);
      setDepartmentName("");
      setBranchManagers({});
    } catch (error) {
      console.error("Error creating department:", error);
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
            {branchesLoading || employeesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">Loading data...</div>
              </div>
            ) : (
              branches.map((branch, idx) => (
                <div
                  key={`${branch}-${idx}`}
                  className="grid grid-cols-[1fr_1fr] items-center px-3 py-2"
                >
                  <div className="text-sm text-[#667085]">{branch}</div>
                  <div>
                    <Combobox
                      data={managers as unknown as { value: string; label: string; username: string; avatar: string }[]}
                      type="Manager"
                      value={branchManagers[branch] ?? ""}
                      onValueChange={(v) => handleManagerChange(branch, v)}
                    >
                      <ComboboxTrigger className="w-full justify-between border-none shadow-none pl-0 hover:bg-transparent">
                        <span className="flex w-full items-center justify-between gap-2">
                          {branchManagers[branch] ? (
                            <span className="flex items-center gap-2 truncate">
                              {(() => {
                                const sel = managers.find(
                                  (m) => m.value === branchManagers[branch]
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