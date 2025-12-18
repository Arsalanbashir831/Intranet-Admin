import { FolderTreeItem, KnowledgeBaseRow, KnowledgeFile, FolderTreeFile } from "@/types/knowledge";
import { FolderItemRow } from "@/types/knowledge-base";
import { format } from "date-fns";

// Helper function to determine access level from access_level field
export const getAccessLevel = (folder: FolderTreeItem): "Specific Branch Departments" | "Specific Departments" | "Specific Branches" | "Specific Employees" | "All Employees" => {
  // Check branch_departments first (new field)
  if (folder.access_level.branch_departments && folder.access_level.branch_departments.length > 0) {
    return "Specific Branch Departments";
  }
  // Check branches
  if (folder.access_level.branches && folder.access_level.branches.length > 0) {
    return "Specific Branches";
  }
  // Check departments
  if (folder.access_level.departments && folder.access_level.departments.length > 0) {
    return "Specific Departments";
  }
  // Check employees
  if (folder.access_level.employees && folder.access_level.employees.length > 0) {
    return "Specific Employees";
  }
  // If all are empty, it's accessible to all employees
  return "All Employees";
};

// Helper function to transform API data to table row format
export const transformFolderToRow = (folder: FolderTreeItem): KnowledgeBaseRow => {
  return {
    id: folder.id.toString(),
    folder: folder.name,
    createdByName: folder.created_by?.emp_name || "Admin",
    createdByAvatar: process.env.NEXT_PUBLIC_API_BASE_URL + folder.created_by?.profile_picture || undefined,
    accessLevel: getAccessLevel(folder),
    accessLevelDetails: {
      employees: (folder.access_level.employees || []) as Array<{ id: number; emp_name: string; email: string; profile_picture?: string }>,
      branchDepartments: (folder.access_level.branch_departments || []) as Array<{ id: number; branch: { branch_name: string }; department: { dept_name: string } }>,
      departments: (folder.access_level.departments || []) as Array<{ id: number; dept_name: string }>,
      branches: (folder.access_level.branches || []) as Array<{ id: number; branch_name: string }>,
    },
    dateCreated: format(new Date(folder.created_at), "yyyy-MM-dd"),
    originalData: folder,
  };
};

export const transformFolderTreeToDetailsRows = (currentFolder: FolderTreeItem): FolderItemRow[] => {
  const newRows: FolderItemRow[] = [];

  // Add subfolders
  currentFolder.folders.forEach(folder => {
    newRows.push({
      id: `folder-${folder.id}`,
      file: folder.name,
      kind: "folder",
      createdByName: folder.created_by?.emp_name || "Admin",
      createdByAvatar: process.env.NEXT_PUBLIC_API_BASE_URL + folder.created_by?.profile_picture || undefined,
      dateCreated: folder.created_at ? format(new Date(folder.created_at), "yyyy-MM-dd") : undefined,
      originalId: folder.id.toString(),
    });
  });

  // Add files
  currentFolder.files.forEach(file => {
    const extension = file.name.split('.').pop()?.toLowerCase() || "";
    // Extract uploaded_by details if it's an object
    const uploadedBy = typeof file.uploaded_by === 'object' && file.uploaded_by !== null
      ? file.uploaded_by
      : null;
    newRows.push({
      id: `file-${file.id}`,
      file: file.name,
      kind: "file",
      extension,
      createdByName: uploadedBy?.emp_name || "Admin",
      createdByAvatar: uploadedBy?.profile_picture || undefined,
      dateCreated: file.uploaded_at ? format(new Date(file.uploaded_at), "yyyy-MM-dd") : undefined,
      originalId: file.id.toString(),
      fileSize: file.size,
    });
  });

  return newRows;
};

export const downloadFile = (file: FolderTreeFile | KnowledgeFile) => {
  if (file && file.file_url) {
    try {
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = file.file_url;
      link.download = file.name;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';

      // Add to DOM, click, and remove
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch {
      // Fallback: open in new tab if download fails
      window.open(file.file_url, '_blank', 'noopener,noreferrer');
    }
  }
};
