"use client";

import { useState, useMemo, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxGroup,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox";
import { ChevronDown } from "lucide-react";
import { useDebounce } from "../../hooks/use-debounce";

export type Employee = {
  id: number | string;
  emp_name?: string;
  email?: string | null;
  profile_picture?: string | null;
};

export type EmployeeSelectorProps = {
  /** Currently selected employee ID */
  value?: string;
  /** Callback when employee selection changes */
  onValueChange: (employeeId: string) => void;
  /** Placeholder text for the selector */
  placeholder?: string;
  /** Search placeholder text */
  searchPlaceholder?: string;
  /** Custom hook for fetching all employees */
  useAllEmployees: () => {
    data?: { results: Employee[] };
    isLoading: boolean;
  };
  /** Custom hook for searching employees */
  useSearchEmployees: (query: string) => {
    data?: { results: Employee[] };
    isLoading: boolean;
  };
  /** Optional className for styling */
  className?: string;
  /** Whether the selector is disabled */
  disabled?: boolean;
};

export function EmployeeSelector({
  value,
  onValueChange,
  placeholder = "Select employee...",
  searchPlaceholder = "Search employees...",
  useAllEmployees,
  useSearchEmployees,
  className,
  disabled = false,
}: EmployeeSelectorProps) {
  const [localSearchQuery, setLocalSearchQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const debouncedSearchQuery = useDebounce(localSearchQuery, 300); // 300ms debounce

  // Reset local search when cleared externally
  useEffect(() => {
    if (!localSearchQuery) {
      setLocalSearchQuery("");
    }
  }, [localSearchQuery]);

  // Keep dropdown open when search is active
  useEffect(() => {
    if (localSearchQuery.length > 0) {
      setIsOpen(true);
    }
  }, [localSearchQuery]);

  // Fetch data using provided hooks
  const { data: allEmployeesData, isLoading: allEmployeesLoading } = useAllEmployees();
  const { data: searchResults, isLoading: searchLoading } = useSearchEmployees(debouncedSearchQuery);

  // Transform employees data
  const availableEmployees = useMemo(() => {
    const list = debouncedSearchQuery ? (searchResults?.results ?? []) : (allEmployeesData?.results ?? []);
    
    return list.map((emp: Employee) => ({
      value: String(emp.id),
      label: emp.emp_name || "",
      username: emp.email ? emp.email.split('@')[0] : "user",
      avatar: emp.profile_picture,
    }));
  }, [debouncedSearchQuery, searchResults, allEmployeesData]);

  // Ensure dropdown stays open when data changes during search
  useEffect(() => {
    if (localSearchQuery.length > 0) {
      setIsOpen(true);
    }
  }, [availableEmployees, localSearchQuery]);

  const isLoadingEmployees = debouncedSearchQuery ? searchLoading : allEmployeesLoading;

  const handleValueChange = (selectedValue: string) => {
    onValueChange(selectedValue);
    setLocalSearchQuery(""); // Clear search when selected
    setIsOpen(false); // Close after selection
  };

  return (
    <Combobox
      data={availableEmployees as unknown as { value: string; label: string; username: string; avatar: string }[]}
      type="Employee"
      value={value ?? ""}
      open={isOpen}
      onOpenChange={(open) => {
        // Prevent closing if user is actively searching
        if (!open && localSearchQuery.length > 0) {
          return; // Don't close while searching
        }
        setIsOpen(open);
      }}
      onValueChange={handleValueChange}
    >
      <ComboboxTrigger 
        className={className}
        disabled={disabled}
      >
        <span className="flex w-full items-center justify-between gap-2">
          {value ? (
            <span className="flex items-center gap-2 truncate">
              {(() => {
                const selectedEmployee = availableEmployees.find(
                  (emp) => emp.value === value
                );
                if (!selectedEmployee) return null;
                const initials = selectedEmployee.label
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("");
                return (
                  <>
                    <Avatar className="size-8">
                      <AvatarImage src={selectedEmployee.avatar || undefined} alt={selectedEmployee.label} />
                      <AvatarFallback className="text-[10px]">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="truncate text-left">
                      <span className="block text-sm leading-4">
                        {selectedEmployee.label}
                      </span>
                      <span className="block text-xs text-muted-foreground leading-4">
                        @{selectedEmployee.username}
                      </span>
                    </span>
                  </>
                );
              })()}
            </span>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronDown className="shrink-0 text-muted-foreground" size={16} />
        </span>
      </ComboboxTrigger>
      <ComboboxContent shouldFilter={false}>
        <ComboboxInput 
          placeholder={searchPlaceholder}
          value={localSearchQuery}
          onValueChange={(searchValue) => {
            setLocalSearchQuery(searchValue);
            setIsOpen(true); // Force open when typing
          }}
          onFocus={() => setIsOpen(true)} // Open when focused
          onKeyDown={(e) => {
            // Prevent closing on any key press
            if (e.key !== 'Escape') {
              setIsOpen(true);
            }
          }}
        />
        <ComboboxEmpty>
          {isLoadingEmployees ? "Loading..." : "No employees found."}
        </ComboboxEmpty>
        <ComboboxList>
          <ComboboxGroup>
            {availableEmployees.map((emp) => (
              <ComboboxItem key={emp.value} value={emp.value}>
                <div className="flex items-center gap-2">
                  <Avatar className="size-8">
                    <AvatarImage src={emp.avatar || undefined} alt={emp.label} />
                    <AvatarFallback className="text-[10px]">
                      {emp.label
                        .split(" ")
                        .map((n: string) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="leading-tight">
                    <div className="text-sm">{emp.label}</div>
                    <div className="text-xs text-muted-foreground">@{emp.username}</div>
                  </div>
                </div>
              </ComboboxItem>
            ))}
          </ComboboxGroup>
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
}