"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ChevronDown, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export type AccessItem = { label: string; value: string };

export function AccessLevelDropdown({
  items,
  selected,
  onChange,
  className,
}: {
  items: AccessItem[];
  selected: string[]; // empty means All
  onChange: (selected: string[]) => void;
  className?: string;
}) {
  const [query, setQuery] = React.useState("");
  const allSelected = selected.length === 0;

  const filtered = React.useMemo(() => {
    if (!query) return items;
    const q = query.toLowerCase();
    return items.filter((i) => i.label.toLowerCase().includes(q));
  }, [items, query]);

  const toggleItem = (val: string) => {
    const set = new Set(selected);
    if (set.has(val)) set.delete(val); else set.add(val);
    onChange(Array.from(set));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className={"gap-1 min-w-[160px] justify-between " + (className ?? "")}>Access Level <ChevronDown className="size-4" /></Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60 p-3 border-[#E2E4E9]" onCloseAutoFocus={(e) => e.preventDefault()}>
        <div className="mb-2">
          <Input placeholder="Search by name" value={query} onChange={(e) => setQuery(e.target.value)} className="h-8 border-[#E2E4E9]" leftIcon={<Search className="size-4" />}/>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 py-1.5">
            <RadioGroup value={allSelected ? "all" : "custom"} onValueChange={(v) => v === "all" ? onChange([]) : null} className="flex items-center">
              <RadioGroupItem id="access-all" value="all" className="border-[#DFE1E6]"/>
            </RadioGroup>
            <Label htmlFor="access-all" className="cursor-pointer">All</Label>
          </div>

          {filtered.map((opt) => (
            <div key={opt.value} className="flex items-center gap-2 py-1.5">
              <Checkbox
                id={`access-${opt.value}`}
                checked={selected.includes(opt.value)}
                onCheckedChange={() => toggleItem(opt.value)}
                className="border-[#DFE1E6]"
              />
              <Label htmlFor={`access-${opt.value}`} className="cursor-pointer">{opt.label}</Label>
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}


