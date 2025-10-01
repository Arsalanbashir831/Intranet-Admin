"use client";

import * as React from "react";
import { AppModal } from "@/components/common/app-modal";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dropzone } from "@/components/ui/dropzone";
import { SelectableTags, SelectableItem } from "@/components/ui/selectable-tags";
import { useUploadQueue } from "@/contexts/upload-queue-context";
import { useCreateFile } from "@/hooks/queries/use-knowledge-files";
import { useAllEmployees } from "@/hooks/queries/use-employees";
import { useDepartments } from "@/hooks/queries/use-departments";
import { FileCreateRequest } from "@/services/knowledge-files";
import type { components } from "@/types/api";
import type { Department } from "@/services/departments";

type Employee = components["schemas"]["Employee"];
type AccessType = "only-you" | "people" | "department";

interface AddFileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folderId?: number;
}

export function AddFileModal({ open, onOpenChange, folderId }: AddFileModalProps) {
  const { enqueueFiles } = useUploadQueue();
  const [fileName, setFileName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [access, setAccess] = React.useState<AccessType>("only-you");
  const [selectedPeople, setSelectedPeople] = React.useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = React.useState<string[]>([]);
  const [selected, setSelected] = React.useState<File[]>([]);

  const createFile = useCreateFile();
  const { data: employeesData } = useAllEmployees();
  const { data: departmentsData } = useDepartments();

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

  const handleSelect = (files: FileList | null) => {
    if (!files) return;
    setSelected(Array.from(files));
    // Auto-fill filename from first file if only one file selected
    if (files.length === 1 && !fileName) {
      setFileName(files[0].name.replace(/\.[^/.]+$/, "")); // Remove file extension
    }
  };

  const canCreate = selected.length > 0 && fileName.trim().length > 0 && folderId;

  const handleConfirm = async () => {
    if (!canCreate) return;

    // If using old upload queue system
    if (!folderId) {
      enqueueFiles(selected);
      onOpenChange(false);
      return;
    }

    // Use API for file upload
    try {
      for (const file of selected) {
        const payload: FileCreateRequest = {
          folder: folderId,
          name: selected.length === 1 ? fileName : file.name.replace(/\.[^/.]+$/, ""),
          description: description || undefined,
          file,
          inherits_parent_permissions: access === "only-you",
          permitted_employees: access === "people" ? selectedPeople : [],
          permitted_departments: access === "department" ? selectedDepartments : [],
          permitted_branches: [], // Can be expanded later if needed
        };

        await createFile.mutateAsync(payload);
      }

      // Reset form
      setFileName("");
      setDescription("");
      setAccess("only-you");
      setSelectedPeople([]);
      setSelectedDepartments([]);
      setSelected([]);
      onOpenChange(false);
    } catch (error) {
      // Error is handled by the mutation hook
    }
  };
  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      title="Add New File"
      description="Upload files to this folder"
      icon="/icons/building-2.svg"
      confirmText="Upload"
      confirmDisabled={!canCreate || createFile.isPending}
      onConfirm={handleConfirm}
    >
      <div className="space-y-5 px-6 py-4">
        <div className="flex items-center gap-6">
          <Label className="w-28">File Name:</Label>
          <Input
            placeholder="e.g. Document 1"
            value={fileName}
            onChange={(e) => setFileName(e.target.value)}
            className="max-w-sm border-[#D5D7DA]"
          />
        </div>

        <div className="flex items-center gap-6">
          <Label className="w-28">Description:</Label>
          <Textarea
            placeholder="Optional description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="max-w-sm border-[#D5D7DA]"
            rows={3}
          />
        </div>

        <div className="flex items-start gap-6">
          <Label className="w-28 pt-2">Attachments:</Label>
          <Dropzone 
            className="flex-1" 
            accept="application/pdf, application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
            multiple 
            onFileSelect={handleSelect} 
            showPreview={false} 
          />
        </div>

        {selected.length > 0 && (
          <div className="ml-28 space-y-2">
            {selected.map((f, idx) => (
              <div key={idx} className="flex items-center justify-between rounded border px-3 py-2 text-sm">
                <span className="truncate pr-3">{f.name}</span>
                <button 
                  className="text-muted-foreground hover:text-foreground" 
                  onClick={() => setSelected((prev) => prev.filter((_, i) => i !== idx))}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex flex-col items-start gap-6">
          <Label className="w-28 pt-1">Who can access</Label>
          <div className="flex-1 space-y-3 px-4 w-full">
            <RadioGroup value={access} onValueChange={(v) => setAccess(v as AccessType)} className="space-y-2">
              <div className="flex items-start gap-3 px-4">
                <RadioGroupItem id="file-access-only-you" value="only-you" />
                <div>
                  <Label htmlFor="file-access-only-you" className="text-sm font-medium cursor-pointer">Only you</Label>
                  <div className="text-xs text-muted-foreground">Only you can access this file</div>
                </div>
              </div>
              <div className="flex items-start gap-3 px-4">
                <RadioGroupItem id="file-access-people" value="people" />
                <div>
                  <Label htmlFor="file-access-people" className="text-sm font-medium cursor-pointer">Specific people</Label>
                  <div className="text-xs text-muted-foreground">Choose who to share this file with</div>
                </div>
              </div>
              <div className="flex items-start gap-3 px-4">
                <RadioGroupItem id="file-access-department" value="department" />
                <div>
                  <Label htmlFor="file-access-department" className="text-sm font-medium cursor-pointer">Specific Department</Label>
                  <div className="text-xs text-muted-foreground">Choose who to share this file with</div>
                </div>
              </div>
            </RadioGroup>

            {access === "people" && (
              <SelectableTags
                items={peopleItems}
                selectedItems={selectedPeople}
                onSelectionChange={setSelectedPeople}
                placeholder="Add people"
                className="w-full"
              />
            )}

            {access === "department" && (
              <SelectableTags
                items={departmentItems}
                selectedItems={selectedDepartments}
                onSelectionChange={setSelectedDepartments}
                placeholder="Select departments"
              />
            )}
          </div>
        </div>
      </div>
    </AppModal>
  );
}


