"use client";

import { useEffect, useRef } from "react";
import { CommandIcon, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

import { handleSearchShortcut } from "@/handlers/card-table-handlers";
import { TableSearchProps } from "@/types/card-table";

export function TableSearch({
  placeholder = "Search",
  value,
  onChange,
}: TableSearchProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) =>
      handleSearchShortcut(e, inputRef as React.RefObject<HTMLInputElement>);
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <Input
      ref={inputRef}
      value={value}
      className="flex-1 border-[#AFAFAF] placeholder:text-muted-foreground rounded-[4px] pr-18"
      containerClassName="max-w-[360px]"
      placeholder={placeholder}
      aria-label="Search in table"
      leftIcon={<Search className="size-4" />}
      rightIcon={
        <div className="flex items-center gap-1">
          <kbd className="rounded-[4px] bg-[#F2F2F2] p-1 text-muted-foreground">
            <CommandIcon className="size-4" />
          </kbd>
          <kbd className="rounded-[4px] bg-[#F2F2F2] px-2 text-muted-foreground">
            F
          </kbd>
        </div>
      }
      onChange={(e) => onChange?.(e.target.value)}
    />
  );
}
