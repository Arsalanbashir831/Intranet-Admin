import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dropzone } from "@/components/ui/dropzone";
import { SelectableTags, createSelectableItems } from "@/components/ui/selectable-tags";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { ChevronDownIcon } from "lucide-react";
import { useDepartments } from "@/hooks/queries/use-departments";
import { useAllBranches } from "@/hooks/queries/use-branches";

export type CompanyHubInitialData = {
  id?: string;
  type?: "announcement" | "policy";
  title?: string;
  tags?: string;
  selectedBranches?: string[];
  selectedDepartments?: string[];
  description?: string;
};

export type CompanyHubFormProps = {
  initialData?: CompanyHubInitialData;
  onFormDataChange?: (data: CompanyHubFormData) => void;
  onSubmit?: (data: CompanyHubFormData, isDraft: boolean) => void;
  existingAttachments?: Array<{
    id: number;
    name: string;
    file_url: string;
    size: number;
  }>;
  onAttachmentDelete?: (id: number) => void;
};

export type CompanyHubFormData = {
  type: "announcement" | "policy";
  title: string;
  tags: string;
  selectedBranches: string[];
  selectedDepartments: string[];
  description: string;
  attachedFiles: File[];
};

// Add a new type for the form submission data
export type CompanyHubFormSubmitData = CompanyHubFormData & {
  // Ensure these fields are always present even when empty
  selectedBranches: string[];
  selectedDepartments: string[];
};

