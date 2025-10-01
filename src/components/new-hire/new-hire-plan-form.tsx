"use client";

import * as React from "react";
import { SelectableTags, type SelectableItem, createCustomSelectableItems } from "@/components/ui/selectable-tags";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChecklistCard } from "./checklist-card";
import { Card } from "../ui/card";
import { useEmployees, useSearchEmployees } from "@/hooks/queries/use-employees";
import { useDepartments } from "@/hooks/queries/use-departments";

export type ChecklistItemData = { 
  id: string; 
  title: string; 
  body: string; 
  type: "task" | "training";
  files?: File[];
  existingFiles?: Array<{
    id: number;
    attachment: number;
    file: string;
    uploaded_at: string;
  }>;
};

type ApiEmployee = {
  id: number | string;
  full_name: string;
  username?: string;
  department_name?: string;
  profile_picture_url?: string;
};

export type NewHirePlanFormData = {
  assignees: string[];
  taskItems: ChecklistItemData[];
  trainingItems: ChecklistItemData[];
};

export interface NewHirePlanFormProps {
  onFormDataChange?: (data: NewHirePlanFormData) => void;
  initialData?: {
    assignees?: string[];
    taskItems?: ChecklistItemData[];
    trainingItems?: ChecklistItemData[];
  };
}

export function NewHirePlanForm({ onFormDataChange, initialData }: NewHirePlanFormProps) {
  const [assignees, setAssignees] = React.useState<string[]>(initialData?.assignees || []);
  const [taskItems, setTaskItems] = React.useState<ChecklistItemData[]>(initialData?.taskItems || []);
  const [trainingItems, setTrainingItems] = React.useState<ChecklistItemData[]>(initialData?.trainingItems || []);
  
  // Update state when initialData changes
  React.useEffect(() => {
    if (initialData) {
      setAssignees(initialData.assignees || []);
      setTaskItems(initialData.taskItems || []);
      setTrainingItems(initialData.trainingItems || []);
    }
  }, [initialData]);
  
  // Load all employees data and departments for mapping
  const { data: allEmployeesData } = useEmployees();
  const { data: departmentsData } = useDepartments();
  
  // Create branch-department lookup map
  const branchDeptMap = React.useMemo(() => {
    const map = new Map<number, string>();
    if (departmentsData?.departments?.results) {
      departmentsData.departments.results.forEach(dept => {
        dept.branch_departments?.forEach(branchDept => {
          map.set(branchDept.id, dept.dept_name);
        });
      });
    }
    return map;
  }, [departmentsData]);
  
  const allEmployees: ApiEmployee[] = React.useMemo(() => {
    if (!allEmployeesData) return [];
    const list = Array.isArray(allEmployeesData) ? allEmployeesData : (allEmployeesData?.employees?.results ?? []);
    return (list as {
      id: number | string;
      emp_name: string;
      profile_picture?: string | null;
      branch_department?: number; // This is a number ID
    }[]).map((e) => ({
      id: e.id,
      full_name: e.emp_name,
      username: undefined,
      department_name: branchDeptMap.get(Number(e.branch_department)) || 'Unknown', // Map branch_department ID to dept name
      profile_picture_url: e.profile_picture || undefined,
    }));
  }, [allEmployeesData, branchDeptMap]);
  
  // Create hooks for SelectableTags async search with proper data transformation
  const useAllEmployees = React.useCallback(() => {
    const { data, isLoading } = useEmployees();
    
    const transformedData = React.useMemo(() => {
      if (!data) return undefined;
      const list = Array.isArray(data) ? data : (data?.employees?.results ?? []);
      return {
        results: createCustomSelectableItems(
          list as { id: number | string; emp_name: string; }[],
          'id',
          'emp_name'
        )
      };
    }, [data]);
    
    return { data: transformedData, isLoading };
  }, []);
  
  const useEmployeeSearch = React.useCallback((query: string) => {
    const { data, isLoading } = useSearchEmployees(query);
    
    const transformedData = React.useMemo(() => {
      if (!data) return undefined;
      return {
        results: createCustomSelectableItems(
          data.results,
          'id',
          'emp_name'
        )
      };
    }, [data]);
    
    return { data: transformedData, isLoading };
  }, []);
  // Notify parent component of form data changes
  React.useEffect(() => {
    if (onFormDataChange) {
      onFormDataChange({
        assignees,
        taskItems,
        trainingItems,
      });
    }
  }, [assignees, taskItems, trainingItems, onFormDataChange]);

  // Helper function to get employee by ID for rendering (no hooks)
  const getEmployeeById = React.useCallback((id: string) => {
    return allEmployees.find((u) => String(u.id) === id);
  }, [allEmployees]);

  return (
    <div className="space-y-4">
      <Card className="space-y-4 border-[#FFF6F6] shadow-none px-5">
        <div >
          <h3 className="text-xl font-semibold text-foreground">Recent New Hire Plans</h3>
          <div className="mt-3">
            <SelectableTags
              items={[]} // Not used when using async search
              selectedItems={assignees}
              onSelectionChange={setAssignees}
              placeholder="Assigned to"
              searchPlaceholder="Search people..."
              emptyMessage="No people found."
              useSearch={useEmployeeSearch}
              useAllItems={useAllEmployees}
              searchDebounce={300}
              renderSelected={(id) => {
                const u = getEmployeeById(id);
                if (!u) return null;
                const initials = (u.full_name || "")
                  .split(" ")
                  .map((n) => n[0])
                  .join("");
                return (
                  <div className="flex items-center gap-2">
                    <Avatar className="size-6">
                      <AvatarImage src={u.profile_picture_url} alt={u.full_name} />
                      <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="leading-tight text-left">
                      <div className="text-xs text-[#2E2E2E]">{u.full_name}</div>
                      <div className="text-[10px] text-muted-foreground">{u.department_name ?? "—"}</div>
                    </div>
                  </div>
                );
              }}
              renderItem={(id) => {
                const u = getEmployeeById(id);
                if (!u) return null;
                const initials = (u.full_name || "")
                  .split(" ")
                  .map((n) => n[0])
                  .join("");
                return (
                  <div className="flex items-center gap-3 py-2">
                    <Avatar className="size-8">
                      <AvatarImage src={u.profile_picture_url} alt={u.full_name} />
                      <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                    </Avatar>
                    <div className="leading-tight text-left flex-1">
                      <div className="text-sm font-medium text-[#0D141C]">{u.full_name}</div>
                      <div className="text-xs text-muted-foreground">{u.department_name ?? "—"}</div>
                    </div>
                  </div>
                );
              }}
            />
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2">
          <ChecklistCard 
            title="Tasks Checklist" 
            initial={taskItems} 
            variant="task" 
            onItemsChange={setTaskItems}
          />
          <ChecklistCard 
            title="Training Checklist" 
            initial={trainingItems} 
            variant="training" 
            onItemsChange={setTrainingItems}
          />
        </div>
      </Card>
    </div>
  );
}


