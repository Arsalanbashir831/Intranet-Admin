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
    onItemsChange,
  }: {
    title: string;
    initial: ChecklistItemData[];
    variant?: "task" | "training";
    onItemsChange?: (items: ChecklistItemData[]) => void;
  }) {
    const [items, setItems] = React.useState<ChecklistItemData[]>(initial);
    const [open, setOpen] = React.useState(false);
    const [editItem, setEditItem] = React.useState<ChecklistItemData | null>(null);
  
    // Update items when initial data changes
    React.useEffect(() => {
      setItems(initial);
    }, [initial]);
  
    const handleDelete = (id: string) => {
      const updatedItems = items.filter((i) => i.id !== id);
      setItems(updatedItems);
      onItemsChange?.(updatedItems);
    };

    const handleEdit = (item: ChecklistItemData) => {
      setEditItem(item);
      setOpen(true);
    };

    const handleCreate = ({ title: t, detail, files }: { title: string; detail: string; files?: File[] }) => {
      const id = `${variant}-${Date.now()}`;
      const newItem: ChecklistItemData = {
        id, 
        title: t || "Task Title..", 
        body: detail || "Task body about this task..",
        type: variant,
        files: files
      };
      const updatedItems = [newItem, ...items];
      setItems(updatedItems);
      onItemsChange?.(updatedItems);
      setEditItem(null); // Clear edit state
    };

    const handleUpdate = (id: string, { title: t, detail, files }: { title: string; detail: string; files?: File[] }) => {
      const updatedItems = items.map(item => 
        item.id === id 
          ? { ...item, title: t, body: detail, files: files || item.files }
          : item
      );
      setItems(updatedItems);
      onItemsChange?.(updatedItems);
      setEditItem(null); // Clear edit state
    };

    const handleModalClose = () => {
      setOpen(false);
      setEditItem(null);
    };
  
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
            <ChecklistItem key={it.id} item={it} onDelete={handleDelete} onEdit={handleEdit} />
          ))}
        </div>

        <NewTaskModal 
          type={variant} 
          open={open} 
          setOpen={handleModalClose} 
          onCreate={handleCreate} 
          onUpdate={handleUpdate}
          editItem={editItem ? {
            id: editItem.id,
            title: editItem.title,
            body: editItem.body,
            existingFiles: editItem.existingFiles
          } : null}
        />
      </Card>
    );
  }