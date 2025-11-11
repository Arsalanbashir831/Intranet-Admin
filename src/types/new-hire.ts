/**
 * Type definitions for New Hire domain
 * Extracted from OpenAPI schema
 */

import { Employee } from "./employees";

export type StatusEnum = "draft" | "publish";

export type AttachmentTypeEnum = "task" | "training";

export type Checklist = {
  readonly id: number;
  title?: string | null;
  detail?: string | null;
  assigned_to: number[];
  assigned_by?: number | null;
  readonly assigned_to_details: Employee[];
  readonly assigned_by_details: Employee;
  readonly department_details: string;
  status?: StatusEnum;
  readonly created_at: string;
  readonly updated_at: string;
  readonly attachments: Attachment[];
};

export type Attachment = {
  readonly id: number;
  checklist: number;
  title: string;
  detail?: string | null;
  type?: AttachmentTypeEnum;
  readonly created_at: string;
  readonly files: AttachmentFile[];
};

export type AttachmentFile = {
  readonly id: number;
  attachment: number;
  file: string;
  readonly uploaded_at: string;
};

export type PaginatedChecklistList = {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: Checklist[];
};

export type PaginatedAttachmentList = {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: Attachment[];
};

export type PaginatedAttachmentFileList = {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: AttachmentFile[];
};

export type PatchedChecklist = {
  readonly id?: number;
  title?: string | null;
  detail?: string | null;
  assigned_to?: number[];
  assigned_by?: number | null;
  readonly assigned_to_details?: Employee[];
  readonly assigned_by_details?: Employee;
  readonly department_details?: string;
  status?: StatusEnum;
  readonly created_at?: string;
  readonly updated_at?: string;
  readonly attachments?: Attachment[];
};

export type PatchedAttachment = {
  readonly id?: number;
  checklist?: number;
  title?: string;
  detail?: string | null;
  type?: AttachmentTypeEnum;
  readonly created_at?: string;
  readonly files?: AttachmentFile[];
};

export type PatchedAttachmentFile = {
  readonly id?: number;
  attachment?: number;
  file?: string;
  readonly uploaded_at?: string;
};

export type ChecklistCreateRequest = {
  title?: string | null;
  detail?: string | null;
  assigned_to: number[];
  assigned_by: number | null;
  status?: StatusEnum;
};

// Request types for updating checklists
export type ChecklistUpdateRequest = {
  title?: string | null;
  detail?: string | null;
  assigned_to?: number[];
  assigned_by?: number | null;
  status?: StatusEnum;
};

// Request types for creating attachments
export type AttachmentCreateRequest = {
  checklist: number;
  title: string;
  detail?: string | null;
  type?: AttachmentTypeEnum;
  deadline?: string | null;
};

// Request types for updating attachments
export type AttachmentUpdateRequest = {
  title?: string;
  detail?: string | null;
  type?: AttachmentTypeEnum;
  deadline?: string | null;
};

// Request types for creating attachment files
export type AttachmentFileCreateRequest = {
  attachment: number;
  file: File;
};

export type ExecutiveTrainingChecklistAttachment = {
  id: number;
  file: string;
  uploaded_at: string;
};

export type AttachmentStatus = "to_do" | "in_progress" | "done";

export type ExecutiveTrainingChecklistEmployee = {
  employee_id: number;
  employee_name: string;
  employee_email: string;
  avatar: string | null;
  status: AttachmentStatus;
  status_display: string;
  updated_at: string;
};

export type ExecutiveTrainingChecklistListResponse = {
  id: number;
  title: string;
  description: string;
  deadline: string | null;
  attachment: ExecutiveTrainingChecklistAttachment[];
  employees: ExecutiveTrainingChecklistEmployee[];
};