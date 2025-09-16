"use client";

import { useEffect, useRef } from "react";
import { CommandIcon, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export function TopbarSearch() {
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && (e.key.toLowerCase() === "k")) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
      <Input
        ref={inputRef}
        className="flex-1 border-[#AFAFAF] placeholder:text-muted-foreground rounded-[4px]"
        containerClassName="max-w-[360px]"
        placeholder="Search"
        aria-label="Search"
        leftIcon={ <Search className="size-4" /> }
        rightIcon={ <kbd className="rounded-[4px] bg-[#F2F2F2] p-1 text-muted-foreground"><CommandIcon className="size-4"/></kbd>
        }
      />
     
  );
}


