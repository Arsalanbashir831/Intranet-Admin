"use client";

import * as React from "react";
import { SelectableTags, type SelectableItem } from "@/components/ui/selectable-tags";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChecklistCard } from "./checklist-card";
import { Card } from "../ui/card";

export type ChecklistItemData = { id: string; title: string; body: string };

type User = { id: string; name: string; username: string; department: string; avatar?: string };
const users: User[] = [
  { id: "albert-flores", name: "Albert Flores", username: "albert", department: "HR", avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=200&auto=format&fit=crop&q=60" },
  { id: "jenny-wilson", name: "Jenny Wilson", username: "jenny", department: "Finance", avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=60" },
  { id: "devon-lane", name: "Devon Lane", username: "devon", department: "IT", avatar: "https://images.unsplash.com/photo-1502685104226-ee32379fefbe?w=200&auto=format&fit=crop&q=60" },
];

export function NewHirePlanForm() {
  const [assignees, setAssignees] = React.useState<string[]>([]);
  const selectableItems: SelectableItem[] = users.map((u) => ({ id: u.id, label: u.name }));

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
              const u = users.find((x) => x.id === id);
              if (!u) return null;
              const initials = u.name
                .split(" ")
                .map((n) => n[0])
                .join("");
              return (
                <div className="flex items-center gap-2">
                  <Avatar className="size-6">
                    <AvatarImage src={u.avatar} alt={u.name} />
                    <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                  </Avatar>
                  <div className="leading-tight text-left">
                    <div className="text-xs text-[#2E2E2E]">{u.name}</div>
                    <div className="text-[10px] text-muted-foreground">{u.department}</div>
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


