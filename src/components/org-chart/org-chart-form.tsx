"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dropzone } from "@/components/ui/dropzone";
import { SelectableTags } from "@/components/ui/selectable-tags";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	useCreateEmployee,
	useUpdateEmployee,
} from "@/hooks/queries/use-employees";
import { useRoles } from "@/hooks/queries/use-roles";
import { useManagerScope } from "@/contexts/manager-scope-context";
import { useBranchDepartments, useSearchBranchDepartments } from "@/hooks/queries/use-branches";

import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";
import type { EmployeeUpdateRequest } from "@/services/employees";
export type OrgChartInitialValues = {
	emp_name?: string;
	email?: string | null;
	phone?: string | null;
	role?: string | null;
	education?: string | null;
	bio?: string | null;
	branch_department?: string | string[]; // id(s) as string(s) for UI select - single for regular employees, array for managers
	profileImageUrl?: string;
};

export function OrgChartForm({
	initialValues,
	onRegisterSubmit,
	isEdit = false,
	employeeId,
	onSubmitComplete,
}: {
	initialValues?: OrgChartInitialValues;
	onRegisterSubmit?: (submit: () => void) => void;
	isEdit?: boolean;
	employeeId?: string;
	onSubmitComplete?: (success: boolean) => void;
}) {
	// Get manager scope to filter departments
	const { isManager, managedDepartments } = useManagerScope();
	
	// Fetch roles from API
	const { data: rolesData } = useRoles(undefined, { pageSize: 1000 });
	
	// Get available roles and filter out manager roles if user is a manager
	const availableRoles = React.useMemo(() => {
		if (!rolesData?.roles?.results) return [];
		
		return rolesData.roles.results.filter(role => {
			// If user is a manager, filter out roles with access_level="manager"
			if (isManager && role.access_level === "manager") {
				return false;
			}
			return true;
		});
	}, [rolesData, isManager]);
	
	// Create adapter functions for async search using branch departments API
	const useAllDepartments = () => {
		const result = useBranchDepartments(undefined, { pageSize: 1000 });
		const branchDeptItems = React.useMemo(() => {
			if (!result.data?.branch_departments?.results) return [];
			
			const items: { id: string; label: string }[] = [];
			for (const bd of result.data.branch_departments.results) {
				const bdId = String(bd.id);
				const branchName = String(bd.branch?.branch_name ?? "");
				const deptName = String(bd.department?.dept_name ?? "");
				
				// Filter: If manager, only show their managed departments
				if (isManager && !managedDepartments.includes(bd.id)) {
					continue; // Skip this department
				}
				
				items.push({ id: bdId, label: `${deptName} - ${branchName}` });
			}
			return items;
		}, [result.data, isManager, managedDepartments]);

		return {
			data: branchDeptItems,
			isLoading: result.isLoading,
		};
	};

	const useSearchDepartmentsAdapter = (query: string) => {
		const result = useSearchBranchDepartments(query, { pageSize: 1000 });
		const branchDeptItems = React.useMemo(() => {
			if (!result.data?.branch_departments?.results) return [];
			
			const items: { id: string; label: string }[] = [];
			for (const bd of result.data.branch_departments.results) {
				const bdId = String(bd.id);
				const branchName = String(bd.branch?.branch_name ?? "");
				const deptName = String(bd.department?.dept_name ?? "");
				
				// Filter: If manager, only show their managed departments
				if (isManager && !managedDepartments.includes(bd.id)) {
					continue; // Skip this department
				}
				
				items.push({ id: bdId, label: `${deptName} - ${branchName}` });
			}
			return items;
		}, [result.data, isManager, managedDepartments]);

		return {
			data: branchDeptItems,
			isLoading: result.isLoading,
		};
	};

	// File upload state
	const [selectedFiles, setSelectedFiles] = React.useState<File[]>([]);
	const [isRemovingPicture, setIsRemovingPicture] = React.useState(false);

	// Branch department selection - single or multiple depending on role
	const [selectedBranchDeptIds, setSelectedBranchDeptIds] = React.useState<
		string[]
	>(() => {
		if (!initialValues?.branch_department) return [];
		// Support both single string and array of strings
		if (Array.isArray(initialValues.branch_department)) {
			return initialValues.branch_department;
		}
		return [initialValues.branch_department];
	});

	// Role selection state - store as string for Select component, convert to number for API
	// Initialize with first available role if no initial value
	const [selectedRole, setSelectedRole] = React.useState<string>(
		initialValues?.role ? String(initialValues.role) : ""
	);
	
	// Set default role when roles are loaded
	React.useEffect(() => {
		if (!selectedRole && availableRoles.length > 0) {
			setSelectedRole(String(availableRoles[0].id));
		}
	}, [availableRoles, selectedRole]);

	// Rich text content state for education is plain string
	const [educationHtml, setEducationHtml] = React.useState<string | undefined>(
		initialValues?.education ?? undefined
	);

	// Rich text content state for bio
	const [bioHtml, setBioHtml] = React.useState<string | undefined>(
		initialValues?.bio ?? undefined
	);

	// React Query mutation for create/update with manager scope
	const createEmployee = useCreateEmployee(isManager);
	const updateEmployee = useUpdateEmployee(employeeId || "", isManager);
	const router = useRouter();

	// Reinitialize if initialValues change
	React.useEffect(() => {
		if (initialValues?.branch_department) {
			// Support both single string and array of strings
			if (Array.isArray(initialValues.branch_department)) {
				setSelectedBranchDeptIds(initialValues.branch_department);
			} else {
				setSelectedBranchDeptIds([initialValues.branch_department]);
			}
		} else {
			setSelectedBranchDeptIds([]);
		}
		setEducationHtml(initialValues?.education ?? undefined);
		setBioHtml(initialValues?.bio ?? undefined);
		setSelectedRole(initialValues?.role ? String(initialValues.role) : "");
		// Clear selected files when initialValues change
		setSelectedFiles([]);
		setIsRemovingPicture(false);
	}, [
		initialValues?.branch_department,
		initialValues?.education,
		initialValues?.bio,
		initialValues?.role,
	]);

	// When role changes, ensure only one department is selected if not Manager
	React.useEffect(() => {
		const selectedRoleObj = availableRoles.find(r => String(r.id) === selectedRole);
		const isManagerRole = selectedRoleObj?.access_level === "manager";
		
		if (!isManagerRole && selectedBranchDeptIds.length > 1) {
			// If role is not Manager and multiple departments selected, keep only the first one
			setSelectedBranchDeptIds([selectedBranchDeptIds[0]]);
			toast.info("Only managers can be assigned to multiple departments. Keeping only one department.");
		}
	}, [selectedRole, selectedBranchDeptIds, availableRoles]);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const form = e.currentTarget as HTMLFormElement;
		const data = new FormData(form);

		const empName = String(data.get("emp_name") || "").trim();
		const email = String(data.get("email") || "").trim();
		const phone = String(data.get("phone") || "").trim();

		// if (!empName || selectedBranchDeptIds.length === 0) {
		// 	toast.error("Name and at least one Branch/Department are required");
		// 	onSubmitComplete?.(false); // Notify parent that submission failed
		// 	return;
		// }

		// Convert selected branch department IDs to numbers
		const branchDepartmentIds = selectedBranchDeptIds.map((id) => Number(id));

		// Build payload based on role
		const payload: import("@/services/employees").EmployeeCreateRequest = {
			emp_name: empName,
			email: email || undefined,
			phone: phone || undefined,
			role: selectedRole ? Number(selectedRole) : undefined, // Convert to integer for API (role ID)
			education: educationHtml || undefined,
			bio: bioHtml || undefined,
			// Handle profile picture logic
			profile_picture:
				selectedFiles[0] || (isRemovingPicture ? null : undefined),
		};

		// Add branch department fields based on role and mode
		const selectedRoleObj = availableRoles.find(r => String(r.id) === selectedRole);
		const isManagerRole = selectedRoleObj?.access_level === "manager";
		
		if (isManagerRole) {
			if (!isEdit) {
				// Create mode: use manager_branch_departments for managers
				payload.manager_branch_departments = branchDepartmentIds;
			}
		} else {
			// Regular employee: use single branch_department_id
			payload.branch_department_id = branchDepartmentIds[0];
		}

		try {
			if (isEdit && employeeId) {
				const selectedRoleObj = availableRoles.find(r => String(r.id) === selectedRole);
				const isManagerRole = selectedRoleObj?.access_level === "manager";
				const updatePayload: EmployeeUpdateRequest = isManagerRole
					? { ...payload, branch_department_ids: branchDepartmentIds }
					: payload;
				await updateEmployee.mutateAsync(updatePayload);
				toast.success("Employee updated successfully");
			} else {
				await createEmployee.mutateAsync(payload);
				toast.success("Employee created successfully");
			}
			onSubmitComplete?.(true); // Notify parent that submission succeeded
			router.push(ROUTES.ADMIN.ORG_CHART);
		} catch (error: unknown) {
			console.error("Error saving employee:", error);
			
			let errorMessage = "Failed to save. Please try again.";
			
			// First, check if it's an Error object (from API client transformation)
			if (error instanceof Error && error.message) {
				errorMessage = error.message;
			}
			// Otherwise, try to extract from Axios error response
			else {
				const err = error as { response?: { data?: Record<string, unknown>; status?: number } };
				const dataErr = err?.response?.data;
				
				if (dataErr && typeof dataErr === "object") {
					// Check for direct error field (common in custom error responses)
					if ("error" in dataErr && typeof dataErr.error === "string") {
						errorMessage = dataErr.error;
					}
					// Check for detail field (common in DRF responses)
					else if ("detail" in dataErr && typeof dataErr.detail === "string") {
						errorMessage = dataErr.detail;
					}
					// Check for message field
					else if ("message" in dataErr && typeof dataErr.message === "string") {
						errorMessage = dataErr.message;
					}
					// Check for non_field_errors (validation errors)
					else if ("non_field_errors" in dataErr) {
						const nfe = dataErr.non_field_errors;
						if (Array.isArray(nfe)) {
							errorMessage = nfe.join(". ");
						} else if (typeof nfe === "string") {
							errorMessage = nfe;
						}
					}
					// Check for field-specific errors
					else {
						const messages: string[] = [];
						for (const key of Object.keys(dataErr)) {
							const value = dataErr[key];
							if (Array.isArray(value)) {
								value.forEach((msg: unknown) =>
									messages.push(`${key}: ${String(msg)}`)
								);
							} else if (typeof value === "string") {
								messages.push(`${key}: ${value}`);
							}
						}
						if (messages.length > 0) {
							errorMessage = messages.join(". ");
						}
					}
				}
			}
			
			toast.error(errorMessage);
			onSubmitComplete?.(false); // Notify parent that submission failed
		}
	};

	// Allow parent to trigger submit from outside via PageHeader Save button
	const formRef = React.useRef<HTMLFormElement | null>(null);
	React.useEffect(() => {
		if (onRegisterSubmit) {
			onRegisterSubmit(() => {
				if (formRef.current) {
					// Trigger native form submission to use handleSubmit
					formRef.current.requestSubmit();
				}
			});
		}
	}, [onRegisterSubmit]);

	return (
		<form ref={formRef} className="grid gap-6" onSubmit={handleSubmit}>
			<div className="grid grid-cols-12 items-center gap-4 border-t border-[#E9EAEB] pt-4">
				<Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">
					Full Name:
				</Label>
				<div className="col-span-12 md:col-span-10">
					<Input
						name="emp_name"
						defaultValue={initialValues?.emp_name || ""}
						placeholder="Employee Name"
						className="border-[#E2E8F0]"
					/>
				</div>
			</div>

			<div className="grid grid-cols-12 items-center gap-4">
				<Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">
					Phone:
				</Label>
				<div className="col-span-12 md:col-span-10">
					<Input
						name="phone"
						defaultValue={initialValues?.phone || undefined}
						placeholder="Phone"
						className="border-[#E2E8F0]"
					/>
				</div>
			</div>

			<div className="grid grid-cols-12 items-center gap-4">
				<Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">
					Email Id:
				</Label>
				<div className="col-span-12 md:col-span-10">
					<Input
						name="email"
						defaultValue={initialValues?.email ?? undefined}
						placeholder="Email Id"
						type="email"
						className="border-[#E2E8F0]"
					/>
				</div>
			</div>

			{/* No password in Employee schema */}

			<div className="grid grid-cols-12 items-center gap-4">
				<Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">
					Role:
				</Label>
				<div className="col-span-12 md:col-span-10">
					<Select value={selectedRole} onValueChange={setSelectedRole}>
						<SelectTrigger className="border-[#E2E8F0] w-full">
							<SelectValue placeholder="Select role" />
						</SelectTrigger>
						<SelectContent>
							{availableRoles.map((role) => (
								<SelectItem key={role.id} value={String(role.id)}>
									{role.name}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					{isManager && (
						<p className="mt-1 text-xs text-muted-foreground">
							Only administrators can create manager roles.
						</p>
					)}
				</div>
			</div>

			{/* No join_date/job_title in Employee schema */}

			{/* Reporting to not part of Employee schema here */}

			<div className="grid grid-cols-12 items-center gap-4 border-t border-[#E9EAEB] pt-4">
				<Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">
					Branch Department{availableRoles.find(r => String(r.id) === selectedRole)?.access_level === "manager" ? "s" : ""}:
				</Label>
				<div className="col-span-12 md:col-span-10">
					<SelectableTags
						items={[]} // Empty since we're using async hooks
						selectedItems={selectedBranchDeptIds}
						onSelectionChange={(ids) => {
							const selectedRoleObj = availableRoles.find(r => String(r.id) === selectedRole);
							const isManagerRole = selectedRoleObj?.access_level === "manager";
							
							// If role is not Manager, allow only one selection
							if (!isManagerRole) {
								const lastSelected = ids[ids.length - 1];
								setSelectedBranchDeptIds(lastSelected ? [lastSelected] : []);
							} else {
								// Manager can select multiple
								setSelectedBranchDeptIds(ids);
							}
						}}
						searchPlaceholder="Search branch departments..."
						emptyMessage="No branch departments found."
						useAllItems={useAllDepartments}
						useSearch={useSearchDepartmentsAdapter}
						searchDebounce={300}
					/>
					{(() => {
						const selectedRoleObj = availableRoles.find(r => String(r.id) === selectedRole);
						const isManagerRole = selectedRoleObj?.access_level === "manager";
						
						if (!isManagerRole) {
							return (
								<p className="mt-1 text-xs text-muted-foreground">
									Only one department can be selected for this role. Select Manager role to manage multiple departments.
								</p>
							);
						}
						return (
							<p className="mt-1 text-xs text-muted-foreground">
								Managers can be assigned to multiple departments. The first department will be used as their employee record location.
							</p>
						);
					})()}
				</div>
			</div>

			<div className="grid grid-cols-12 items-start gap-4 border-t border-[#E9EAEB] pt-4">
				<Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">
					Profile Picture:
				</Label>
				<div className="col-span-12 md:col-span-10">
					<Dropzone
						onFileSelect={(files) => {
							if (files) {
								setSelectedFiles(Array.from(files));
								setIsRemovingPicture(false); // Reset removal flag when new file selected
							}
						}}
						onClear={() => {
							setSelectedFiles([]);
							// If there was an initial image, mark for removal
							if (initialValues?.profileImageUrl) {
								setIsRemovingPicture(true);
							}
						}}
						accept="image/*"
						initialPreviewUrls={
							initialValues?.profileImageUrl
								? [initialValues.profileImageUrl]
								: []
						}
					/>
				</div>
			</div>

			<div className="grid grid-cols-12 items-start gap-4">
				<Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">
					Qualification or Education
				</Label>
				<div className="col-span-12 md:col-span-10">
					<RichTextEditor
						content={educationHtml}
						placeholder="Write Education"
						minHeight="200px"
						maxHeight="400px"
						onChange={(html) => setEducationHtml(html)}
					/>
				</div>
			</div>

			<div className="grid grid-cols-12 items-start gap-4">
				<Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">
					Bio
				</Label>
				<div className="col-span-12 md:col-span-10">
					<RichTextEditor
						content={bioHtml}
						placeholder="Write Bio"
						minHeight="200px"
						maxHeight="400px"
						onChange={(html) => setBioHtml(html)}
					/>
				</div>
			</div>
		</form>
	);
}
