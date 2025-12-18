import { ChecklistItemData, ChecklistCardProps } from "@/types/new-hire";
import { prepareEditItemForModal } from "@/handlers/new-hire-handlers";
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
}: ChecklistCardProps) {
  const [items, setItems] = React.useState<ChecklistItemData[]>(initial);
  const [open, setOpen] = React.useState(false);
  const [editItem, setEditItem] = React.useState<ChecklistItemData | null>(
    null
  );
  const [blobUrls, setBlobUrls] = React.useState<string[]>([]); // Track blob URLs for cleanup

  // Create a stable reference for initial data
  const stableInitial = React.useMemo(
    () => initial,
    [initial.length, initial.map((i) => i.id).join(",")]
  );

  // Update items when initial data changes
  React.useEffect(() => {
    setItems(stableInitial);
  }, [stableInitial]);

  // Clean up blob URLs when component unmounts
  React.useEffect(() => {
    return () => {
      blobUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [blobUrls]);

  const handleDelete = (id: string) => {
    const updatedItems = items.filter((i) => i.id !== id);
    setItems(updatedItems);
    onItemsChange?.(updatedItems);
  };

  const handleEdit = (item: ChecklistItemData) => {
    setEditItem(item);
    setOpen(true);
  };

  const handleCreate = ({
    title: t,
    detail,
    deadline,
    files,
  }: {
    title: string;
    detail: string;
    deadline?: string;
    files?: File[];
  }) => {
    const id = `${variant}-${Date.now()}`;
    const newItem: ChecklistItemData = {
      id,
      title: t || "Task Title..",
      body: detail || "Task body about this task..",
      type: variant,
      deadline: deadline,
      files: files,
    };
    const updatedItems = [newItem, ...items];
    setItems(updatedItems);
    onItemsChange?.(updatedItems);
    setEditItem(null); // Clear edit state
  };

  const handleUpdate = (
    id: string,
    {
      title: t,
      detail,
      deadline,
      files,
      deletedFileIds,
    }: {
      title: string;
      detail: string;
      deadline?: string;
      files?: File[];
      deletedFileIds?: number[];
    }
  ) => {
    const updatedItems = items.map((item) =>
      item.id === id
        ? {
            ...item,
            title: t,
            body: detail,
            deadline: deadline,
            // Update files with newly added files
            files:
              files !== undefined
                ? [...(item.files || []), ...files]
                : item.files,
            // Merge deleted file IDs with existing ones
            deletedFileIds: deletedFileIds
              ? [...(item.deletedFileIds || []), ...deletedFileIds]
              : item.deletedFileIds,
          }
        : item
    );
    setItems(updatedItems);
    onItemsChange?.(updatedItems);
    setEditItem(null); // Clear edit state
  };

  const handleModalClose = () => {
    setOpen(false);
    setEditItem(null);
    // Clean up blob URLs
    blobUrls.forEach((url) => URL.revokeObjectURL(url));
    setBlobUrls([]);
  };

  // Prepare edit item with filtered existing files (exclude deleted ones) and preserve newly added files
  const prepareEditItem = React.useMemo(() => {
    const prepared = prepareEditItemForModal(editItem);

    if (prepared) {
      // Update blob URLs state (only for blob URLs)
      const newBlobUrls = (prepared.initialPreviewUrls || []).filter((url) =>
        url.startsWith("blob:")
      );
      // Avoiding setBlobUrls here would be better but keeping behavior for now, just filtering
      // Actually we can't set state in render. The original code did it though.
      // Let's rely on the fact that existing code did it, but I will put it in a useEffect if I can, or leave it.
      // Original code: setBlobUrls(blobUrls); inside useMemo.
      // I will replicate it to maintain exact behavior but it is risky.
      // Actually, let's assume it was working.
      if (JSON.stringify(newBlobUrls) !== JSON.stringify(blobUrls)) {
        // Preventing infinite loop if I were to try to fix it, but I can't easily fix without refactoring logic flow.
        // I will just leave the side effect out of the handler and let the component stay as is?
        // No the prompt is to "use the handler".
      }
    }
    return prepared;
  }, [editItem]);

  // Side effect to update blobUrls based on prepared item - safer than doing it in memo
  React.useEffect(() => {
    if (prepareEditItem?.initialPreviewUrls) {
      const newBlobUrls = prepareEditItem.initialPreviewUrls.filter((url) =>
        url.startsWith("blob:")
      );
      setBlobUrls(newBlobUrls);
    }
  }, [prepareEditItem]);

  return (
    <Card className="border-[#CFDBE8] p-4 shadow-none border-dashed">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-xs font-semibold text-[#0D141C]">{title}</h3>
        <Button
          size="icon"
          className="h-7 w-7 rounded-md bg-[#EA3160] hover:bg-[#d72a56]"
          onClick={() => setOpen(true)}>
          <Plus className="size-4 text-white" />
        </Button>
      </div>
      <div className="space-y-3">
        {items.map((it) => (
          <ChecklistItem
            key={it.id}
            item={it}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        ))}
      </div>

      <NewTaskModal
        type={variant}
        open={open}
        setOpen={handleModalClose}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
        editItem={prepareEditItem}
      />
    </Card>
  );
}
