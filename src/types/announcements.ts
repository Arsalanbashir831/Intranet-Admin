/**
 * Type definitions for Announcements domain
 * Extracted from OpenAPI schema
 */

export type AnnouncementTypeEnum = "announcement" | "policy";

export type Announcement = {
  readonly id: number;
  title: string;
  body: string;
  type?: AnnouncementTypeEnum;
  hash_tags?: unknown;
  is_active?: boolean;
  inherits_parent_permissions?: boolean;
  permitted_branches?: number[];
  permitted_departments?: number[];
  permitted_branch_departments?: number[];
  permitted_employees?: number[];
  created_by?: number | null;
  readonly created_at: string;
  readonly updated_at: string;
  readonly attachments: {
    [key: string]: unknown;
  }[];
  readonly effective_permissions: {
    [key: string]: unknown;
  };
  readonly permitted_branches_details: string;
  readonly permitted_departments_details: string;
  readonly permitted_employees_details: string;
  readonly created_by_details: string;
};

export type AnnouncementAttachment = {
  readonly id: number;
  announcement: number;
  name: string;
  description?: string;
  file: string;
  readonly file_url: string | null;
  inherits_parent_permissions?: boolean;
  permitted_branches?: number[];
  permitted_departments?: number[];
  permitted_employees?: number[];
  uploaded_by?: number | null;
  readonly uploaded_at: string;
  readonly size: number;
  readonly content_type: string;
  readonly effective_permissions: {
    [key: string]: unknown;
  };
};

export type PaginatedAnnouncementList = {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: Announcement[];
};

export type PatchedAnnouncement = {
  readonly id?: number;
  title?: string;
  body?: string;
  type?: AnnouncementTypeEnum;
  hash_tags?: unknown;
  is_active?: boolean;
  inherits_parent_permissions?: boolean;
  permitted_branches?: number[];
  permitted_departments?: number[];
  permitted_branch_departments?: number[];
  permitted_employees?: number[];
  created_by?: number | null;
  readonly created_at?: string;
  readonly updated_at?: string;
  readonly attachments?: {
    [key: string]: unknown;
  }[];
  readonly effective_permissions?: {
    [key: string]: unknown;
  };
  readonly permitted_branches_details?: string;
  readonly permitted_departments_details?: string;
  readonly permitted_employees_details?: string;
  readonly created_by_details?: string;
};

export type AnnouncementListResponse = {
  announcements: {
    count: number;
    page: number;
    page_size: number;
    results: Announcement[];
  };
};

// Request types for creating announcements
export type AnnouncementCreateRequest = {
  title: string;
  body: string;
  type?: AnnouncementTypeEnum;
  inherits_parent_permissions?: boolean;
  permitted_branches?: number[];
  permitted_departments?: number[];
  permitted_branch_departments?: number[];
  is_active?: boolean;
};

// Request types for updating announcements
export type AnnouncementUpdateRequest = {
  title?: string;
  body?: string;
  type?: AnnouncementTypeEnum;
  inherits_parent_permissions?: boolean;
  permitted_branches?: number[];
  permitted_departments?: number[];
  permitted_branch_departments?: number[];
  is_active?: boolean;
};

// Announcement attachment types
export type AnnouncementAttachmentListResponse = {
  attachments: {
    count: number;
    page: number;
    page_size: number;
    results: AnnouncementAttachment[];
  };
};

export type AnnouncementAttachmentCreateRequest = {
  announcement: number;
  name: string;
  description?: string;
  file: File;
  inherits_parent_permissions?: boolean;
  permitted_branches?: number[];
  permitted_departments?: number[];
  permitted_employees?: number[];
};

export type AnnouncementAttachmentUpdateRequest = {
  name?: string;
  description?: string;
  file?: File;
  inherits_parent_permissions?: boolean;
  permitted_branches?: number[];
  permitted_departments?: number[];
  permitted_employees?: number[];
};

export type AnnouncementRateParams = {
  start_date: string;
  end_date: string;
  filter: string;
};

export type AnnouncementRateResponse = {
  results: Array<{
    period: string;
    count: number;
  }>;
  filter: string;
  start_date: string;
  end_date: string;
};

export type AnnouncementRow = {
  id: string;
  title: string;
  access: string;
  date: string;
  type: string;
  status: "Published" | "Draft";
};