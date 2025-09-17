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
import { useState } from "react";

interface NewDepartmentModalProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function NewDepartmentModal({ open, setOpen }: NewDepartmentModalProps) {

    // Dummy branches and managers
  const branches = [
    "Orange",
    "Toledo",
    "Naperville",
    "Toledo",
    "Austin",
    "Pembroke Pines",
  ];

  const managers = [
    {
      value: "esther-howard",
      label: "Esther Howard",
      username: "esther",
      avatar:
        "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&auto=format&fit=crop&q=60",
    },
    {
      value: "devon-lane",
      label: "Devon Lane",
      username: "devon",
      avatar:
        "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=200&auto=format&fit=crop&q=60",
    },
    {
      value: "jenny-wilson",
      label: "Jenny Wilson",
      username: "jenny",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=60",
    },
    {
      value: "guy-hawkins",
      label: "Guy Hawkins",
      username: "guy",
      avatar:
        "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&auto=format&fit=crop&q=60",
    },
    {
      value: "ronald-richards",
      label: "Ronald Richards",
      username: "ronald",
      avatar:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&auto=format&fit=crop&q=60",
    },
    {
      value: "jerome-bell",
      label: "Jerome Bell",
      username: "jerome",
      avatar:
        "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=60",
    },
  ] as const;

  const [departmentName, setDepartmentName] = useState("");
  const [branchManagers, setBranchManagers] = useState<Record<string, string>>(
    {}
  );

  const handleManagerChange = (branch: string, manager: string) => {
    setBranchManagers((prev) => ({ ...prev, [branch]: manager }));
  };
  
    return (
        <AppModal
        open={open}
        onOpenChange={setOpen}
        title="Add New Department"
        description="Create new Department"
        onConfirm={() => setOpen(false)}
        onCancel={() => setOpen(false)}
        confirmText="Create"
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
            />
          </div>

          <div className="rounded-md border border-[#E4E4E4]">
            <div className="grid grid-cols-[1fr_1fr] gap-0 border-b border-[#E4E4E4] px-3 py-2 text-sm text-muted-foreground">
              <span>Branch</span>
              <span>Manager</span>
            </div>
            <div className="divide-y divide-[#E4E4E4]">
              {branches.map((branch, idx) => (
                <div
                  key={`${branch}-${idx}`}
                  className="grid grid-cols-[1fr_1fr] items-center px-3 py-2"
                >
                  <div className="text-sm text-[#667085]">{branch}</div>
                  <div>
                    <Combobox
                      data={managers as any}
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
                                  .map((n) => n[0])
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
                                        .map((n) => n[0])
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
              ))}
            </div>
          </div>
        </div>
      </AppModal>
    )
}