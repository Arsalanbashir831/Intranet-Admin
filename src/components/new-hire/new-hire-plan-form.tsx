"use client";

import * as React from "react";
import {
  SelectableTags,
  createCustomSelectableItems,
} from "@/components/ui/selectable-tags";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChecklistCard } from "./checklist-card";
import { Card } from "../ui/card";
import {
  useEmployees,
  useSearchEmployees,
} from "@/hooks/queries/use-employees";

import {
  ChecklistItemData,
  NewHirePlanFormProps,
  ApiEmployee,
} from "@/types/new-hire";
import { transformEmployeeData } from "@/handlers/new-hire-handlers";

export function NewHirePlanForm({
  onFormDataChange,
  initialData,
}: NewHirePlanFormProps) {
  // Use local state for immediate UI updates
  const [localAssignees, setLocalAssignees] = React.useState<string[]>(
    initialData?.assignees || []
  );
  const [localTrainingItems, setLocalTrainingItems] = React.useState<
    ChecklistItemData[]
  >(initialData?.trainingItems || []);

  // Sync with initialData when it changes
  React.useEffect(() => {
    setLocalAssignees(initialData?.assignees || []);
    setLocalTrainingItems(initialData?.trainingItems || []);
  }, [initialData]);

  // Create setters that work with local state and notify parent
  const setAssignees = React.useCallback(
    (newAssignees: string[]) => {
      setLocalAssignees(newAssignees);
      if (onFormDataChange) {
        onFormDataChange({
          assignees: newAssignees,
          trainingItems: localTrainingItems,
        });
      }
    },
    [onFormDataChange, localTrainingItems]
  );

  const setTrainingItems = React.useCallback(
    (newTrainingItems: ChecklistItemData[]) => {
      setLocalTrainingItems(newTrainingItems);
      if (onFormDataChange) {
        onFormDataChange({
          assignees: localAssignees,
          trainingItems: newTrainingItems,
        });
      }
    },
    [onFormDataChange, localAssignees]
  );

  // Load all employees data (no need for departments since we get expanded data)
  const { data: allEmployeesData } = useEmployees();

  const allEmployees: ApiEmployee[] = React.useMemo(() => {
    return transformEmployeeData(allEmployeesData);
  }, [allEmployeesData]);

  // Transform employee data for SelectableTags
  const employeesData = useEmployees();
  const transformedEmployees = React.useMemo(() => {
    if (!employeesData.data) return undefined;
    const list = Array.isArray(employeesData.data)
      ? employeesData.data
      : employeesData.data?.employees?.results ?? [];
    return createCustomSelectableItems(
      list as { id: number | string; emp_name: string }[],
      "id",
      "emp_name"
    );
  }, [employeesData.data]);

  // Create hooks for SelectableTags async search with proper data transformation
  const useAllEmployees = React.useCallback(() => {
    return { data: transformedEmployees, isLoading: employeesData.isLoading };
  }, [transformedEmployees, employeesData.isLoading]);

  // Transform data using hooks at the top level
  const searchEmployees = useSearchEmployees;

  const useEmployeeSearch = React.useCallback(
    (query: string) => {
      const searchData = searchEmployees(query);

      // Transform the search results to match SelectableTags expected format
      const transformedSearchData = {
        data: searchData.data
          ? createCustomSelectableItems(
              searchData.data.results,
              "id",
              "emp_name"
            )
          : undefined,
        isLoading: searchData.isLoading,
      };

      return transformedSearchData;
    },
    [searchEmployees]
  );

  // Helper function to get employee by ID for rendering (no hooks)
  const getEmployeeById = React.useCallback(
    (id: string) => {
      return allEmployees.find((u) => String(u.id) === id);
    },
    [allEmployees]
  );

  return (
    <div className="space-y-4">
      <Card className="space-y-4 border-[#FFF6F6] shadow-none px-5">
        <div>
          <h3 className="text-xl font-semibold text-foreground">
            Recent Training Checklists
          </h3>
          <div className="mt-3">
            <SelectableTags
              items={[]} // Not used when using async search
              selectedItems={localAssignees}
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
                      <AvatarImage
                        src={u.profile_picture_url}
                        alt={u.full_name}
                      />
                      <AvatarFallback className="text-[10px]">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="leading-tight text-left">
                      <div className="text-xs text-[#2E2E2E]">
                        {u.full_name}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {u.department_name ?? "—"}
                      </div>
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
                      <AvatarImage
                        src={u.profile_picture_url}
                        alt={u.full_name}
                      />
                      <AvatarFallback className="text-xs">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="leading-tight text-left flex-1">
                      <div className="text-sm font-medium text-[#0D141C]">
                        {u.full_name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {u.department_name ?? "—"}
                      </div>
                    </div>
                  </div>
                );
              }}
            />
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-1">
          {/* <ChecklistCard 
            title="Tasks Checklist" 
            initial={taskItems} 
            variant="task" 
            onItemsChange={setTaskItems}
          /> */}
          <ChecklistCard
            title="Training Checklists"
            initial={localTrainingItems}
            variant="training"
            onItemsChange={setTrainingItems}
          />
        </div>
      </Card>
    </div>
  );
}
