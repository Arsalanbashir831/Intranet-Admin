import { Checklist, NewHireRow, ChecklistItemData } from "@/types/new-hire";
import { format } from "date-fns";

export const transformChecklistData = (checklistsData: { results: Checklist[] } | undefined): NewHireRow[] => {
  if (!checklistsData?.results) return [];

  return checklistsData.results.map(
    (checklist) => {
      // Use expanded employee data from assigned_to_details
      const assignedEmployees =
        checklist.assigned_to_details?.map((emp) => ({
          id: String(emp.id),
          name: emp.emp_name,
          avatar: emp.profile_picture || undefined,
        })) || [];

      // Get assigned by details
      const assignedByDetails = checklist.assigned_by_details as
        | { emp_name?: string; profile_picture?: string }
        | undefined;

      // Get department name from department_details (handling both string and object formats)
      let departmentName = "N/A";
      if (typeof checklist.department_details === "string") {
        try {
          // Try to parse if it's a JSON string
          const parsed = JSON.parse(checklist.department_details);
          departmentName =
            parsed.dept_name ||
            parsed.name ||
            checklist.department_details ||
            "N/A";
        } catch {
          // If parsing fails, use the string value directly
          departmentName = checklist.department_details || "N/A";
        }
      } else if (
        checklist.department_details &&
        typeof checklist.department_details === "object"
      ) {
        // If it's already an object
        departmentName =
          (checklist.department_details as { dept_name?: string })
            .dept_name || "N/A";
      }

      return {
        id: String(checklist.id),
        assignedTo: assignedEmployees,
        department: departmentName,
        dateOfCreation: format(new Date(checklist.created_at), "M/d/yy"),
        status:
          checklist.status === "publish"
            ? ("Published" as const)
            : ("Draft" as const),
        assignedBy: assignedByDetails?.emp_name || "Admin",
        assignedByAvatar: assignedByDetails?.profile_picture || undefined,
      };
    }
  );
};

export const prepareEditItemForModal = (editItem: ChecklistItemData | null) => {
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
  
  return {
    ...editItem,
    existingFiles: filteredExistingFiles,
    deletedFileIds: editItem.deletedFileIds || [],
    initialPreviewUrls: [...existingFileUrls, ...newFileUrls]
  };
};

export const calculateFileCount = (item: ChecklistItemData) => {
  const newFilesCount = item.files?.length || 0;
  const existingFilesCount = item.existingFiles?.length || 0;
  const deletedFilesCount = item.deletedFileIds?.length || 0;
  
  // Total files minus deleted files
  return newFilesCount + existingFilesCount - deletedFilesCount;
};

export const transformEmployeeData = (allEmployeesData: any) => {
  if (!allEmployeesData) return [];
  const list = Array.isArray(allEmployeesData) ? allEmployeesData : (allEmployeesData?.employees?.results ?? []);
  return (list as {
    id: number | string;
    emp_name: string;
    profile_picture?: string | null;
    branch_departments?: Array<{
      id: number;
      branch: {
        id: number;
        branch_name: string;
      };
      department: {
        id: number;
        dept_name: string;
      };
      manager?: unknown;
    }>;
  }[]).map((e) => ({
    id: e.id,
    full_name: e.emp_name,
    username: undefined,
    department_name: e.branch_departments?.[0] 
      ? `${e.branch_departments[0].branch?.branch_name || 'Unknown'} - ${e.branch_departments[0].department?.dept_name || 'Unknown'}`
      : 'Unknown',
    profile_picture_url: e.profile_picture || undefined,
  }));
};
