"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AccessLevel, AccessLevelSelectProps } from "@/types/roles";
import { cn } from "@/lib/utils";

export function AccessLevelSelect({
  value,
  onChange,
  disabled,
  triggerClassName,
  placeholder = "Select access level",
}: AccessLevelSelectProps) {
  return (
    <Select
      value={value}
      onValueChange={(val: AccessLevel) => onChange(val)}
      disabled={disabled}>
      <SelectTrigger
        className={cn("border-[#D5D7DA] w-full", triggerClassName)}>
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
