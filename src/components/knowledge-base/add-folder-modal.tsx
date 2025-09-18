"use client";

import * as React from "react";
import { AppModal, useAppModalControls } from "@/components/common/app-modal";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SelectableTags, SelectableItem, createSelectableItems } from "@/components/ui/selectable-tags";

type AccessType = "only-you" | "people" | "department";

const users = [
  { id: "1", name: "Sara", username: "sara" },
  { id: "2", name: "John", username: "john" },
  { id: "3", name: "Peter", username: "peter" },
];

const departments = [
  { id: "d1", name: "HR" },
  { id: "d2", name: "Engineering" },
  { id: "d3", name: "Marketing" },
];

export function AddFolderModal({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [folderName, setFolderName] = React.useState("");
  const [access, setAccess] = React.useState<AccessType>("only-you");
  const [selectedPeople, setSelectedPeople] = React.useState<string[]>([]);
  const [selectedDepartments, setSelectedDepartments] = React.useState<string[]>([]);

  const peopleItems: SelectableItem[] = createSelectableItems(users);
  const departmentItems: SelectableItem[] = createSelectableItems(departments);

  const canCreate = folderName.trim().length > 0;

  return (
    <AppModal
      open={open}
      onOpenChange={onOpenChange}
      title="Add New Folder"
      description="Create new Folder"
      icon="/icons/building-2.svg"
      confirmText="Create"
      confirmVariant="default"
      confirmDisabled={!canCreate}
      onConfirm={() => onOpenChange(false)}
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
      </div>
    </AppModal>
  );
}

export function useAddFolderModal() {
  const controls = useAppModalControls(false);
  return controls;
}


