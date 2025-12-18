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

// Kept for compatibility
export type CompanyHubFormSubmitData = CompanyHubFormData & {
	selectedBranchDepartments: string[];
};
