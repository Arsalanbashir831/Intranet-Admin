"use client";

import * as React from "react";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerDescription, DrawerFooter } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Filter } from "lucide-react";

interface FilterDrawerProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onApply?: (filters: Record<string, unknown>) => void;
    onReset?: () => void;
    showFilterButton?: boolean;
    showResetButton?: boolean;
    children: React.ReactNode;
    title?: string;
    description?: string;
    applyText?: string;
    resetText?: string;
}

export function FilterDrawer({
    open,
    onOpenChange,
    onApply = () => { },
    onReset = () => { },
    showFilterButton = true,
    showResetButton = true,
    children,
    title = "Filters",
    description = "Filter the results based on your preferences",
    applyText = "Apply Filters",
    resetText = "Reset"
}: FilterDrawerProps) {
    return (
        <Drawer open={open} onOpenChange={onOpenChange} direction="right">
            <DrawerContent className="h-screen w-screen max-w-sm ml-auto">
                <div className="mx-auto w-full max-w-sm">
                    <DrawerHeader>
                        <DrawerTitle>{title}</DrawerTitle>
                        <DrawerDescription>{description}</DrawerDescription>
                    </DrawerHeader>
                </div>
                <ScrollArea className="h-[calc(100vh-140px)] px-4">
                    <div className="mx-auto w-full max-w-sm pb-4">
                        {children}
                    </div>
                </ScrollArea>

                <DrawerFooter className="mx-auto w-full max-w-sm">
                    {showFilterButton &&
                        <Button onClick={() => onApply({})} className="w-full">
                            {applyText}
                        </Button>
                    }
                    {showResetButton &&
                        <Button variant="outline" onClick={onReset} className="w-full">
                            {resetText}
                        </Button>
                    }
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}

interface FilterTriggerProps {
    onClick: () => void;
    isActive?: boolean;
    className?: string;
    children?: React.ReactNode;
}

export function FilterTrigger({ onClick, className, children }: FilterTriggerProps) {
    return (
        <Button
            variant="outline"
            onClick={onClick}
            className={className}
            aria-label="Filter"
        >
            <Filter className="size-4" />
            {children}
        </Button>
    );
}