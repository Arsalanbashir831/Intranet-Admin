import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dropzone } from "@/components/ui/dropzone";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { useManagerScope } from "@/contexts/manager-scope-context";
import { IndependentBranchDepartmentSelector } from "@/components/common/independent-branch-department-selector";
import { useBranchDepartments } from "@/hooks/queries/use-branches";

export type CompanyHubInitialData = {
	id?: string;
	type?: "announcement" | "policy";
	title?: string;
	selectedBranchDepartments?: string[];
	permittedBranches?: string[];
	permittedDepartments?: string[];
	permittedBranchDepartments?: string[];
	body?: string;
};

export type CompanyHubFormProps = {
	initialData?: CompanyHubInitialData;
	onFormDataChange?: (data: CompanyHubFormData) => void;
	onSubmit?: (data: CompanyHubFormData, isDraft: boolean) => void;
	existingAttachments?: Array<{
		id: number;
		name: string;
		file_url: string;
		size: number;
	}>;
	onAttachmentDelete?: (id: number) => void;
};

export type CompanyHubFormData = {
	type: "announcement" | "policy";
	title: string;
	selectedBranchDepartments: string[];
	permittedBranches?: string[];
	permittedDepartments?: string[];
	permittedBranchDepartments?: string[];
	body: string;
	attachedFiles: File[];
};

// Kept for compatibility (even though fields already exist on CompanyHubFormData)
export type CompanyHubFormSubmitData = CompanyHubFormData & {
	selectedBranchDepartments: string[];
};

