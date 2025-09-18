import { ChecklistItemData } from "./new-hire-plan-form";
import { Card } from "../ui/card";
import { Button } from "../ui/button";
import { Plus } from "lucide-react";
import { ChecklistItem } from "./checklist-item";
import * as React from "react";
import { NewTaskModal } from "./new-task-modal";

export function ChecklistCard({
    title,
    initial,
    variant = "task",
  }: {
    title: string;
    initial: ChecklistItemData[];
    variant?: "task" | "training";
  }) {
    const [items, setItems] = React.useState<ChecklistItemData[]>(initial);
    const [open, setOpen] = React.useState(false);
  
    const handleDelete = (id: string) => setItems((prev) => prev.filter((i) => i.id !== id));
  
    return (
      <Card className="border-[#CFDBE8] p-4 shadow-none border-dashed">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-xs font-semibold text-[#0D141C]">{title}</h3>
          <Button size="icon" className="h-7 w-7 rounded-md bg-[#EA3160] hover:bg-[#d72a56]" onClick={() => setOpen(true)}>
            <Plus className="size-4 text-white" />
          </Button>
        </div>
        <div className="space-y-3">
          {items.map((it) => (
            <ChecklistItem key={it.id} item={it} onDelete={handleDelete} onOpen={() => setOpen(true)} />
          ))}
        </div>

        <NewTaskModal type={variant} open={open} setOpen={setOpen} onCreate={({ title: t }: { title: string }) => {
          const id = Math.random().toString(36).slice(2, 9);
          setItems((prev) => [{ id, title: t || "Task Title..", body: "Task body about this task.." }, ...prev]);
        }} />
      </Card>
    );
  }