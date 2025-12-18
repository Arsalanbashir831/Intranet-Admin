"use client";

import * as React from "react";
import { AppModal, useAppModalControls } from "@/components/common/app-modal";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  SelectableTags,
  SelectableItem,
} from "@/components/ui/selectable-tags";
import {
  useCreateFolder,
  useUpdateFolder,
  useGetFolder,
} from "@/hooks/queries/use-knowledge-folders";
import { useDepartments } from "@/hooks/queries/use-departments";
import { useAllBranches } from "@/hooks/queries/use-branches";
import { useManagerScope } from "@/contexts/manager-scope-context";
import type { FolderCreateRequest } from "@/types/knowledge";
import { AddFolderModalProps, AccessType } from "@/types/knowledge-base";
import { createCustomSelectableItems } from "@/components/ui/selectable-tags";
import type { KnowledgeFolder } from "@/types/knowledge";

export function AddFolderModal({
  open,
  onOpenChange,
  parentFolderId,
  folderId,
  onComplete,
  isEditMode = false,
  showAccessOptions = true,
}: AddFolderModalProps) {
  // Get manager scope to filter options
  const { isManager } = useManagerScope();

  const [folderName, setFolderName] = React.useState("");
  // Default to "department" for managers, "all-employees" for admins
  const [access, setAccess] = React.useState<AccessType>(
    isManager ? "department" : "all-employees"
  );
  const [selectedBranches, setSelectedBranches] = React.useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = React.useState<
    string[]
  >([]);

  const createFolder = useCreateFolder();
  const updateFolder = useUpdateFolder();
  const { data: departmentsData } = useDepartments(undefined, {
    pageSize: 1000,
  });
  const { data: branchesData } = useAllBranches();
  const { data: folderData, isLoading: isFolderLoading } = useGetFolder(
    folderId || 0,
    isEditMode && !!folderId
  );

  // Load folder data when in edit mode
  React.useEffect(() => {
    if (isEditMode && folderData?.folder) {
      const folder = folderData.folder as KnowledgeFolder & {
        permitted_branches?: number[];
        permitted_departments?: number[];
      };
      setFolderName(folder.name);

      // Determine access type based on permissions
      if (folder.permitted_branches && folder.permitted_branches.length > 0) {
        setAccess("branch");
        setSelectedBranches(
          folder.permitted_branches.map((b: number) => b.toString())
        );
      } else if (
        folder.permitted_departments &&
        folder.permitted_departments.length > 0
      ) {
        setAccess("department");
        setSelectedDepartments(
          folder.permitted_departments.map((d: number) => d.toString())
        );
      } else {
        setAccess(isManager ? "department" : "all-employees");
      }
    }
  }, [isEditMode, folderData, isManager]);

  // Reset form when modal closes
  React.useEffect(() => {
    if (!open) {
      setFolderName("");
      setAccess(isManager ? "department" : "all-employees");
      setSelectedBranches([]);
      setSelectedDepartments([]);
    }
  }, [open, isManager]);

  // Create selectable items from API data - branches
  const branchItems: SelectableItem[] = React.useMemo(() => {
    if (!branchesData) return [];
    const list = Array.isArray(branchesData)
      ? branchesData
      : (branchesData as { branches?: { results?: unknown[] } })?.branches
          ?.results || [];
    return createCustomSelectableItems(
      list as Array<{ id: unknown; branch_name: unknown }>,
      "id",
      "branch_name"
    );
  }, [branchesData]);

  // Create selectable items from API data - departments
  const departmentItems: SelectableItem[] = React.useMemo(() => {
    if (!departmentsData) return [];
    const list = Array.isArray(departmentsData)
      ? departmentsData
      : (departmentsData as { departments?: { results?: unknown[] } })
          ?.departments?.results || [];
    return createCustomSelectableItems(
      list as Array<{ id: unknown; dept_name: unknown }>,
      "id",
      "dept_name"
    );
  }, [departmentsData]);

  const canCreate = folderName.trim().length > 0;

  const handleSubmit = async () => {
    if (!canCreate) return;

    const payload = {
      name: folderName,
      parent: isEditMode
        ? folderData?.folder?.parent || null
        : parentFolderId || null,
      inherits_parent_permissions: true,
      permitted_branches:
        access === "branch" ? selectedBranches.map(Number) : [],
      permitted_departments:
        access === "department" ? selectedDepartments.map(Number) : [],
      permitted_branch_departments: [] as number[],
      permitted_employees: [] as number[],
    } satisfies FolderCreateRequest;

    try {
      if (isEditMode && folderId) {
        await updateFolder.mutateAsync({ id: folderId, data: payload });
      } else {
        await createFolder.mutateAsync(payload);
      }

      // Reset form
      setFolderName("");
      setAccess(isManager ? "department" : "all-employees");
      setSelectedBranches([]);
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
      confirmDisabled={
        !canCreate ||
        createFolder.isPending ||
        updateFolder.isPending ||
        isFolderLoading
      }
      onConfirm={handleSubmit}>
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
              <RadioGroup
                value={access}
                onValueChange={(v: AccessType) => setAccess(v)}
                className="space-y-2">
                {/* Only show "All employees" option for admins */}
                {!isManager && (
                  <div className="flex items-start gap-3 px-4">
                    <RadioGroupItem
                      id="access-all-employees"
                      value="all-employees"
                    />
                    <div>
                      <Label
                        htmlFor="access-all-employees"
                        className="text-sm font-medium cursor-pointer">
                        All employees
                      </Label>
                      <div className="text-xs text-muted-foreground">
                        All employees can access this folder
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3 px-4">
                  <RadioGroupItem id="access-branch" value="branch" />
                  <div>
                    <Label
                      htmlFor="access-branch"
                      className="text-sm font-medium cursor-pointer">
                      Branch
                    </Label>
                    <div className="text-xs text-muted-foreground">
                      Choose branches to share this folder with
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-3 px-4">
                  <RadioGroupItem id="access-department" value="department" />
                  <div>
                    <Label
                      htmlFor="access-department"
                      className="text-sm font-medium cursor-pointer">
                      Department
                    </Label>
                    <div className="text-xs text-muted-foreground">
                      Choose departments to share this folder with
                    </div>
                  </div>
                </div>
              </RadioGroup>

              {access === "branch" ? (
                <SelectableTags
                  items={branchItems}
                  selectedItems={selectedBranches}
                  onSelectionChange={setSelectedBranches}
                  placeholder="Select branches"
                  className="w-full"
                />
              ) : null}

              {access === "department" ? (
                <SelectableTags
                  items={departmentItems}
                  selectedItems={selectedDepartments}
                  onSelectionChange={setSelectedDepartments}
                  placeholder="Select departments"
                  className="w-full"
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