export function CompanyHubForm({
	initialData,
	onFormDataChange,
	existingAttachments = [],
	onAttachmentDelete,
}: CompanyHubFormProps) {
	// Get manager scope to filter departments
	const { isManager, managedDepartments } = useManagerScope();

	// Fetch branch departments data for conversion
	const { data: branchDepartmentsData } = useBranchDepartments(undefined, { pageSize: 1000 });

	// Create mapping from branch_department_id to {branchId, departmentId}
	const branchDepartmentIdToCombination = React.useMemo(() => {
		const map = new Map<string, { branchId: number; departmentId: number }>();
		if (!branchDepartmentsData?.branch_departments?.results) return map;

		for (const bd of branchDepartmentsData.branch_departments.results) {
			if (isManager && managedDepartments && !managedDepartments.includes(bd.id)) {
				continue;
			}

			if (bd.branch?.id && bd.department?.id) {
				map.set(String(bd.id), {
					branchId: bd.branch.id,
					departmentId: bd.department.id,
				});
			}
		}
		return map;
	}, [branchDepartmentsData, isManager, managedDepartments]);

	// Convert initial data to separate branches and departments
	// Priority: permittedBranchDepartments > permittedBranches/permittedDepartments > selectedBranchDepartments
	const initialBranches = React.useMemo(() => {
		// If permittedBranchDepartments exists, convert from branch_department_ids
		if (initialData?.permittedBranchDepartments?.length) {
			const branchIds = new Set<string>();
			for (const bdId of initialData.permittedBranchDepartments) {
				const combo = branchDepartmentIdToCombination.get(String(bdId));
				if (combo) {
					branchIds.add(String(combo.branchId));
				}
			}
			return Array.from(branchIds);
		}
		// If permittedBranches exists, use it directly
		if (initialData?.permittedBranches?.length) {
			return initialData.permittedBranches;
		}
		// Fallback to selectedBranchDepartments (for backward compatibility)
		if (initialData?.selectedBranchDepartments?.length) {
			const branchIds = new Set<string>();
			for (const bdId of initialData.selectedBranchDepartments) {
				const combo = branchDepartmentIdToCombination.get(bdId);
				if (combo) {
					branchIds.add(String(combo.branchId));
				}
			}
			return Array.from(branchIds);
		}
		return [];
	}, [initialData?.permittedBranchDepartments, initialData?.permittedBranches, initialData?.selectedBranchDepartments, branchDepartmentIdToCombination]);

	const initialDepartments = React.useMemo(() => {
		// If permittedBranchDepartments exists, convert from branch_department_ids
		if (initialData?.permittedBranchDepartments?.length) {
			const deptIds = new Set<string>();
			for (const bdId of initialData.permittedBranchDepartments) {
				const combo = branchDepartmentIdToCombination.get(String(bdId));
				if (combo) {
					deptIds.add(String(combo.departmentId));
				}
			}
			return Array.from(deptIds);
		}
		// If permittedDepartments exists, use it directly
		if (initialData?.permittedDepartments?.length) {
			return initialData.permittedDepartments;
		}
		// Fallback to selectedBranchDepartments (for backward compatibility)
		if (initialData?.selectedBranchDepartments?.length) {
			const deptIds = new Set<string>();
			for (const bdId of initialData.selectedBranchDepartments) {
				const combo = branchDepartmentIdToCombination.get(bdId);
				if (combo) {
					deptIds.add(String(combo.departmentId));
				}
			}
			return Array.from(deptIds);
		}
		return [];
	}, [initialData?.permittedBranchDepartments, initialData?.permittedDepartments, initialData?.selectedBranchDepartments, branchDepartmentIdToCombination]);


	// Attachments → special preview urls
	const initialPreviewUrls = React.useMemo(() => {
		return existingAttachments.map((attachment) => {
			const fileInfo = {
				url: attachment.file_url,
				name: attachment.name,
				id: attachment.id,
			};
			return `attachment://${encodeURIComponent(JSON.stringify(fileInfo))}`;
		});
	}, [existingAttachments]);

	const getAttachmentIdByUrl = (url: string) => {
		if (url.startsWith("attachment://")) {
			try {
				const decoded = decodeURIComponent(url.replace("attachment://", ""));
				const fileInfo = JSON.parse(decoded);
				return fileInfo.id ?? null;
			} catch {
				return null;
			}
		}
		const match = existingAttachments.find((a) => a.file_url === url);
		return match?.id;
	};

	// Form state
	const [typeValue, setTypeValue] = React.useState<"announcement" | "policy">(
		initialData?.type ?? "announcement"
	);
	const [title, setTitle] = React.useState<string>(initialData?.title ?? "");
	const [selectedBranches, setSelectedBranches] = React.useState<string[]>(initialBranches);
	const [selectedDepartments, setSelectedDepartments] = React.useState<string[]>(initialDepartments);
	const [body, setBody] = React.useState<string>(
		initialData?.body ?? ""
	);
	const [attachedFiles, setAttachedFiles] = React.useState<File[]>([]);

	// Sync when initialData changes
	React.useEffect(() => {
		if (!initialData) return;
		if (initialData.type) setTypeValue(initialData.type);
		if (typeof initialData.title === "string") setTitle(initialData.title);
		
		// Handle branches and departments from various sources
		if (initialData.permittedBranchDepartments?.length) {
			// Convert from branch_department_ids
			const branchIds = new Set<string>();
			const deptIds = new Set<string>();
			for (const bdId of initialData.permittedBranchDepartments) {
				const combo = branchDepartmentIdToCombination.get(String(bdId));
				if (combo) {
					branchIds.add(String(combo.branchId));
					deptIds.add(String(combo.departmentId));
				}
			}
			setSelectedBranches(Array.from(branchIds));
			setSelectedDepartments(Array.from(deptIds));
		} else if (initialData.permittedBranches?.length || initialData.permittedDepartments?.length) {
			// Use direct branches/departments
			setSelectedBranches(initialData.permittedBranches || []);
			setSelectedDepartments(initialData.permittedDepartments || []);
		} else if (Array.isArray(initialData.selectedBranchDepartments) && initialData.selectedBranchDepartments.length > 0) {
			// Fallback to selectedBranchDepartments (backward compatibility)
			const branchIds = new Set<string>();
			const deptIds = new Set<string>();
			for (const bdId of initialData.selectedBranchDepartments) {
				const combo = branchDepartmentIdToCombination.get(bdId);
				if (combo) {
					branchIds.add(String(combo.branchId));
					deptIds.add(String(combo.departmentId));
				}
			}
			setSelectedBranches(Array.from(branchIds));
			setSelectedDepartments(Array.from(deptIds));
		}
		
		if (typeof initialData.body === "string")
			setBody(initialData.body);
	}, [initialData, branchDepartmentIdToCombination]);

	// Convert selected branches and departments to branch_department_ids and determine payload fields
	const payloadFields = React.useMemo(() => {
		const hasBranches = selectedBranches.length > 0;
		const hasDepartments = selectedDepartments.length > 0;

		// Convert branches and departments to branch_department_ids
		const branchDeptIds: string[] = [];
		if (hasBranches && hasDepartments && branchDepartmentsData?.branch_departments?.results) {
			const branchIdSet = new Set(selectedBranches.map(Number));
			const deptIdSet = new Set(selectedDepartments.map(Number));

			for (const bd of branchDepartmentsData.branch_departments.results) {
				if (isManager && managedDepartments && !managedDepartments.includes(bd.id)) {
					continue;
				}

				if (
					bd.branch?.id &&
					branchIdSet.has(bd.branch.id) &&
					bd.department?.id &&
					deptIdSet.has(bd.department.id)
				) {
					branchDeptIds.push(String(bd.id));
				}
			}
		}

		return {
			permittedBranches: hasBranches && !hasDepartments ? selectedBranches : undefined,
			permittedDepartments: hasDepartments && !hasBranches ? selectedDepartments : undefined,
			permittedBranchDepartments: hasBranches && hasDepartments ? branchDeptIds : undefined,
			selectedBranchDepartments: branchDeptIds, // Keep for backward compatibility
		};
	}, [selectedBranches, selectedDepartments, branchDepartmentsData, isManager, managedDepartments]);

	// Notify parent of changes
	const currentFormData = React.useMemo<CompanyHubFormData>(
		() => ({
			type: typeValue,
			title,
			selectedBranchDepartments: payloadFields.selectedBranchDepartments,
			permittedBranches: payloadFields.permittedBranches,
			permittedDepartments: payloadFields.permittedDepartments,
			permittedBranchDepartments: payloadFields.permittedBranchDepartments,
			body,
			attachedFiles,
		}),
		[
			typeValue,
			title,
			payloadFields,
			body,
			attachedFiles,
		]
	);

	React.useEffect(() => {
		onFormDataChange?.(currentFormData);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentFormData]);


	return (
		<div className="grid gap-6">
			<div className="grid grid-cols-12 items-start gap-4 border-b border-[#E9EAEB] pb-4">
				<Label className="col-span-12 md:col-span-2 text-sm">Type:</Label>
				<div className="col-span-12 md:col-span-10">
					<RadioGroup
						value={typeValue}
						onValueChange={(v) => setTypeValue(v as "announcement" | "policy")}
						className="flex gap-6">
						<div className="flex items-center gap-2">
							<RadioGroupItem value="announcement" id="type-ann" />
							<Label
								htmlFor="type-ann"
								className="cursor-pointer text-[#535862]">
								Announcement
							</Label>
						</div>
						<div className="flex items-center gap-2">
							<RadioGroupItem value="policy" id="type-pol" />
							<Label
								htmlFor="type-pol"
								className="cursor-pointer text-[#535862]">
								Policy
							</Label>
						</div>
					</RadioGroup>
				</div>
			</div>

			<div className="grid grid-cols-12 items-center gap-4 border-b border-[#E9EAEB] pb-4">
				<Label className="col-span-12 md:col-span-2 text-sm">Title:</Label>
				<div className="col-span-12 md:col-span-10">
					<Input
						placeholder="e.g. Announcement 1/Policy"
						className="border-[#E2E8F0]"
						value={title}
						onChange={(e) => setTitle(e.target.value)}
					/>
				</div>
			</div>

			<div className="grid grid-cols-12 items-start gap-4 border-b border-[#E9EAEB] pb-4">
				<Label className="col-span-12 md:col-span-2 text-sm">
					Attachments:
				</Label>
				<div className="col-span-12 md:col-span-10">
					<Dropzone
						onFileSelect={(files) => {
							if (files) {
								setAttachedFiles(Array.from(files));
							}
						}}
						onClear={() => {
							setAttachedFiles([]);
							if (existingAttachments.length > 0 && onAttachmentDelete) {
								existingAttachments.forEach((attachment) =>
									onAttachmentDelete(attachment.id)
								);
							}
						}}
						onImageRemove={(url) => {
							if (url.startsWith("attachment://")) {
								try {
									const decodedData = decodeURIComponent(
										url.replace("attachment://", "")
									);
									const fileInfo = JSON.parse(decodedData);
									const attachmentId = fileInfo.id;
									if (attachmentId && onAttachmentDelete)
										onAttachmentDelete(attachmentId);
								} catch (e) {
									console.error("Error parsing attachment URL:", e);
								}
							} else if (
								!url.startsWith("blob:") &&
								!url.startsWith("file://")
							) {
								const attachmentId = getAttachmentIdByUrl(url);
								if (attachmentId && onAttachmentDelete)
									onAttachmentDelete(attachmentId);
							}
						}}
						accept="image/*"
						multiple={false}
						showPreview={true}
						initialPreviewUrls={initialPreviewUrls}
					/>
				</div>
			</div>


			<div className="border-b border-[#E9EAEB] pb-4">
				<IndependentBranchDepartmentSelector
					selectedBranches={selectedBranches}
					selectedDepartments={selectedDepartments}
					onBranchesChange={setSelectedBranches}
					onDepartmentsChange={setSelectedDepartments}
					allowMultiple={true}
					branchLabel="Branch Access:"
					departmentLabel="Department Access:"
					branchPlaceholder="Select branches (empty = public access)"
					departmentPlaceholder="Select departments (empty = public access)"
					managedDepartments={isManager ? managedDepartments : undefined}
				/>
				{isManager && (
					<p className="mt-1 text-xs text-muted-foreground ml-[16.666667%] md:ml-0">
						As a manager, you can only assign announcements to your managed departments.
					</p>
				)}
				<p className="mt-1 text-xs text-muted-foreground ml-[16.666667%] md:ml-0">
					Select only branches, only departments, or both. If both are selected, branch-department combinations will be used.
				</p>
			</div>

			<div className="grid grid-cols-12 items-start gap-4">
				<Label className="col-span-12 md:col-span-2 text-sm">
					Description:
				</Label>
				<div className="col-span-12 md:col-span-10">
					<RichTextEditor
						content={body}
						onChange={setBody}
						placeholder="Write content for the Announcement/Policy"
						minHeight="200px"
						maxHeight="400px"
					/>
				</div>
			</div>
		</div>
	);
}
