"use client";

import * as React from "react";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import type { Role } from "@/services/roles";
import { cn } from "@/lib/utils";

export type AccessLevel = Role["access_level"];

export function AccessLevelSelect({
	value,
	onChange,
	disabled,
	triggerClassName,
	placeholder = "Select access level",
}: {
	value: AccessLevel;
	onChange: (value: AccessLevel) => void;
	disabled?: boolean;
	triggerClassName?: string;
	placeholder?: string;
}) {
	return (
		<Select
			value={value}
			onValueChange={(val) => onChange(val as AccessLevel)}
			disabled={disabled}
		>
			<SelectTrigger className={cn("border-[#D5D7DA] w-full", triggerClassName)}>
				<SelectValue placeholder={placeholder} />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="employee">Employee</SelectItem>
				<SelectItem value="manager">Manager</SelectItem>
				<SelectItem value="executive">Executive</SelectItem>
			</SelectContent>
		</Select>
	);
}


