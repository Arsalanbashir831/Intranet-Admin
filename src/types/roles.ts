/**
 * Type definitions for Roles domain
 * Core entity types for roles
 */

export type Role = {
  id: number;
  name: string;
  access_level: "employee" | "manager" | "executive";
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
  access_level: "employee" | "manager" | "executive";
} & Record<string, string | number | boolean | File | Blob | string[] | null | undefined>;

export type RoleUpdateRequest = {
  name?: string;
  access_level?: "employee" | "manager" | "executive";
} & Record<string, string | number | boolean | File | Blob | string[] | null | undefined>;