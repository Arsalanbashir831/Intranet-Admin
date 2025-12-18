
import { ColumnDef, Table, Column, Row, SortingState, ColumnSort } from "@tanstack/react-table";

// --- Filters ---

export interface BaseFilterProps {
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

export interface DepartmentFilterProps extends BaseFilterProps {}
export interface BranchFilterProps extends BaseFilterProps {}
export interface BranchDepartmentFilterProps extends BaseFilterProps {}
export interface RoleFilterProps extends BaseFilterProps {}
export interface SearchFilterProps extends BaseFilterProps {
  label?: string;
}

export interface FilterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApply?: (filters: Record<string, unknown>) => void;
  onReset?: () => void;
  showFilterButton?: boolean;
  showResetButton?: boolean;
  children: React.ReactNode;
  title?: string;
  description?: string;
  applyText?: string;
  resetText?: string;
}

export interface FilterTriggerProps {
  onClick: () => void;
  isActive?: boolean;
  className?: string;
  children?: React.ReactNode;
}

// --- Sorting ---

export interface SortingDropdownProps {
  sortOptions: { label: string; value: string }[];
  activeSort: string;
  onSortChange: (value: string) => void;
}

// --- Search ---

export interface TableSearchProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

// --- Table Components ---

export interface CardTableColumnHeaderProps<TData> {
  column: Column<TData, unknown>;
  title: string;
}

export interface CardTablePaginationProps<TData> {
  table: Table<TData>;
  paginationInfo?: {
    count: number;
    page: number;
    page_size: number;
  };
  onPageChange?: (page: number, pageSize: number) => void;
}

export interface CardTableToolbarProps {
  title: string;
  placeholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onSortChange?: (value: string) => void;
  onFilterClick?: () => void;
  className?: string;
  showSortOptions?: boolean;
  showFilters?: boolean;
  sortOptions?: { label: string; value: string }[];
  activeSort?: string;
  accessControl?: React.ReactNode;
}

export interface CardTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  className?: string;
  toolbar?: React.ReactNode;
  footer?: (table: Table<TData>) => React.ReactNode;
  rowClassName?: (row: TData) => string | undefined;
  sorting?: SortingState;
  onSortingChange?: (state: SortingState) => void;
  headerClassName?: string;
  onRowClick?: (row: Row<TData>) => void;
  noResultsContent?: React.ReactNode;
  wrapRow?: (rowElement: React.ReactNode, row: Row<TData>) => React.ReactNode;
}
