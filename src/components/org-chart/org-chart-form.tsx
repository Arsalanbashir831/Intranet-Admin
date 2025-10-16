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
import {
	useDepartments,
	useSearchDepartments,
} from "@/hooks/queries/use-departments";
import { useManagerScope } from "@/contexts/manager-scope-context";

import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";
export type OrgChartInitialValues = {
	emp_name?: string;
	email?: string | null;
	phone?: string | null;
	role?: string | null;
	education?: string | null;
	bio?: string | null;
	branch_department?: string; // id as string for UI select
	profileImageUrl?: string;
	address?: string | null;
	city?: string | null;
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
	
	// Create adapter functions for async search
	const useAllDepartments = () => {
		const result = useDepartments(undefined, { pageSize: 100 }); // Get more departments
		const branchDeptItems = React.useMemo(() => {
			const departmentsPayload = (
				result.data as { departments?: { results?: unknown[] } }
			)?.departments;
			const results = Array.isArray(departmentsPayload?.results)
				? departmentsPayload.results
				: Array.isArray(result.data)
				? result.data
				: result.data?.departments?.results ?? [];

			const items: { id: string; label: string }[] = [];
			for (const dept of results || []) {
				const deptData = dept as {
					dept_name?: string;
					name?: string;
					branch_departments?: unknown[];
				};
				const deptName = String(deptData.dept_name ?? deptData.name ?? "");
				const branchDepartments = deptData.branch_departments as
					| Array<{
							id: number;
							branch?: { branch_name?: string };
							branch_name?: string;
					  }>
					| undefined;
				if (Array.isArray(branchDepartments)) {
					for (const bd of branchDepartments) {
						const bdId = String(bd.id);
						const branchName = String(
							bd?.branch?.branch_name ?? bd?.branch_name ?? ""
						);
						
						// Filter: If manager, only show their managed departments
						if (isManager && !managedDepartments.includes(bd.id)) {
							continue; // Skip this department
						}
						
						items.push({ id: bdId, label: `${deptName} - ${branchName}` });
					}
				}
			}
			return items;
		}, [result.data]);

		return {
			data: branchDeptItems,
			isLoading: result.isLoading,
		};
	};

	const useSearchDepartmentsAdapter = (query: string) => {
		const result = useSearchDepartments(query, { pageSize: 100 });
		const branchDeptItems = React.useMemo(() => {
			const departmentsPayload = (
				result.data as { departments?: { results?: unknown[] } }
			)?.departments;
			const results = Array.isArray(departmentsPayload?.results)
				? departmentsPayload.results
				: Array.isArray(result.data)
				? result.data
				: result.data?.departments?.results ?? [];
			const items: { id: string; label: string }[] = [];
			for (const dept of results || []) {
				const deptData = dept as {
					dept_name?: string;
					name?: string;
					branch_departments?: unknown[];
				};
				const deptName = String(deptData.dept_name ?? deptData.name ?? "");
				const branchDepartments = deptData.branch_departments as
					| Array<{
							id: number;
							branch?: { branch_name?: string };
							branch_name?: string;
					  }>
					| undefined;
				if (Array.isArray(branchDepartments)) {
					for (const bd of branchDepartments) {
						const bdId = String(bd.id);
						const branchName = String(
							bd?.branch?.branch_name ?? bd?.branch_name ?? ""
						);
						
						// Filter: If manager, only show their managed departments
						if (isManager && !managedDepartments.includes(bd.id)) {
							continue; // Skip this department
						}
						
						items.push({ id: bdId, label: `${deptName} - ${branchName}` });
					}
				}
			}
			return items;
		}, [result.data]);

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
	>(initialValues?.branch_department ? [initialValues.branch_department] : []);

	// Role selection state - store as string for Select component, convert to number for API
	const [selectedRole, setSelectedRole] = React.useState<string>(
		initialValues?.role ? String(initialValues.role) : "1"
	);

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
			setSelectedBranchDeptIds([initialValues.branch_department]);
		} else {
			setSelectedBranchDeptIds([]);
		}
		setEducationHtml(initialValues?.education ?? undefined);
		setBioHtml(initialValues?.bio ?? undefined);
		setSelectedRole(initialValues?.role ? String(initialValues.role) : "1");
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
		if (selectedRole !== "4" && selectedBranchDeptIds.length > 1) {
			// If role is not Manager and multiple departments selected, keep only the first one
			setSelectedBranchDeptIds([selectedBranchDeptIds[0]]);
			toast.info("Only managers can be assigned to multiple departments. Keeping only one department.");
		}
	}, [selectedRole, selectedBranchDeptIds]);

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const form = e.currentTarget as HTMLFormElement;
		const data = new FormData(form);

		const empName = String(data.get("emp_name") || "").trim();
		const email = String(data.get("email") || "").trim();
		const phone = String(data.get("phone") || "").trim();
		const address = String(data.get("address") || "").trim();
		const city = String(data.get("city") || "").trim();

		if (!empName || selectedBranchDeptIds.length === 0) {
			toast.error("Name and at least one Branch/Department are required");
			onSubmitComplete?.(false); // Notify parent that submission failed
			return;
		}

		// Convert selected branch department IDs to numbers
		const branchDepartmentIds = selectedBranchDeptIds.map((id) => Number(id));

		// Build payload based on role
		const payload: import("@/services/employees").EmployeeCreateRequest = {
			emp_name: empName,
			email: email || undefined,
			phone: phone || undefined,
			role: selectedRole ? Number(selectedRole) : undefined, // Convert to integer for API
			education: educationHtml || undefined,
			bio: bioHtml || undefined,
			address: address || undefined,
			city: city || undefined,
			// Handle profile picture logic
			profile_picture:
				selectedFiles[0] || (isRemovingPicture ? null : undefined),
		};

		// Add branch department fields based on role
		if (selectedRole === "4") {
			// Manager: use manager_branch_departments array
			payload.manager_branch_departments = branchDepartmentIds;
		} else {
			// Regular employee: use single branch_department_id
			payload.branch_department_id = branchDepartmentIds[0];
		}

		try {
			if (isEdit && employeeId) {
				await updateEmployee.mutateAsync(payload);
				toast.success("Employee updated successfully");
			} else {
				await createEmployee.mutateAsync(payload);
				toast.success("Employee created successfully");
			}
			onSubmitComplete?.(true); // Notify parent that submission succeeded
			router.push(ROUTES.ADMIN.ORG_CHART);
		} catch (error: unknown) {
			const err = error as { response?: { data?: Record<string, unknown> } };
			const dataErr = err?.response?.data;
			const messages: string[] = [];
			if (dataErr && typeof dataErr === "object") {
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
			}
			if (messages.length) {
				messages.forEach((m) => toast.error(m));
			} else {
				toast.error("Failed to save. Please try again.");
			}
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
					Address:
				</Label>
				<div className="col-span-12 md:col-span-10">
					<Input
						name="address"
						defaultValue={initialValues?.address as string}
						placeholder="Address"
						className="border-[#E2E8F0]"
					/>
				</div>
			</div>

			<div className="grid grid-cols-12 items-center gap-4">
				<Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">
					City:
				</Label>
				<div className="col-span-12 md:col-span-10">
					<Input
						name="city"
						defaultValue={initialValues?.city as string}
						placeholder="City"
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
							<SelectItem value="1">Junior Staff</SelectItem>
							<SelectItem value="2">Mid Senior Staff</SelectItem>
							<SelectItem value="3">Senior Staff</SelectItem>
							{/* Only admins can add managers */}
							{!isManager && <SelectItem value="4">Manager</SelectItem>}
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
					Branch Department{selectedRole === "4" ? "s" : ""}:
				</Label>
				<div className="col-span-12 md:col-span-10">
					<SelectableTags
						items={[]} // Empty since we're using async hooks
						selectedItems={selectedBranchDeptIds}
						onSelectionChange={(ids) => {
							// If role is not Manager (4), allow only one selection
							if (selectedRole !== "4") {
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
					{selectedRole !== "4" && (
						<p className="mt-1 text-xs text-muted-foreground">
							Only one department can be selected for this role. Select Manager role to manage multiple departments.
						</p>
					)}
					{selectedRole === "4" && (
						<p className="mt-1 text-xs text-muted-foreground">
							Managers can be assigned to multiple departments. The first department will be used as their employee record location.
						</p>
					)}
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
						maxSize={800 * 400}
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
