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
import { FolderCreateRequest } from "@/services/knowledge-folders";
import type { components } from "@/types/api";
import type { Department } from "@/services/departments";

type Employee = components["schemas"]["Employee"];

type AccessType = "only-you" | "people" | "department";



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
  const [folderName, setFolderName] = React.useState("");
  const [access, setAccess] = React.useState<AccessType>("only-you");
  const [selectedPeople, setSelectedPeople] = React.useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = React.useState<string[]>([]);

  const createFolder = useCreateFolder();
  const updateFolder = useUpdateFolder();
  const { data: employeesData } = useAllEmployees();
  const { data: departmentsData } = useDepartments();
  const { data: folderData, isLoading: isFolderLoading } = useGetFolder(folderId || 0, isEditMode && !!folderId);

  // Load folder data when in edit mode
  React.useEffect(() => {
    if (isEditMode && folderData?.folder) {
      const folder = folderData.folder;
      setFolderName(folder.name);
      
      // Determine access type based on permissions
      if (folder.permitted_departments && folder.permitted_departments.length > 0) {
        setAccess("department");
        setSelectedDepartments(folder.permitted_departments.map((d: number) => d.toString()));
      } else if (folder.permitted_employees && folder.permitted_employees.length > 0) {
        setAccess("people");
        setSelectedPeople(folder.permitted_employees.map((e: number) => e.toString()));
      } else {
        setAccess("only-you");
      }
    }
  }, [isEditMode, folderData]);

  // Reset form when modal closes
  React.useEffect(() => {
    if (!open) {
      setFolderName("");
      setAccess("only-you");
      setSelectedPeople([]);
      setSelectedDepartments([]);
    }
  }, [open]);

  // Create selectable items from API data
  const peopleItems: SelectableItem[] = React.useMemo(() => {
    if (!employeesData?.results) return [];
    return employeesData.results.map((emp: Employee) => ({
      id: emp.id.toString(),
      label: emp.emp_name,
    }));
  }, [employeesData]);

  const departmentItems: SelectableItem[] = React.useMemo(() => {
    if (!departmentsData?.departments.results) return [];
    return departmentsData.departments.results.map((dept: Department) => ({
      id: dept.id.toString(),
      label: dept.dept_name,
    }));
  }, [departmentsData]);

  const canCreate = folderName.trim().length > 0;

  const handleSubmit = async () => {
    if (!canCreate) return;

    const payload: FolderCreateRequest = {
      name: folderName,
      parent: isEditMode ? (folderData?.folder?.parent || null) : (parentFolderId || null),
      inherits_parent_permissions: true,
      permitted_employees: access === "people" ? selectedPeople : [],
      permitted_departments: access === "department" ? selectedDepartments : [],
      permitted_branches: [], // Can be expanded later if needed
    };

    try {
      if (isEditMode && folderId) {
        await updateFolder.mutateAsync({ id: folderId, data: payload });
      } else {
        await createFolder.mutateAsync(payload);
      }
      
      // Reset form
      setFolderName("");
      setAccess("only-you");
      setSelectedPeople([]);
      setSelectedDepartments([]);
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
                  <div className="flex items-start gap-3 px-4">
                    <RadioGroupItem id="access-only-you" value="only-you" />
                    <div>
                      <Label htmlFor="access-only-you" className="text-sm font-medium cursor-pointer">Only you</Label>
                      <div className="text-xs text-muted-foreground">Only you can access this folder</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 px-4">
                    <RadioGroupItem id="access-people" value="people" />
                    <div>
                      <Label htmlFor="access-people" className="text-sm font-medium cursor-pointer">Specific people</Label>
                      <div className="text-xs text-muted-foreground">Choose who to share this folder with</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 px-4">
                    <RadioGroupItem id="access-department" value="department" />
                    <div>
                      <Label htmlFor="access-department" className="text-sm font-medium cursor-pointer">Specific Department</Label>
                      <div className="text-xs text-muted-foreground">Choose who to share this folder with</div>
                    </div>
                  </div>
             
              </RadioGroup>

              {access === "people" ? (
                <SelectableTags
                  items={peopleItems}
                  selectedItems={selectedPeople}
                  onSelectionChange={setSelectedPeople}
                  placeholder="Add people"
                  className="w-full"
                />
              ) : null}

              {access === "department" ? (
                <SelectableTags
                  items={departmentItems}
                  selectedItems={selectedDepartments}
                  onSelectionChange={setSelectedDepartments}
                  placeholder="Select departments"
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


