"use client";

import * as React from "react";
import { useExecutive } from "@/hooks/queries/use-executive-members";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { ROUTES } from "@/constants/routes";
import { useRouter } from "next/navigation";
import { useDeleteExecutive } from "@/hooks/queries/use-executive-members";
import { toast } from "sonner";
import { ConfirmPopover } from "@/components/common/confirm-popover";

interface ExecutiveMemberDetailTableProps {
	executiveId: string;
}

export function ExecutiveMemberDetailTable({
	executiveId,
}: ExecutiveMemberDetailTableProps) {
	const {
		data: executiveMember,
		isLoading,
		isError,
	} = useExecutive(executiveId);
	const deleteExecutive = useDeleteExecutive();
	const router = useRouter();
	const [deleting, setDeleting] = React.useState(false);

	const handleDelete = async () => {
		try {
			setDeleting(true);
			await deleteExecutive.mutateAsync(executiveId);
			toast.success("Executive member deleted successfully");
			router.push(ROUTES.ADMIN.EXECUTIVE_MEMBERS);
		} catch (error) {
			console.error("Error deleting executive member:", error);
			toast.error("Failed to delete executive member");
		} finally {
			setDeleting(false);
		}
	};

	if (isLoading) {
		return (
			<Card className="border-[#FFF6F6] p-5 shadow-none">
				<div className="text-center py-8">
					Loading executive member details...
				</div>
			</Card>
		);
	}

	if (isError || !executiveMember) {
		return (
			<Card className="border-[#FFF6F6] p-5 shadow-none">
				<div className="text-center py-8 text-red-500">
					Failed to load executive member details.
				</div>
			</Card>
		);
	}

	return (
		<Card className="border-[#FFF6F6] p-5 shadow-none">
			<div className="space-y-6">
				{/* Header with actions */}
				<div className="flex items-center justify-between">
					<div className="flex items-center gap-4">
						<Avatar className="size-16">
							<AvatarImage
								src={executiveMember.profile_picture || undefined}
								alt={executiveMember.name}
							/>
							<AvatarFallback className="text-lg">
								{executiveMember.name
									.split(" ")
									.map((n) => n[0])
									.join("")}
							</AvatarFallback>
						</Avatar>
						<div>
							<h2 className="text-2xl font-semibold text-[#1D1F2C]">
								{executiveMember.name}
							</h2>
							<Badge
								variant="secondary"
								className="bg-[#FFF1F5] text-[#D64575] border-0 mt-1">
								{executiveMember.role}
							</Badge>
						</div>
					</div>
					<div className="flex gap-2">
						<Button
							onClick={() =>
								router.push(ROUTES.ADMIN.EXECUTIVE_MEMBERS_ID_EDIT(executiveId))
							}
							className="bg-[#D64575] hover:bg-[#D64575]/90 text-white">
							<Edit className="size-4 mr-2" />
							Edit
						</Button>
						<ConfirmPopover
							title="Delete executive member?"
							description="This action cannot be undone."
							confirmText="Delete"
							onConfirm={handleDelete}
							disabled={deleting}>
							<Button
								variant="outline"
								className="text-red-600 border-red-600 hover:bg-red-50">
								<Trash2 className="size-4 mr-2" />
								Delete
							</Button>
						</ConfirmPopover>
					</div>
				</div>

				{/* Contact Information */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div className="space-y-4">
						<h3 className="text-lg font-medium text-[#1D1F2C]">
							Contact Information
						</h3>
						<div className="space-y-3">
							<div>
								<label className="text-sm text-[#667085]">Email</label>
								<p className="text-sm text-[#1D1F2C]">
									{executiveMember.email}
								</p>
							</div>
							{executiveMember.phone && (
								<div>
									<label className="text-sm text-[#667085]">Phone</label>
									<p className="text-sm text-[#1D1F2C]">
										{executiveMember.phone}
									</p>
								</div>
							)}
							{executiveMember.address && (
								<div>
									<label className="text-sm text-[#667085]">Address</label>
									<p className="text-sm text-[#1D1F2C]">
										{executiveMember.address}
									</p>
								</div>
							)}
							{executiveMember.city && (
								<div>
									<label className="text-sm text-[#667085]">City</label>
									<p className="text-sm text-[#1D1F2C]">
										{executiveMember.city}
									</p>
								</div>
							)}
						</div>
					</div>

					<div className="space-y-4">
						<h3 className="text-lg font-medium text-[#1D1F2C]">
							Role Information
						</h3>
						<div className="space-y-3">
							<div>
								<label className="text-sm text-[#667085]">Position</label>
								<p className="text-sm text-[#1D1F2C]">{executiveMember.role}</p>
							</div>
							<div>
								<label className="text-sm text-[#667085]">Education</label>
								<div
									className="text-sm text-[#1D1F2C] prose prose-sm"
									dangerouslySetInnerHTML={{
										__html: executiveMember.education,
									}}
								/>
							</div>
							{executiveMember.bio && (
								<div>
									<label className="text-sm text-[#667085]">Bio</label>
									<div
										className="text-sm text-[#1D1F2C] prose prose-sm"
										dangerouslySetInnerHTML={{ __html: executiveMember.bio }}
									/>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</Card>
	);
}
