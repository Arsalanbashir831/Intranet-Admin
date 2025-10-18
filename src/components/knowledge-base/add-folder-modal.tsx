"use client";

import * as React from "react";
import { AppModal, useAppModalControls } from "@/components/common/app-modal";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SelectableTags, SelectableItem } from "@/components/ui/selectable-tags";
import { useCreateFolder, useUpdateFolder, useGetFolder } from "@/hooks/queries/use-knowledge-folders";
import { useAllEmployees } from "@/hooks/queries/use-employees";
import { useDepartments } from "@/hooks/queries/use-departments";
import { useManagerScope } from "@/contexts/manager-scope-context";
import { FolderCreateRequest } from "@/services/knowledge-folders";
import type { components } from "@/types/api";
import type { Department } from "@/services/departments";

type Employee = components["schemas"]["Employee"];

type AccessType = "all-employees" | "people" | "branch-department";



export function AddFolderModal({ 
  open, 
  onOpenChange, 
  parentFolderId, 
  folderId, 
  onComplete, 
  isEditMode = false,
  showAccessOptions = true
}: { 
  open: boolean; 
  onOpenChange: (o: boolean) => void; 
  parentFolderId?: number; 
  folderId?: number; 
  onComplete?: () => void; 
  isEditMode?: boolean; 
  showAccessOptions?: boolean;
}) {
  // Get manager scope to filter options
  const { isManager, managedDepartments } = useManagerScope();
  
  const [folderName, setFolderName] = React.useState("");
  // Default to "branch-department" for managers, "all-employees" for admins
  const [access, setAccess] = React.useState<AccessType>(isManager ? "branch-department" : "all-employees");
  const [selectedPeople, setSelectedPeople] = React.useState<string[]>([]);
  const [selectedBranchDepartments, setSelectedBranchDepartments] = React.useState<string[]>([]);

  const createFolder = useCreateFolder();
  const updateFolder = useUpdateFolder();
  const { data: employeesData } = useAllEmployees();
  const { data: departmentsData } = useDepartments();
  const { data: folderData, isLoading: isFolderLoading } = useGetFolder(folderId || 0, isEditMode && !!folderId);

  // Load folder data when in edit mode
  React.useEffect(() => {
    if (isEditMode && folderData?.folder) {
      const folder = folderData.folder as components["schemas"]["KnowledgeFolder"] & {
        permitted_branch_departments?: number[];
      };
      setFolderName(folder.name);
      
      // Determine access type based on permissions
      // Check for permitted_branch_departments first (new field)
      if (folder.permitted_branch_departments && folder.permitted_branch_departments.length > 0) {
        setAccess("branch-department");
        setSelectedBranchDepartments(folder.permitted_branch_departments.map((d: number) => d.toString()));
      } else if (folder.permitted_departments && folder.permitted_departments.length > 0) {
        setAccess("branch-department");
        setSelectedBranchDepartments(folder.permitted_departments.map((d: number) => d.toString()));
      } else if (folder.permitted_employees && folder.permitted_employees.length > 0) {
        setAccess("people");
        setSelectedPeople(folder.permitted_employees.map((e: number) => e.toString()));
      } else {
        setAccess(isManager ? "branch-department" : "all-employees");
      }
    }
  }, [isEditMode, folderData, isManager]);

  // Reset form when modal closes
  React.useEffect(() => {
    if (!open) {
      setFolderName("");
      setAccess(isManager ? "branch-department" : "all-employees");
      setSelectedPeople([]);
      setSelectedBranchDepartments([]);
    }
  }, [open, isManager]);

  // Create selectable items from API data - filtered by manager scope
  const peopleItems: SelectableItem[] = React.useMemo(() => {
    if (!employeesData?.results) return [];
    
    // Filter employees: if manager, only show employees from their managed departments
    const filteredEmployees = isManager
      ? employeesData.results.filter((emp: Employee) => {
          // Check if employee belongs to any of manager's departments
          return managedDepartments.includes(emp.branch_department);
        })
      : employeesData.results;
    
    return filteredEmployees.map((emp: Employee) => ({
      id: emp.id.toString(),
      label: emp.emp_name,
    }));
  }, [employeesData, isManager, managedDepartments]);

  // Branch Department items - filtered by manager scope
  const branchDepartmentItems: SelectableItem[] = React.useMemo(() => {
    if (!departmentsData || !Array.isArray(departmentsData)) return [];
    
    const items: SelectableItem[] = [];
    departmentsData.forEach((dept: Department) => {
      if (dept.branch_departments) {
        dept.branch_departments.forEach((bd) => {
          // Filter: if manager, only show their managed branch departments
          if (isManager && !managedDepartments.includes(bd.id)) {
            return; // Skip this branch department
          }
          
          const branchName = bd.branch?.branch_name || 'Unknown Branch';
          items.push({
            id: bd.id.toString(),
            label: `${dept.dept_name} - ${branchName}`,
          });
        });
      }
    });
    
    return items;
  }, [departmentsData, isManager, managedDepartments]);

  const canCreate = folderName.trim().length > 0;

  const handleSubmit = async () => {
    if (!canCreate) return;

    const payload = {
      name: folderName,
      parent: isEditMode ? (folderData?.folder?.parent || null) : (parentFolderId || null),
      inherits_parent_permissions: true,
      permitted_employees: access === "people" ? selectedPeople.map(Number) : [],
      permitted_branch_departments: access === "branch-department" ? selectedBranchDepartments.map(Number) : [],
      permitted_departments: [] as number[],
      permitted_branches: [] as number[],
    } satisfies FolderCreateRequest;

    try {
      if (isEditMode && folderId) {
        await updateFolder.mutateAsync({ id: folderId, data: payload });
      } else {
        await createFolder.mutateAsync(payload);
      }
      
      // Reset form
      setFolderName("");
      setAccess(isManager ? "branch-department" : "all-employees");
      setSelectedPeople([]);
      setSelectedBranchDepartments([]);
      onOpenChange(false);
      
      // Call completion callback if provided
      if (onComplete) {
        onComplete();
      }
    } catch {
      // Error is handled by the mutation hook
    }
  };

  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      title={isEditMode ? "Edit Folder" : "Add New Folder"}
      description={isEditMode ? "Update folder details" : "Create new Folder"}
      icon="/icons/building-2.svg"
      confirmText={isEditMode ? "Update" : "Create"}
      confirmVariant="default"
      confirmDisabled={!canCreate || createFolder.isPending || updateFolder.isPending || isFolderLoading}
      onConfirm={handleSubmit}
    >
      <div className="px-6 py-4 space-y-5">
        <div className="flex items-center gap-6">
          <Label className="w-28">Folder Name:</Label>
          <Input
            placeholder="e.g. Folder 1"
            value={folderName}
            onChange={(e) => setFolderName(e.target.value)}
            className="max-w-sm border-[#D5D7DA]"
          />
        </div>

        {showAccessOptions && (
          <div className="flex flex-col items-start gap-6">
            <Label className="w-28 pt-1">Who can access</Label>
            <div className="flex-1 space-y-3 px-4 w-full">
              <RadioGroup value={access} onValueChange={(v) => setAccess(v as AccessType)} className="space-y-2">
                  {/* Only show "All employees" option for admins */}
                  {!isManager && (
                    <div className="flex items-start gap-3 px-4">
                      <RadioGroupItem id="access-all-employees" value="all-employees" />
                      <div>
                        <Label htmlFor="access-all-employees" className="text-sm font-medium cursor-pointer">All employees</Label>
                        <div className="text-xs text-muted-foreground">All employees can access this folder</div>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start gap-3 px-4">
                    <RadioGroupItem id="access-people" value="people" />
                    <div>
                      <Label htmlFor="access-people" className="text-sm font-medium cursor-pointer">Specific people</Label>
                      <div className="text-xs text-muted-foreground">
                        {isManager ? "Choose people from your departments" : "Choose who to share this folder with"}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 px-4">
                    <RadioGroupItem id="access-branch-department" value="branch-department" />
                    <div>
                      <Label htmlFor="access-branch-department" className="text-sm font-medium cursor-pointer">
                        {isManager ? "Branch Department (Your departments only)" : "Branch Department"}
                      </Label>
                      <div className="text-xs text-muted-foreground">
                        {isManager 
                          ? "Share with your managed branch departments" 
                          : "Choose branch departments to share this folder with"
                        }
                      </div>
                    </div>
                  </div>
             
              </RadioGroup>

              {access === "people" ? (
                <SelectableTags
                  items={peopleItems}
                  selectedItems={selectedPeople}
                  onSelectionChange={setSelectedPeople}
                  placeholder={isManager ? "Add people from your departments" : "Add people"}
                  className="w-full"
                />
              ) : null}

              {access === "branch-department" ? (
                <SelectableTags
                  items={branchDepartmentItems}
                  selectedItems={selectedBranchDepartments}
                  onSelectionChange={setSelectedBranchDepartments}
                  placeholder={isManager ? "Select your branch departments" : "Select branch departments"}
                />
              ) : null}
            </div>
          </div>
        )}
      </div>
    </AppModal>
  );
}

export function useAddFolderModal() {
  const controls = useAppModalControls(false);
  return controls;
}


