"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Trash2, ChevronDownIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  SelectableTags,
  createSelectableItems,
  createCustomSelectableItems,
} from "@/components/ui/selectable-tags";
import {
  useDepartments,
  useSearchDepartments,
} from "@/hooks/queries/use-departments";
import {
  useAllBranches,
  useSearchBranches,
} from "@/hooks/queries/use-branches";
import { useManagerScope } from "@/contexts/manager-scope-context";

const pollFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  question: z.string().min(1, "Question is required"),
  poll_type: z.enum(["public", "private"]),
  expires_at: z.date({
    message: "Expiration date is required",
  }),
  options: z.array(z.object({
    option_text: z.string().min(1, "Option text is required"),
  })).min(2, "At least 2 options are required"),
  permitted_branches: z.array(z.string()).optional(),
  permitted_departments: z.array(z.string()).optional(),
  permitted_branch_departments: z.array(z.string()).optional(),
});

export type PollFormData = z.infer<typeof pollFormSchema>;

export type PollFormProps = {
  initialData?: Partial<PollFormData>;
  onFormDataChange?: (data: PollFormData) => void;
  onSubmit?: (data: PollFormData) => void;
  onRegisterSubmit?: (fn: () => void) => void;
  onSubmitComplete?: (success: boolean) => void;
};

