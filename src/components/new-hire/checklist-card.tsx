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
    const [blobUrls, setBlobUrls] = React.useState<string[]>([]); // Track blob URLs for cleanup

    // Create a stable reference for initial data
    const stableInitial = React.useMemo(() => initial, [initial.length, initial.map(i => i.id).join(',')]);
    
    // Update items when initial data changes
    React.useEffect(() => {
      setItems(stableInitial);
    }, [stableInitial]);

    // Clean up blob URLs when component unmounts
    React.useEffect(() => {
      return () => {
        blobUrls.forEach(url => URL.revokeObjectURL(url));
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

    const handleCreate = ({ title: t, detail, deadline, files }: { title: string; detail: string; deadline?: string; files?: File[] }) => {
      const id = `${variant}-${Date.now()}`;
      const newItem: ChecklistItemData = {
        id, 
        title: t || "Task Title..", 
        body: detail || "Task body about this task..",
        type: variant,
        deadline: deadline,
        files: files
      };
      const updatedItems = [newItem, ...items];
      setItems(updatedItems);
      onItemsChange?.(updatedItems);
      setEditItem(null); // Clear edit state
    };

    const handleUpdate = (id: string, { title: t, detail, deadline, files, deletedFileIds }: { title: string; detail: string; deadline?: string; files?: File[]; deletedFileIds?: number[] }) => {
      const updatedItems = items.map(item => 
        item.id === id 
          ? { 
              ...item, 
              title: t, 
              body: detail,
              deadline: deadline,
              // Update files with newly added files
              files: files !== undefined ? [...(item.files || []), ...files] : item.files,
              // Merge deleted file IDs with existing ones
              deletedFileIds: deletedFileIds 
                ? [...(item.deletedFileIds || []), ...deletedFileIds] 
                : item.deletedFileIds
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
      blobUrls.forEach(url => URL.revokeObjectURL(url));
      setBlobUrls([]);
    };
  
    // Prepare edit item with filtered existing files (exclude deleted ones) and preserve newly added files
    const prepareEditItem = React.useMemo(() => {
      if (!editItem) return null;
      
      // If there are deleted file IDs, filter them out from existingFiles
      let filteredExistingFiles = editItem.existingFiles;
      if (editItem.deletedFileIds && editItem.deletedFileIds.length > 0 && editItem.existingFiles) {
        filteredExistingFiles = editItem.existingFiles.filter(
          file => !editItem.deletedFileIds?.includes(file.id)
        );
      }
      
      // Create attachment URLs for existing files
      const existingFileUrls = filteredExistingFiles ? 
        filteredExistingFiles.map(file => file.file) : [];
      
      // Create preview URLs for newly added files
      const newFileUrls: string[] = [];
      if (editItem.files) {
        editItem.files.forEach(file => {
          // Check if it's an image file
          if (file.type.startsWith('image/')) {
            // For images, create blob URLs
            newFileUrls.push(URL.createObjectURL(file));
          } else {
            // For documents, create file:// URLs with file info
            const fileInfo = {
              name: file.name,
              type: file.type,
              size: file.size
            };
            const fileDataUrl = `file://${encodeURIComponent(JSON.stringify(fileInfo))}`;
            newFileUrls.push(fileDataUrl);
          }
        });
      }
      
      // Update blob URLs state (only for blob URLs)
      const blobUrls = newFileUrls.filter(url => url.startsWith('blob:'));
      setBlobUrls(blobUrls);
      
      return {
        ...editItem,
        existingFiles: filteredExistingFiles,
        deletedFileIds: editItem.deletedFileIds || [],
        initialPreviewUrls: [...existingFileUrls, ...newFileUrls]
      };
    }, [editItem]);
  
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
          editItem={prepareEditItem}
        />
      </Card>
    );
  }