import { Label } from "../ui/label";
import {
  Select,
  SelectItem,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

import { SelectFilterProps } from "@/types/common";

export function SelectFilter({
  label,
  value,
  onValueChange,
  options,
}: SelectFilterProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={`filter-${label.toLowerCase().replace(/\s+/g, "-")}`}>
        {label}
      </Label>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          id={`filter-${label.toLowerCase().replace(/\s+/g, "-")}`}
          className="w-full border-[#E4E4E4]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
