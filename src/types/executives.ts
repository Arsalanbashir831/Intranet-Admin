/**
 * Type definitions for Executives domain
 * Extracted from OpenAPI schema
 */

export type Executive = {
  readonly id: number;
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
  role: string;
  bio?: string;
  profile_picture?: string | null;
  readonly created_at: string;
  readonly updated_at: string;
};

export type PaginatedExecutiveList = {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: Executive[];
};

export type PatchedExecutive = {
  readonly id?: number;
  name?: string;
  address?: string;
  city?: string;
  phone?: string;
  email?: string;
  role?: string;
  bio?: string;
  profile_picture?: string | null;
  readonly created_at?: string;
  readonly updated_at?: string;
};