export function CompanyHubForm({ 
  initialData,
  onFormDataChange,
  onSubmit,
  existingAttachments = [],
  onAttachmentDelete
}: CompanyHubFormProps) {
  // Get departments and branches from API
  const { data: departmentsData } = useDepartments();
  const { data: branchesData } = useAllBranches();
  
  // Create department options (unique departments only) with "All" option
  const departments = React.useMemo(() => {
    if (!departmentsData?.departments?.results) return [];
    
    const uniqueDepartments = new Map();
    departmentsData.departments.results.forEach((dept: { id: number; dept_name: string }) => {
      if (!uniqueDepartments.has(dept.id)) {
        uniqueDepartments.set(dept.id, {
          id: String(dept.id),
          name: dept.dept_name
        });
      }
    });
    
    // Convert to array and add "All" option at the beginning
    const departmentArray = Array.from(uniqueDepartments.values());
    return [
      { id: "all", name: "All Departments" },
      ...departmentArray
    ];
  }, [departmentsData]);

  // Create branch options with "All" option
  const branches = React.useMemo(() => {
    if (!branchesData?.branches?.results) return [];
    
    const branchArray = branchesData.branches.results.map((branch: { id: number; branch_name: string }) => ({
      id: String(branch.id),
      name: branch.branch_name
    }));
    
    // Add "All" option at the beginning
    return [
      { id: "all", name: "All Branches" },
      ...branchArray
    ];
  }, [branchesData]);

  // Combine existing attachment URLs for dropzone preview
  const initialPreviewUrls = React.useMemo(() => {
    return existingAttachments
      .filter(attachment => attachment.file_url.match(/\.(jpg|jpeg|png|gif|svg)$/i))
      .map(attachment => attachment.file_url);
  }, [existingAttachments]);
  
  // Helper to find attachment ID by URL
  const getAttachmentIdByUrl = (url: string) => {
    const attachment = existingAttachments.find(att => att.file_url === url);
    return attachment?.id;
  };

  // Form state
  const [typeValue, setTypeValue] = React.useState<"announcement" | "policy">(initialData?.type ?? "announcement");
  const [title, setTitle] = React.useState<string>(initialData?.title ?? "");
  const [tags, setTags] = React.useState<string>(initialData?.tags ?? "");
  const [selectedBranches, setSelectedBranches] = React.useState<string[]>(initialData?.selectedBranches ?? []);
  const [selectedDepartments, setSelectedDepartments] = React.useState<string[]>(initialData?.selectedDepartments ?? []);
  const [description, setDescription] = React.useState<string>(initialData?.description ?? "");
  const [attachedFiles, setAttachedFiles] = React.useState<File[]>([]);

  // Update form when initialData changes
  React.useEffect(() => {
    if (!initialData) return;
    if (initialData.type) setTypeValue(initialData.type);
    if (typeof initialData.title === "string") setTitle(initialData.title);
    if (typeof initialData.tags === "string") setTags(initialData.tags);
    if (Array.isArray(initialData.selectedBranches)) setSelectedBranches(initialData.selectedBranches);
    if (Array.isArray(initialData.selectedDepartments)) setSelectedDepartments(initialData.selectedDepartments);
    if (typeof initialData.description === "string") setDescription(initialData.description);
  }, [initialData]);

  // Notify parent component of form data changes with proper memoization
  const currentFormData = React.useMemo<CompanyHubFormData>(() => ({
    type: typeValue,
    title,
    tags,
    selectedBranches,
    selectedDepartments,
    description,
    attachedFiles,
  }), [typeValue, title, tags, selectedBranches, selectedDepartments, description, attachedFiles]);

  // Create a submit handler that ensures empty arrays are sent
  const handleSubmit = React.useCallback((isDraft: boolean) => {
    // Ensure we always send arrays, even if empty
    const submitData: CompanyHubFormSubmitData = {
      type: typeValue,
      title,
      tags,
      selectedBranches: selectedBranches || [],
      selectedDepartments: selectedDepartments || [],
      description,
      attachedFiles,
    };
    
    onSubmit?.(submitData, isDraft);
  }, [typeValue, title, tags, selectedBranches, selectedDepartments, description, attachedFiles, onSubmit]);

  React.useEffect(() => {
    onFormDataChange?.(currentFormData);
  }, [currentFormData, onFormDataChange]);

  // Handle special case for "All" selection in departments
  const handleDepartmentSelectionChange = React.useCallback((newSelection: string[]) => {
    const allDepartmentIds = departments
      .filter(dept => dept.id !== "all")
      .map(dept => dept.id);
    
    // Check if "all" was just added to the selection
    const allOptionSelected = newSelection.includes("all");
    
    if (allOptionSelected) {
      // User clicked "all", select all departments
      setSelectedDepartments(allDepartmentIds);
    } else {
      // Filter out "all" from the selection and only work with actual departments
      const filteredSelection = newSelection.filter(id => id !== "all" && allDepartmentIds.includes(id));
      setSelectedDepartments(filteredSelection);
    }
  }, [departments]);

  // Handle special case for "All" selection in branches
  const handleBranchSelectionChange = React.useCallback((newSelection: string[]) => {
    const allBranchIds = branches
      .filter(branch => branch.id !== "all")
      .map(branch => branch.id);
    
    // Check if "all" was just added to the selection
    const allOptionSelected = newSelection.includes("all");
    
    if (allOptionSelected) {
      // User clicked "all", select all branches
      setSelectedBranches(allBranchIds);
    } else {
      // Filter out "all" from the selection and only work with actual branches
      const filteredSelection = newSelection.filter(id => id !== "all" && allBranchIds.includes(id));
      setSelectedBranches(filteredSelection);
    }
  }, [branches]);

  // Determine if all departments/branches are selected for UI purposes
  const areAllDepartmentsSelected = React.useMemo(() => {
    const allDepartmentIds = departments
      .filter(dept => dept.id !== "all")
      .map(dept => dept.id);
    return allDepartmentIds.length > 0 && 
           selectedDepartments.length === allDepartmentIds.length &&
           selectedDepartments.every(id => allDepartmentIds.includes(id));
  }, [departments, selectedDepartments]);

  const areAllBranchesSelected = React.useMemo(() => {
    const allBranchIds = branches
      .filter(branch => branch.id !== "all")
      .map(branch => branch.id);
    return allBranchIds.length > 0 && 
           selectedBranches.length === allBranchIds.length &&
           selectedBranches.every(id => allBranchIds.includes(id));
  }, [branches, selectedBranches]);

  // Create items for the selectable tags, conditionally hiding "all" option
  const departmentItems = React.useMemo(() => {
    if (areAllDepartmentsSelected) {
      // Hide "all" option when all departments are selected
      return departments.filter(dept => dept.id !== "all");
    }
    return departments;
  }, [departments, areAllDepartmentsSelected]);

  const branchItems = React.useMemo(() => {
    if (areAllBranchesSelected) {
      // Hide "all" option when all branches are selected
      return branches.filter(branch => branch.id !== "all");
    }
    return branches;
  }, [branches, areAllBranchesSelected]);

  // For display, we never show "all" as selected since we're managing it through visibility
  const displayedSelectedDepartments = selectedDepartments;
  const displayedSelectedBranches = selectedBranches;

  return (
      <div className="grid gap-6">
        <div className="grid grid-cols-12 items-start gap-4 border-b border-[#E9EAEB] pb-4">
          <Label className="col-span-12 md:col-span-2 text-sm">Type:</Label>
          <div className="col-span-12 md:col-span-10">
            <RadioGroup value={typeValue} onValueChange={(v) => setTypeValue(v as "announcement" | "policy")} className="flex gap-6">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="announcement" id="type-ann"/>
                <Label htmlFor="type-ann" className="cursor-pointer text-[#535862]">Announcement</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="policy" id="type-pol" />
                <Label htmlFor="type-pol" className="cursor-pointer text-[#535862]">Policy</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <div className="grid grid-cols-12 items-center gap-4 border-b border-[#E9EAEB] pb-4">
          <Label className="col-span-12 md:col-span-2 text-sm">Title:</Label>
          <div className="col-span-12 md:col-span-10">
            <Input
              placeholder="e.g. Announcement 1/Policy"
              className="border-[#E2E8F0]"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-12 items-start gap-4 border-b border-[#E9EAEB] pb-4">
          <Label className="col-span-12 md:col-span-2 text-sm">Attachments:</Label>
          <div className="col-span-12 md:col-span-10">
            <Dropzone 
              onFileSelect={(files) => {
                if (files) {
                  setAttachedFiles(Array.from(files));
                  console.log("Files selected:", files);
                }
              }}
              onClear={() => {
                setAttachedFiles([]);
                // Mark all existing image attachments for deletion when clearing all
                const imageAttachments = existingAttachments.filter(attachment => 
                  attachment.file_url.match(/\.(jpg|jpeg|png|gif|svg)$/i)
                );
                if (imageAttachments.length > 0 && onAttachmentDelete) {
                  imageAttachments.forEach(attachment => {
                    onAttachmentDelete(attachment.id);
                  });
                }
              }}
              onImageRemove={(url) => {
                // Check if this is an existing attachment (not a blob URL)
                if (!url.startsWith('blob:')) {
                  const attachmentId = getAttachmentIdByUrl(url);
                  if (attachmentId && onAttachmentDelete) {
                    onAttachmentDelete(attachmentId);
                  }
                }
              }}
              accept="image/*,.pdf,.doc,.docx"
              maxSize={10 * 1024 * 1024} // 10MB
              multiple
              showPreview={true}
              initialPreviewUrls={initialPreviewUrls}
            />
            
            {/* Show non-image attachments separately */}
            {existingAttachments.filter(attachment => !attachment.file_url.match(/\.(jpg|jpeg|png|gif|svg)$/i)).length > 0 && (
              <div className="mt-4 rounded-md border border-[#E2E8F0] p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-muted-foreground">
                    Non-image attachments
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {existingAttachments
                    .filter(attachment => !attachment.file_url.match(/\.(jpg|jpeg|png|gif|svg)$/i))
                    .map((attachment) => (
                    <div key={attachment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex items-center gap-3">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">{attachment.name}</div>
                          <div className="text-gray-500">{(attachment.size / 1024).toFixed(1)} KB</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <a 
                          href={attachment.file_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          View
                        </a>
                        {onAttachmentDelete && (
                          <button
                            type="button"
                            onClick={() => onAttachmentDelete(attachment.id)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-12 items-center gap-4 border-b border-[#E9EAEB] pb-4">
          <Label className="col-span-12 md:col-span-2 text-sm">Hashtags/tags:</Label>
          <div className="col-span-12 md:col-span-10">
            <Input
              placeholder="#importantNotice"
              className="border-[#E2E8F0]"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-12 items-center gap-4">
          <Label className="col-span-12 md:col-span-2 text-sm">Branch Access:</Label>
          <div className="col-span-12 md:col-span-10">
            <SelectableTags
              items={createSelectableItems(branchItems)}
              selectedItems={displayedSelectedBranches}
              onSelectionChange={handleBranchSelectionChange}
              placeholder="Select branches (empty = public access)"
              searchPlaceholder="Search branches..."
              emptyMessage="No branches found."
              icon={<ChevronDownIcon size={12} className="text-[#535862]" />}
            />
          </div>
        </div>

        <div className="grid grid-cols-12 items-center gap-4 border-b border-[#E9EAEB] pb-4">
          <Label className="col-span-12 md:col-span-2 text-sm">Department Access:</Label>
          <div className="col-span-12 md:col-span-10">
            <SelectableTags
              items={createSelectableItems(departmentItems)}
              selectedItems={displayedSelectedDepartments}
              onSelectionChange={handleDepartmentSelectionChange}
              placeholder="Select departments (empty = public access)"
              searchPlaceholder="Search departments..."
              emptyMessage="No departments found."
              icon={<ChevronDownIcon size={12} className="text-[#535862]" />}
            />
          </div>
        </div>

        <div className="grid grid-cols-12 items-start gap-4">
          <Label className="col-span-12 md:col-span-2 text-sm">Description:</Label>
          <div className="col-span-12 md:col-span-10">
            <RichTextEditor
              content={description}
              onChange={setDescription}
              placeholder="Write Description for the Announcement/Policy"
              minHeight="200px"
              maxHeight="400px"
            />
          </div>
        </div>
      </div>
  );
}


