"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dropzone } from "@/components/ui/dropzone";
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
import type { EmployeeCreateRequest, EmployeeUpdateRequest } from "@/services/employees";
import { BranchDepartmentSelector } from "@/components/common/branch-department-selector";

import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";
import { extractErrorMessage } from "@/lib/error-handler";
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
	
	// Removed adapter functions - now using BranchDepartmentSelector component

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

		// Validation: Ensure at least one branch and department are selected
		if (selectedBranchDeptIds.length === 0) {
			toast.error("Please select at least one branch and department");
			onSubmitComplete?.(false);
			return;
		}

		// Convert selected branch department IDs to numbers
		const branchDepartmentIds = selectedBranchDeptIds.map((id) => Number(id));

		// Build payload based on role
		// Use EmployeeUpdateRequest for edit mode (includes branch_department_ids), EmployeeCreateRequest for create
		const payload: EmployeeCreateRequest | EmployeeUpdateRequest = {
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
			if (isEdit) {
				// Edit mode: use branch_department_ids for managers
				(payload as EmployeeUpdateRequest).branch_department_ids = branchDepartmentIds;
			} else {
				// Create mode: use manager_branch_departments for managers
				(payload as EmployeeCreateRequest).manager_branch_departments = branchDepartmentIds;
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
				await updateEmployee.mutateAsync(updatePayload as EmployeeUpdateRequest);
				toast.success("Employee updated successfully");
			} else {
				await createEmployee.mutateAsync(payload as EmployeeCreateRequest);
				toast.success("Employee created successfully");
			}
			onSubmitComplete?.(true); // Notify parent that submission succeeded
			router.push(ROUTES.ADMIN.ORG_CHART);
		} catch (error: unknown) {
			console.error("Error saving employee:", error);
			
			// Use centralized error extraction
			const errorMessage = extractErrorMessage(error);
			
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

			<div className="border-t border-[#E9EAEB] pt-4">
				<BranchDepartmentSelector
					value={selectedBranchDeptIds}
					onChange={(ids) => {
						const selectedRoleObj = availableRoles.find(r => String(r.id) === selectedRole);
						const isManagerRole = selectedRoleObj?.access_level === "manager";
						
						// If role is not Manager, allow only one selection
						if (!isManagerRole && ids.length > 1) {
							const lastSelected = ids[ids.length - 1];
							setSelectedBranchDeptIds(lastSelected ? [lastSelected] : []);
						} else {
							setSelectedBranchDeptIds(ids);
						}
					}}
					allowMultiple={availableRoles.find(r => String(r.id) === selectedRole)?.access_level === "manager"}
					branchLabel="Branch:"
					departmentLabel="Department:"
					branchPlaceholder="Select branch(es)..."
					departmentPlaceholder="Select department(s)..."
					managedDepartments={isManager ? managedDepartments : undefined}
					initialBranchDepartmentIds={initialValues?.branch_department 
						? Array.isArray(initialValues.branch_department) 
							? initialValues.branch_department 
							: [initialValues.branch_department]
						: undefined}
				/>
				{(() => {
					const selectedRoleObj = availableRoles.find(r => String(r.id) === selectedRole);
					const isManagerRole = selectedRoleObj?.access_level === "manager";
					
					if (!isManagerRole) {
						return (
							<p className="mt-1 text-xs text-muted-foreground ml-[16.666667%] md:ml-0">
								Only one branch and department can be selected for this role. Select Manager role to manage multiple departments.
							</p>
						);
					}
					return (
						<p className="mt-1 text-xs text-muted-foreground ml-[16.666667%] md:ml-0">
							Managers can be assigned to multiple branches and departments. The first department will be used as their employee record location.
						</p>
					);
				})()}
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
