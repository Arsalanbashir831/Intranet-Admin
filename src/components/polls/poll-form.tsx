"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useManagerScope } from "@/contexts/manager-scope-context";
import { IndependentBranchDepartmentSelector } from "@/components/common/independent-branch-department-selector";
import { useBranchDepartments } from "@/hooks/queries/use-branches";

const pollFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subtitle: z.string().optional(),
  question: z.string().min(1, "Question is required"),
  poll_type: z.enum(["public", "private"]),
  expires_at: z.date({
    message: "Expiration date is required",
  }),
  options: z
    .array(
      z.object({
        option_text: z.string().min(1, "Option text is required"),
      })
    )
    .min(2, "At least 2 options are required"),
  permitted_branches: z.array(z.string()).optional(),
  permitted_departments: z.array(z.string()).optional(),
  permitted_branch_departments: z.array(z.number()).optional(),
});

import { PollFormData, PollFormProps } from "@/types/polls";

export function PollForm({
  initialData,
  onFormDataChange,
  onSubmit,
  onRegisterSubmit,
}: PollFormProps) {
  // Use a ref to store form data to prevent infinite re-renders
  const formDataRef = React.useRef<PollFormData | null>(null);

  // Get manager scope to determine access level
  const { isManager, managedDepartments } = useManagerScope();

  // Fetch branch departments data for conversion
  const { data: branchDepartmentsData } = useBranchDepartments(undefined, {
    pageSize: 1000,
  });

  const form = useForm<PollFormData>({
    resolver: zodResolver(pollFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      subtitle: initialData?.subtitle || "",
      question: initialData?.question || "",
      poll_type: initialData?.poll_type || "public",
      expires_at:
        initialData?.expires_at ||
        new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      options: initialData?.options || [
        { option_text: "" },
        { option_text: "" },
      ],
      permitted_branches: initialData?.permitted_branches || [],
      permitted_departments: initialData?.permitted_departments || [],
      permitted_branch_departments:
        initialData?.permitted_branch_departments || [],
    },
  });

  const {
    watch,
    setValue,
    handleSubmit,
    getValues,
    formState: { errors },
  } = form;

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
  // Create mapping from branch_department_id to {branchId, departmentId} for initial data conversion
  const branchDepartmentIdToCombination = React.useMemo(() => {
    const map = new Map<number, { branchId: number; departmentId: number }>();
    if (!branchDepartmentsData?.branch_departments?.results) return map;

    for (const bd of branchDepartmentsData.branch_departments.results) {
      if (
        isManager &&
        managedDepartments &&
        !managedDepartments.includes(bd.id)
      ) {
        continue;
      }

      if (bd.branch?.id && bd.department?.id) {
        map.set(bd.id, {
          branchId: bd.branch.id,
          departmentId: bd.department.id,
        });
      }
    }
    return map;
  }, [branchDepartmentsData, isManager, managedDepartments]);

  // Convert initial permitted_branch_departments to separate branches and departments
  const initialBranchesFromBranchDepts = React.useMemo(() => {
    if (!initialData?.permitted_branch_departments?.length) return [];
    const branchIds = new Set<string>();
    for (const bdId of initialData.permitted_branch_departments) {
      const combo = branchDepartmentIdToCombination.get(bdId);
      if (combo) {
        branchIds.add(String(combo.branchId));
      }
    }
    return Array.from(branchIds);
  }, [
    initialData?.permitted_branch_departments,
    branchDepartmentIdToCombination,
  ]);

  const initialDepartmentsFromBranchDepts = React.useMemo(() => {
    if (!initialData?.permitted_branch_departments?.length) return [];
    const deptIds = new Set<string>();
    for (const bdId of initialData.permitted_branch_departments) {
      const combo = branchDepartmentIdToCombination.get(bdId);
      if (combo) {
        deptIds.add(String(combo.departmentId));
      }
    }
    return Array.from(deptIds);
  }, [
    initialData?.permitted_branch_departments,
    branchDepartmentIdToCombination,
  ]);

  // Track UI selections separately from form state to maintain display
  const [uiBranches, setUiBranches] = React.useState<string[]>(() => {
    // Prefer branches from permitted_branch_departments if both exist
    if (initialBranchesFromBranchDepts.length > 0) {
      return initialBranchesFromBranchDepts;
    }
    return initialData?.permitted_branches || [];
  });
  const [uiDepartments, setUiDepartments] = React.useState<string[]>(() => {
    // Prefer departments from permitted_branch_departments if both exist
    if (initialDepartmentsFromBranchDepts.length > 0) {
      return initialDepartmentsFromBranchDepts;
    }
    return initialData?.permitted_departments || [];
  });

  // Sync UI state with form state on initial load
  React.useEffect(() => {
    if (initialData) {
      // If permitted_branch_departments exists, use those
      if (initialData.permitted_branch_departments?.length) {
        setUiBranches(initialBranchesFromBranchDepts);
        setUiDepartments(initialDepartmentsFromBranchDepts);
      } else {
        // Otherwise use individual arrays
        if (initialData.permitted_branches) {
          setUiBranches(initialData.permitted_branches);
        }
        if (initialData.permitted_departments) {
          setUiDepartments(initialData.permitted_departments);
        }
      }
    }
  }, [
    initialData,
    initialBranchesFromBranchDepts,
    initialDepartmentsFromBranchDepts,
  ]);

  // Handle branch and department changes with conditional payload logic
  const handleBranchesChange = React.useCallback(
    (branchIds: string[]) => {
      setUiBranches(branchIds);
      const currentDepartments = uiDepartments;
      const hasBranches = branchIds.length > 0;
      const hasDepartments = currentDepartments.length > 0;

      if (hasBranches && hasDepartments) {
        // Both selected: compute and set permitted_branch_departments, clear individual arrays
        const branchDeptIds: number[] = [];
        if (branchDepartmentsData?.branch_departments?.results) {
          const branchIdSet = new Set(branchIds.map(Number));
          const deptIdSet = new Set(currentDepartments.map(Number));

          for (const bd of branchDepartmentsData.branch_departments.results) {
            if (
              isManager &&
              managedDepartments &&
              !managedDepartments.includes(bd.id)
            ) {
              continue;
            }

            if (
              bd.branch?.id &&
              branchIdSet.has(bd.branch.id) &&
              bd.department?.id &&
              deptIdSet.has(bd.department.id)
            ) {
              branchDeptIds.push(bd.id);
            }
          }
        }
        setValue("permitted_branch_departments", branchDeptIds);
        setValue("permitted_branches", []);
        setValue("permitted_departments", []);
      } else if (hasBranches) {
        // Only branches: set permitted_branches, clear others
        setValue("permitted_branches", branchIds);
        setValue("permitted_departments", []);
        setValue("permitted_branch_departments", []);
      } else {
        // No branches: clear permitted_branches
        setValue("permitted_branches", []);
        // If no departments either, clear branch_departments
        if (!hasDepartments) {
          setValue("permitted_branch_departments", []);
        }
      }
    },
    [
      uiDepartments,
      branchDepartmentsData,
      isManager,
      managedDepartments,
      setValue,
    ]
  );

  const handleDepartmentsChange = React.useCallback(
    (departmentIds: string[]) => {
      setUiDepartments(departmentIds);
      const currentBranches = uiBranches;
      const hasBranches = currentBranches.length > 0;
      const hasDepartments = departmentIds.length > 0;

      if (hasBranches && hasDepartments) {
        // Both selected: compute and set permitted_branch_departments, clear individual arrays
        const branchDeptIds: number[] = [];
        if (branchDepartmentsData?.branch_departments?.results) {
          const branchIdSet = new Set(currentBranches.map(Number));
          const deptIdSet = new Set(departmentIds.map(Number));

          for (const bd of branchDepartmentsData.branch_departments.results) {
            if (
              isManager &&
              managedDepartments &&
              !managedDepartments.includes(bd.id)
            ) {
              continue;
            }

            if (
              bd.branch?.id &&
              branchIdSet.has(bd.branch.id) &&
              bd.department?.id &&
              deptIdSet.has(bd.department.id)
            ) {
              branchDeptIds.push(bd.id);
            }
          }
        }
        setValue("permitted_branch_departments", branchDeptIds);
        setValue("permitted_branches", []);
        setValue("permitted_departments", []);
      } else if (hasDepartments) {
        // Only departments: set permitted_departments, clear others
        setValue("permitted_departments", departmentIds);
        setValue("permitted_branches", []);
        setValue("permitted_branch_departments", []);
      } else {
        // No departments: clear permitted_departments
        setValue("permitted_departments", []);
        // If no branches either, clear branch_departments
        if (!hasBranches) {
          setValue("permitted_branch_departments", []);
        }
      }
    },
    [uiBranches, branchDepartmentsData, isManager, managedDepartments, setValue]
  );

  const permittedBranches = watch("permitted_branches");
  const permittedDepartments = watch("permitted_departments");
  const permittedBranchDepartments = watch("permitted_branch_departments");

  // Call form data change handler when any watched field changes
  React.useEffect(() => {
    handleFormDataChange();
  }, [
    title,
    subtitle,
    question,
    pollType,
    expiresAt,
    options,
    permittedBranches,
    permittedDepartments,
    permittedBranchDepartments,
    handleFormDataChange,
  ]);

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
      setValue(
        "options",
        currentOptions.filter((_, i) => i !== index)
      );
    }
  };

  const updateOption = (index: number, value: string) => {
    const currentOptions = getValues("options") || [];
    const newOptions = [...currentOptions];
    newOptions[index] = { option_text: value };
    setValue("options", newOptions);
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit || (() => {}))}
      className="grid gap-6">
      <div className="grid grid-cols-12 items-start gap-4 border-b border-[#E9EAEB] pb-4">
        <Label className="col-span-12 md:col-span-2 text-sm">Type:</Label>
        <div className="col-span-12 md:col-span-10">
          <RadioGroup
            value={pollType}
            onValueChange={(value) =>
              setValue("poll_type", value as "public" | "private")
            }
            className="flex gap-6">
            <div className="flex items-center gap-2">
              <RadioGroupItem value="public" id="public" />
              <Label htmlFor="public" className="cursor-pointer text-[#535862]">
                Public
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="private" id="private" />
              <Label
                htmlFor="private"
                className="cursor-pointer text-[#535862]">
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
            <p className="text-sm text-destructive mt-1">
              {errors.title.message}
            </p>
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
            <p className="text-sm text-destructive mt-1">
              {errors.question.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 items-center gap-4 border-b border-[#E9EAEB] pb-4">
        <Label className="col-span-12 md:col-span-2 text-sm">
          Expiration Date:
        </Label>
        <div className="col-span-12 md:col-span-10">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal border-[#E2E8F0]",
                  !expiresAt && "text-muted-foreground"
                )}>
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
            <p className="text-sm text-destructive mt-1">
              {errors.expires_at.message}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-12 items-start gap-4 border-b border-[#E9EAEB] pb-4">
        <Label className="col-span-12 md:col-span-2 text-sm">
          Poll Options:
        </Label>
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
                  className="text-destructive hover:text-destructive">
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
            className="w-full border-[#E2E8F0]">
            <Plus className="mr-2 h-4 w-4" />
            Add Option
          </Button>
        </div>
      </div>

      {/* Role-based access controls */}
      <div className="border-b border-[#E9EAEB] pb-4">
        <IndependentBranchDepartmentSelector
          selectedBranches={uiBranches}
          selectedDepartments={uiDepartments}
          onBranchesChange={handleBranchesChange}
          onDepartmentsChange={handleDepartmentsChange}
          allowMultiple={true}
          branchLabel="Branch Access:"
          departmentLabel="Department Access:"
          branchPlaceholder="Select branches (empty = public access)"
          departmentPlaceholder="Select departments (empty = public access)"
          managedDepartments={isManager ? managedDepartments : undefined}
        />
        <p className="mt-1 text-xs text-muted-foreground ml-[16.666667%] md:ml-0">
          Select only branches, only departments, or both. If both are selected,
          branch-department combinations will be used.
        </p>
      </div>
    </form>
  );
}
