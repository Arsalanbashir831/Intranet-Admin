
import { Button } from "@/components/ui/button";

// --- App Modal ---

export interface AppModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  // Accept either a React node (e.g., Lucide icon) or a string path to a public icon
  icon?: React.ReactNode | string;
  children?: React.ReactNode;
  className?: string;
  showFooter?: boolean;
  cancelText?: string;
  confirmText?: string;
  confirmVariant?: React.ComponentProps<typeof Button>["variant"];
  confirmDisabled?: boolean;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
  footerSlot?: React.ReactNode; // fully custom footer overrides default
}

// --- Page Header ---

export interface Crumb {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  title: string;
  crumbs: Crumb[];
  action?: React.ReactNode;
  className?: string;
}

// --- Comfirm Popover ---

export interface ConfirmPopoverProps {
  children: React.ReactNode; // trigger
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => Promise<void> | void;
  disabled?: boolean;
}

// --- Select Filter ---

export interface SelectFilterProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  options: { value: string; label: string }[];
}

// --- Employee Selector ---

export interface Employee {
  id: number | string;
  emp_name?: string;
  email?: string | null;
  profile_picture?: string | null;
}

export interface EmployeeSelectorProps {
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
}

// --- Branch & Department Selectors ---

export interface BranchDepartmentSelectorProps {
  value?: string[];
  onChange: (branchDepartmentIds: string[]) => void;
  allowMultiple?: boolean;
  disabled?: boolean;
  branchLabel?: string;
  departmentLabel?: string;
  branchPlaceholder?: string;
  departmentPlaceholder?: string;
  className?: string;
  managedDepartments?: number[];
  initialBranchDepartmentIds?: string[];
}

export interface IndependentBranchDepartmentSelectorProps {
  selectedBranches: string[];
  selectedDepartments: string[];
  onBranchesChange: (branchIds: string[]) => void;
  onDepartmentsChange: (departmentIds: string[]) => void;
  allowMultiple?: boolean;
  disabled?: boolean;
  branchLabel?: string;
  departmentLabel?: string;
  branchPlaceholder?: string;
  departmentPlaceholder?: string;
  className?: string;
  managedDepartments?: number[];
}
