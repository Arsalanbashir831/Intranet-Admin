import { UploadItem } from "@/contexts/upload-queue-context";

export interface AddFileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  folderId?: number;
  onFileUploaded?: () => void; // Callback to refresh folder contents
}

export type AccessType = "all-employees" | "branch" | "department";

export interface AddFolderModalProps {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  parentFolderId?: number;
  folderId?: number;
  onComplete?: () => void;
  isEditMode?: boolean;
  showAccessOptions?: boolean;
}

export type FolderItemRow = {
  id: string;
  file: string;
  kind?: "folder" | "file"; // subfolder or file
  extension?: "pdf" | "doc" | "docx" | string; // for files
  createdByName?: string;
  createdByAvatar?: string;
  dateCreated?: string;
  originalId?: string; // Store the actual API ID
  fileSize?: number; // For files
};

export type FolderDetailsTableProps = {
  title: string;
  folderId?: number; // Add folderId for bulk upload
  onNewFolder?: () => void;
  onNewFile?: () => void;
  onFilesUploaded?: () => void; // Callback when files are uploaded
  canAddContent?: boolean; // Whether user can add new content to this folder
};

export interface TableContextMenuProps {
  children: React.ReactNode;
  onNewFolder?: () => void;
  onNewFile?: () => void;
}

export interface RowContextMenuProps {
  children: React.ReactNode;
  onRename?: () => void;
  onDelete?: () => void;
}

export type UploadStatus = "pending" | "uploading" | "done" | "error";

export interface UploadQueueProps {
  items: UploadItem[];
  onClear?: () => void;
  onRemove?: (id: string) => void;
  collapsed: boolean;
  setCollapsed: (c: boolean) => void;
}
