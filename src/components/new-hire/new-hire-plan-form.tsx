"use client";

import * as React from "react";
import { SelectableTags, type SelectableItem } from "@/components/ui/selectable-tags";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChecklistCard } from "./checklist-card";
import { Card } from "../ui/card";
import { useEmployees } from "@/hooks/queries/use-employees";

export type ChecklistItemData = { id: string; title: string; body: string };

type ApiEmployee = {
  id: number;
  full_name: string;
  username?: string;
  department_name?: string;
  profile_picture_url?: string;
};

export function NewHirePlanForm() {
  const [assignees, setAssignees] = React.useState<string[]>([]);
  const { data, isLoading } = useEmployees();
  const employees: ApiEmployee[] = React.useMemo(() => {
    // Support both paginated and array responses
    const list = Array.isArray(data) ? data : (data?.results ?? []);
    return (list as any[]).map((e) => ({
      id: e.id,
      full_name: e.full_name ?? e.name ?? "",
      username: e.username,
      department_name: e.department_name ?? e.department,
      profile_picture_url: e.profile_picture_url ?? e.profile_picture,
    }));
  }, [data]);
  const selectableItems: SelectableItem[] = React.useMemo(
    () => employees.map((u) => ({ id: String(u.id), label: u.full_name })),
    [employees]
  );

  const left: ChecklistItemData[] = [
    { id: "1", title: "Task Title..", body: "Task body about this task.." },
    { id: "2", title: "Task Title..", body: "Task body about this task.." },
    { id: "3", title: "Task Title..", body: "Task body about this task.." },
    { id: "4", title: "Task Title..", body: "Task body about this task.." },
    { id: "5", title: "Task Title..", body: "Task body about this task.." },
  ];

  const right: ChecklistItemData[] = [
    { id: "1", title: "Training Title..", body: "Training body about this task.." },
    { id: "2", title: "Training Title..", body: "Training body about this task.." },
    { id: "3", title: "Training Title..", body: "Training body about this task.." },
    { id: "4", title: "Training Title..", body: "Training body about this task.." },
    { id: "5", title: "Training Title..", body: "Training body about this task.." },
  ];

  return (
    <Card className="space-y-4 border-[#FFF6F6] shadow-none px-5">
      <div >
        <h3 className="text-xl font-semibold text-foreground">Recent New Hire Plans</h3>
        <div className="mt-3">
          <SelectableTags
            items={selectableItems}
            selectedItems={assignees}
            onSelectionChange={setAssignees}
            placeholder="Assigned to"
            searchPlaceholder="Search people..."
            emptyMessage="No people found."
            renderSelected={(id) => {
              const u = employees.find((x) => String(x.id) === id);
              if (!u) return null;
              const initials = (u.full_name || "")
                .split(" ")
                .map((n) => n[0])
                .join("");
              return (
                <div className="flex items-center gap-2">
                  <Avatar className="size-6">
                    <AvatarImage src={u.profile_picture_url} alt={u.full_name} />
                    <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="leading-tight text-left">
                    <div className="text-xs text-[#2E2E2E]">{u.full_name}</div>
                    <div className="text-[10px] text-muted-foreground">{u.department_name ?? "—"}</div>
                  </div>
                </div>
              );
            }}
          />

        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-2">
        <ChecklistCard title="Tasks Checklist" initial={left} variant="task" />
        <ChecklistCard title="Training Checklist" initial={right} variant="training" />
      </div>
    </Card>
  );
}


