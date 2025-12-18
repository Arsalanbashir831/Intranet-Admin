/**
 * Type definitions for Roles domain
 * Core entity types for roles
 */

export type AccessLevel = "employee" | "manager" | "executive";

export type Role = {
  id: number;
  name: string;
  access_level: AccessLevel;
};

export type RoleRow = {
  id: string;
  name: string;
  access_level: AccessLevel;
};

export type RoleListResponse = {
  roles: {
    count: number;
    page: number;
    page_size: number;
    results: Role[];
  };
};

export type RoleCreateRequest = {
  name: string;
  access_level: AccessLevel;
} & Record<string, string | number | boolean | File | Blob | string[] | null | undefined>;

export type RoleUpdateRequest = {
  name?: string;
  access_level?: AccessLevel;
} & Record<string, string | number | boolean | File | Blob | string[] | null | undefined>;

export type AccessLevelSelectProps = {
	value: AccessLevel;
	onChange: (value: AccessLevel) => void;
	disabled?: boolean;
	triggerClassName?: string;
	placeholder?: string;
};

export type EditRoleModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  role: Role | null;
};

export type NewRoleModalProps = {
    open: boolean;
    setOpen: (open: boolean) => void;
};
