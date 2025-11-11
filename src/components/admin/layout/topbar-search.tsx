"use client";

import { useEffect, useRef, useState } from "react";
import { CommandIcon, Search, ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { NAV_ITEMS } from "@/constants/nav-items";

export function TopbarSearch() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const cmdInputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().includes("MAC");
      const mod = isMac ? e.metaKey : e.ctrlKey;
      if (mod && (e.key.toLowerCase() === "k")) {
        e.preventDefault();
        setOpen(true);
        // Defer focus until after popover opens/mounts
        setTimeout(() => {
          inputRef.current?.focus();
        }, 0);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Auto-focus input whenever the popover is opened (e.g., by mouse)
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const filteredPages = NAV_ITEMS.filter((page) =>
    page.label.toLowerCase().includes(searchValue.toLowerCase()) ||
    page.description.toLowerCase().includes(searchValue.toLowerCase())
  );

  return (
    <>
      <div className="flex-1 max-w-[360px]">
        <Input
          ref={inputRef}
          className="border-[#AFAFAF] placeholder:text-muted-foreground rounded-[4px]"
          placeholder="Search pages..."
          aria-label="Search"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === "Enter") {
              e.preventDefault();
              setOpen(true);
              requestAnimationFrame(() => cmdInputRef.current?.focus());
            }
          }}
          leftIcon={<Search className="size-4" />}
          rightIcon={
            <div className="flex items-center gap-1">
              <kbd className="rounded-[4px] bg-[#F2F2F2] p-1 text-muted-foreground">
                <CommandIcon className="size-4" />
              </kbd>
              <kbd className="rounded-[4px] bg-[#F2F2F2] px-2 text-muted-foreground">K</kbd>
            </div>
          }
        />
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <Command>
          <CommandInput
            ref={cmdInputRef}
            value={searchValue}
            onValueChange={setSearchValue}
            placeholder="Search pages..."
          />
          <ScrollArea className="max-h-80">
            <CommandList className="bg-white/80 backdrop-blur-sm">
              <CommandEmpty>No pages found.</CommandEmpty>
              <CommandGroup>
                {filteredPages.map((page) => (
                  <CommandItem
                    key={page.href}
                    value={page.label}
                    onSelect={() => {
                      setOpen(false);
                      setSearchValue("");
                      router.push(page.href);
                    }}
                    className="flex items-center justify-between p-3 cursor-pointer"
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex items-center justify-center bg-[#f3ebee] p-1 rounded-sm">
                        <span
                          className="size-6 inline-block bg-current shrink-0"
                          style={{
                            WebkitMaskImage: `url(${page.iconSrc})`,
                            maskImage: `url(${page.iconSrc})`,
                            WebkitMaskRepeat: "no-repeat",
                            maskRepeat: "no-repeat",
                            WebkitMaskPosition: "center",
                            maskPosition: "center",
                            WebkitMaskSize: "contain",
                            maskSize: "contain",
                          }}
                          aria-hidden
                        />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-sm">{page.label}</span>
                        <span className="text-xs text-muted-foreground">{page.description}</span>
                      </div>
                    </div>
                    <ArrowRight className="size-4 text-muted-foreground" />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </ScrollArea>
        </Command>
      </CommandDialog>
    </>
  );
}