export function PollForm({
  initialData,
  onFormDataChange,
  onSubmit,
  onRegisterSubmit,
  onSubmitComplete,
}: PollFormProps) {
  // Use a ref to store form data to prevent infinite re-renders
  const formDataRef = React.useRef<PollFormData | null>(null);
  
  // Get manager scope to determine access level
  const { isManager, managedDepartments } = useManagerScope();
  
  // Load base datasets
  const { data: departmentsData } = useDepartments();
  const { data: branchesData } = useAllBranches();

  // Create adapter functions for branch departments (similar to org-chart-form.tsx)
  const useAllBranchDepartments = () => {
    const result = useDepartments(undefined, { pageSize: 100 });
    const branchDeptItems = React.useMemo(() => {
      // Handle both array format (new) and nested object format (old)
      const results = Array.isArray(result.data) 
        ? result.data 
        : (result.data as { departments?: { results?: unknown[] } } | undefined)?.departments?.results ?? [];

      const items: { id: string; label: string }[] = [];
      for (const dept of results || []) {
        const deptData = dept as {
          dept_name?: string;
          name?: string;
          branch_departments?: unknown[];
        };
        const deptName = String(deptData.dept_name ?? deptData.name ?? "");
        const branchDepartments = deptData.branch_departments as
          | Array<{
              id: number;
              branch?: { branch_name?: string };
              branch_name?: string;
            }>
          | undefined;
        if (Array.isArray(branchDepartments)) {
          for (const bd of branchDepartments) {
            const bdId = String(bd.id);
            const branchName = String(
              bd?.branch?.branch_name ?? bd?.branch_name ?? ""
            );
            
            // Filter: If manager, only show their managed departments
            if (isManager && !managedDepartments.includes(bd.id)) {
              continue; // Skip this department
            }
            
            items.push({ id: bdId, label: `${deptName} - ${branchName}` });
          }
        }
      }
      return items;
    }, [result.data, isManager, managedDepartments]);

    return {
      data: branchDeptItems,
      isLoading: result.isLoading,
    };
  };

  const useSearchBranchDepartmentsAdapter = (query: string) => {
    const result = useSearchDepartments(query, { pageSize: 100 });
    const branchDeptItems = React.useMemo(() => {
      // Handle both array format (new) and nested object format (old)
      const results = Array.isArray(result.data) 
        ? result.data 
        : (result.data as { departments?: { results?: unknown[] } } | undefined)?.departments?.results ?? [];
      const items: { id: string; label: string }[] = [];
      for (const dept of results || []) {
        const deptData = dept as {
          dept_name?: string;
          name?: string;
          branch_departments?: unknown[];
        };
        const deptName = String(deptData.dept_name ?? deptData.name ?? "");
        const branchDepartments = deptData.branch_departments as
          | Array<{
              id: number;
              branch?: { branch_name?: string };
              branch_name?: string;
            }>
          | undefined;
        if (Array.isArray(branchDepartments)) {
          for (const bd of branchDepartments) {
            const bdId = String(bd.id);
            const branchName = String(
              bd?.branch?.branch_name ?? bd?.branch_name ?? ""
            );
            
            // Filter: If manager, only show their managed departments
            if (isManager && !managedDepartments.includes(bd.id)) {
              continue; // Skip this department
            }
            
            items.push({ id: bdId, label: `${deptName} - ${branchName}` });
          }
        }
      }
      return items;
    }, [result.data, isManager, managedDepartments]);

    return {
      data: branchDeptItems,
      isLoading: result.isLoading,
    };
  };

  // Create adapter hooks for SelectableTags search functionality
  const useSearchDepartmentsAdapter = (query: string) => {
    const searchResult = useSearchDepartments(query, { page: 1, pageSize: 50 });
    const selectableItems = React.useMemo(() => {
      if (searchResult.data) {
        if (
          typeof searchResult.data === "object" &&
          searchResult.data !== null &&
          "departments" in searchResult.data
        ) {
          const departmentsData = searchResult.data as {
            departments?: {
              results?: Array<{ id: unknown; dept_name: unknown }>;
            };
          };
          const rawData = departmentsData.departments?.results || [];
          return createCustomSelectableItems(rawData, "id", "dept_name");
        }
        if (
          typeof searchResult.data === "object" &&
          searchResult.data !== null &&
          "results" in searchResult.data
        ) {
          const rawData = (searchResult.data as { results: Array<{ id: unknown; dept_name: unknown }> }).results;
          return createCustomSelectableItems(rawData, "id", "dept_name");
        }
      }
      return [];
    }, [searchResult.data]);
    return { ...searchResult, data: selectableItems };
  };

  const useSearchBranchesAdapter = (query: string) => {
    const searchResult = useSearchBranches(query, { page: 1, pageSize: 50 });
    const selectableItems = React.useMemo(() => {
      if (searchResult.data) {
        if (
          typeof searchResult.data === "object" &&
          searchResult.data !== null &&
          "branches" in searchResult.data
        ) {
          const branchesData = searchResult.data as {
            branches?: {
              results?: Array<{ id: unknown; branch_name: unknown }>;
            };
          };
          const rawData = branchesData.branches?.results || [];
          return createCustomSelectableItems(rawData, "id", "branch_name");
        }
        if (
          typeof searchResult.data === "object" &&
          searchResult.data !== null &&
          "results" in searchResult.data
        ) {
          const rawData = (searchResult.data as { results: Array<{ id: unknown; branch_name: unknown }> }).results;
          return createCustomSelectableItems(rawData, "id", "branch_name");
        }
      }
      return [];
    }, [searchResult.data]);
    return { ...searchResult, data: selectableItems };
  };

  const form = useForm<PollFormData>({
    resolver: zodResolver(pollFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      subtitle: initialData?.subtitle || "",
      question: initialData?.question || "",
      poll_type: initialData?.poll_type || "public",
      expires_at: initialData?.expires_at || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      options: initialData?.options || [
        { option_text: "" },
        { option_text: "" },
      ],
      permitted_branches: initialData?.permitted_branches || [],
      permitted_departments: initialData?.permitted_departments || [],
      permitted_branch_departments: initialData?.permitted_branch_departments || [],
    },
  });

  const { watch, setValue, handleSubmit, getValues, formState: { errors } } = form;
  
  // Watch form values for controlled inputs
  const watchedValues = watch();

  // Create a stable form data change handler
  const handleFormDataChange = React.useCallback(() => {
    if (onFormDataChange) {
      const currentData = getValues();
      onFormDataChange(currentData);
    }
  }, [onFormDataChange, getValues]);

  // Watch specific fields and call the handler when they change
  const title = watch("title");
  const subtitle = watch("subtitle");
  const question = watch("question");
  const pollType = watch("poll_type");
  const expiresAt = watch("expires_at");
  const options = watch("options");
  const permittedBranches = watch("permitted_branches");
  const permittedDepartments = watch("permitted_departments");
  const permittedBranchDepartments = watch("permitted_branch_departments");

  // Call form data change handler when any watched field changes
  React.useEffect(() => {
    handleFormDataChange();
  }, [title, subtitle, question, pollType, expiresAt, options, permittedBranches, permittedDepartments, permittedBranchDepartments, handleFormDataChange]);

  // Memoize the submit function to prevent infinite re-renders
  const submitFunction = React.useCallback(() => {
    const currentData = getValues();
    formDataRef.current = currentData;
    handleSubmit(onSubmit || (() => {}))();
  }, [handleSubmit, onSubmit, getValues]);

  // Register submit function with parent
  React.useEffect(() => {
    if (onRegisterSubmit) {
      onRegisterSubmit(submitFunction);
    }
  }, [onRegisterSubmit, submitFunction]);

  const addOption = () => {
    const currentOptions = getValues("options") || [];
    setValue("options", [...currentOptions, { option_text: "" }]);
  };

  const removeOption = (index: number) => {
    const currentOptions = getValues("options") || [];
    if (currentOptions.length > 2) {
      setValue("options", currentOptions.filter((_, i) => i !== index));
    }
  };

  const updateOption = (index: number, value: string) => {
    const currentOptions = getValues("options") || [];
    const newOptions = [...currentOptions];
    newOptions[index] = { option_text: value };
    setValue("options", newOptions);
  };

  // Transform data for SelectableTags
  const departmentItems = React.useMemo(() => {
    if (!departmentsData) return [];
    // Handle both array format (new) and nested object format (old)
    const list = Array.isArray(departmentsData) 
      ? departmentsData 
      : (departmentsData as { departments?: { results?: unknown[] } } | undefined)?.departments?.results || [];
    return createCustomSelectableItems(list as Array<{ id: unknown; dept_name: unknown }>, "id", "dept_name");
  }, [departmentsData]);

  const branchItems = React.useMemo(() => {
    if (!branchesData) return [];
    const list = Array.isArray(branchesData) 
      ? branchesData 
      : (branchesData as { branches?: { results?: unknown[] } })?.branches?.results || [];
    return createCustomSelectableItems(list as Array<{ id: unknown; branch_name: unknown }>, "id", "branch_name");
  }, [branchesData]);

  // Determine if user is admin (has full access) or manager (limited access)
  const isAdmin = !isManager; // If not a manager, then they're an admin

  return (
    <form onSubmit={handleSubmit(onSubmit || (() => {}))} className="grid gap-6">
      <div className="grid grid-cols-12 items-start gap-4 border-b border-[#E9EAEB] pb-4">
        <Label className="col-span-12 md:col-span-2 text-sm">Type:</Label>
        <div className="col-span-12 md:col-span-10">
          <RadioGroup
            value={pollType}
            onValueChange={(value) => setValue("poll_type", value as "public" | "private")}
            className="flex gap-6"
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="public" id="public" />
              <Label htmlFor="public" className="cursor-pointer text-[#535862]">
                Public
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="private" id="private" />
              <Label htmlFor="private" className="cursor-pointer text-[#535862]">
                Private
              </Label>
            </div>
          </RadioGroup>
        </div>
      </div>

      <div className="grid grid-cols-12 items-center gap-4 border-b border-[#E9EAEB] pb-4">
        <Label className="col-span-12 md:col-span-2 text-sm">Title:</Label>
        <div className="col-span-12 md:col-span-10">
          <Input
            value={title || ""}
            onChange={(e) => setValue("title", e.target.value)}
            placeholder="Enter poll title"
            className="border-[#E2E8F0]"
          />
          {errors.title && (
            <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 items-center gap-4 border-b border-[#E9EAEB] pb-4">
        <Label className="col-span-12 md:col-span-2 text-sm">Subtitle:</Label>
        <div className="col-span-12 md:col-span-10">
          <Input
            value={subtitle || ""}
            onChange={(e) => setValue("subtitle", e.target.value)}
            placeholder="Enter poll subtitle (optional)"
            className="border-[#E2E8F0]"
          />
        </div>
      </div>

      <div className="grid grid-cols-12 items-center gap-4 border-b border-[#E9EAEB] pb-4">
        <Label className="col-span-12 md:col-span-2 text-sm">Question:</Label>
        <div className="col-span-12 md:col-span-10">
          <Input
            value={question || ""}
            onChange={(e) => setValue("question", e.target.value)}
            placeholder="Enter poll question"
            className="border-[#E2E8F0]"
          />
          {errors.question && (
            <p className="text-sm text-destructive mt-1">{errors.question.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 items-center gap-4 border-b border-[#E9EAEB] pb-4">
        <Label className="col-span-12 md:col-span-2 text-sm">Expiration Date:</Label>
        <div className="col-span-12 md:col-span-10">
          <Popover>
            <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal border-[#E2E8F0]",
                    !expiresAt && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {expiresAt ? format(expiresAt, "PPP") : "Pick a date"}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={expiresAt}
                onSelect={(date) => setValue("expires_at", date || new Date())}
                disabled={(date) => date < new Date()}
                initialFocus
              />
            </PopoverContent>
          </Popover>
          {errors.expires_at && (
            <p className="text-sm text-destructive mt-1">{errors.expires_at.message}</p>
          )}
        </div>
      </div>


      <div className="grid grid-cols-12 items-start gap-4 border-b border-[#E9EAEB] pb-4">
        <Label className="col-span-12 md:col-span-2 text-sm">Poll Options:</Label>
        <div className="col-span-12 md:col-span-10 space-y-4">
          {options?.map((option, index) => (
            <div key={index} className="flex items-center space-x-2">
              <Input
                value={option.option_text}
                onChange={(e) => updateOption(index, e.target.value)}
                placeholder={`Option ${index + 1}`}
                className="flex-1 border-[#E2E8F0]"
              />
              {options && options.length > 2 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeOption(index)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          {errors.options && (
            <p className="text-sm text-destructive">{errors.options.message}</p>
          )}
          <Button
            type="button"
            variant="outline"
            onClick={addOption}
            className="w-full border-[#E2E8F0]"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Option
          </Button>
        </div>
      </div>

      {/* Role-based access controls */}
      {isAdmin ? (
        <>
          {/* Admin sees all access options */}
          <div className="grid grid-cols-12 items-center gap-4">
            <Label className="col-span-12 md:col-span-2 text-sm">Branch Access:</Label>
            <div className="col-span-12 md:col-span-10">
              <SelectableTags
                items={branchItems}
                selectedItems={permittedBranches || []}
                onSelectionChange={(items) => setValue("permitted_branches", items)}
                placeholder="Select branches (empty = public access)"
                searchPlaceholder="Search branches..."
                emptyMessage="No branches found."
                icon={<ChevronDownIcon size={12} className="text-[#535862]" />}
                useSearch={useSearchBranchesAdapter}
                useAllItems={() => ({
                  data: branchItems,
                  isLoading: false,
                })}
              />
            </div>
          </div>

          <div className="grid grid-cols-12 items-center gap-4 border-b border-[#E9EAEB] pb-4">
            <Label className="col-span-12 md:col-span-2 text-sm">Department Access:</Label>
            <div className="col-span-12 md:col-span-10">
              <SelectableTags
                items={departmentItems}
                selectedItems={permittedDepartments || []}
                onSelectionChange={(items) => setValue("permitted_departments", items)}
                placeholder="Select departments (empty = public access)"
                searchPlaceholder="Search departments..."
                emptyMessage="No departments found."
                icon={<ChevronDownIcon size={12} className="text-[#535862]" />}
                useSearch={useSearchDepartmentsAdapter}
                useAllItems={() => ({
                  data: departmentItems,
                  isLoading: false,
                })}
              />
            </div>
          </div>

          <div className="grid grid-cols-12 items-center gap-4">
            <Label className="col-span-12 md:col-span-2 text-sm">Branch Department Access:</Label>
            <div className="col-span-12 md:col-span-10">
              <SelectableTags
                items={[]} // Empty since we're using async hooks
                selectedItems={permittedBranchDepartments || []}
                onSelectionChange={(items) => setValue("permitted_branch_departments", items)}
                placeholder="Select branch departments (empty = public access)"
                searchPlaceholder="Search branch departments..."
                emptyMessage="No branch departments found."
                icon={<ChevronDownIcon size={12} className="text-[#535862]" />}
                useSearch={useSearchBranchDepartmentsAdapter}
                useAllItems={useAllBranchDepartments}
              />
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Manager only sees branch department access */}
          <div className="grid grid-cols-12 items-center gap-4">
            <Label className="col-span-12 md:col-span-2 text-sm">Branch Department Access:</Label>
            <div className="col-span-12 md:col-span-10">
              <SelectableTags
                items={[]} // Empty since we're using async hooks
                selectedItems={permittedBranchDepartments || []}
                onSelectionChange={(items) => setValue("permitted_branch_departments", items)}
                placeholder="Select branch departments (empty = public access)"
                searchPlaceholder="Search branch departments..."
                emptyMessage="No branch departments found."
                icon={<ChevronDownIcon size={12} className="text-[#535862]" />}
                useSearch={useSearchBranchDepartmentsAdapter}
                useAllItems={useAllBranchDepartments}
              />
              <p className="mt-1 text-xs text-muted-foreground">
                As a manager, you can only assign polls to your managed departments.
              </p>
            </div>
          </div>
        </>
      )}

    </form>
  );
}
