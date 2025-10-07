"use client";

import * as React from "react";
import { ReactNode, useMemo, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
	Tags,
	TagsTrigger,
	TagsValue,
	TagsContent,
	TagsInput,
	TagsList,
	TagsEmpty,
	TagsGroup,
	TagsItem,
} from "@/components/ui/tags";
import { CircleX } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

export interface SelectableItem {
	id: string;
	label: string;
}

export interface SelectableTagsProps {
	items: SelectableItem[];
	selectedItems: string[];
	onSelectionChange: (selectedItems: string[]) => void;
	placeholder?: string;
	searchPlaceholder?: string;
	emptyMessage?: string;
	className?: string;
	disabled?: boolean;
	maxHeight?: string;
	allowCreate?: boolean;
	onCreateTag?: (label: string) => void;
	icon?: ReactNode;

	// Optional custom renderer to display selected items inside the trigger
	renderSelected?: (id: string) => ReactNode;
	// Optional custom renderer to display items in the dropdown list
	renderItem?: (id: string) => ReactNode;

	/**
	 * Async providers (expected to return SelectableItem[])
	 * Treat these like hooks: for a given instance, either pass both (async mode)
	 * or omit both (static mode). Do not toggle their presence across renders.
	 */
	useSearch?: (query: string) => {
		data?: SelectableItem[];
		isLoading: boolean;
	};
	useAllItems?: () => { data?: SelectableItem[]; isLoading: boolean };

	// Debounce search in milliseconds
	searchDebounce?: number;

	// Hide already-selected rows from the dropdown (default true)
	hideSelectedFromList?: boolean;

	// Keep prior results visible while loading fresh search results (default true)
	keepPreviousWhileLoading?: boolean;

	// External control (optional)
	onSearchValueChange?: (value: string) => void;
	initialSearchValue?: string;
}

export function SelectableTags({
	items,
	selectedItems,
	onSelectionChange,
	placeholder = "Search items...",
	searchPlaceholder = "Search items...",
	emptyMessage = "No items found.",
	className,
	disabled = false,
	maxHeight = "200px",
	allowCreate = false,
	onCreateTag,
	icon,
	renderSelected,
	renderItem,
	useSearch,
	useAllItems,
	searchDebounce = 500,
	hideSelectedFromList = true,
	onSearchValueChange,
	initialSearchValue = "",
}: SelectableTagsProps) {
	const [searchValue, setSearchValue] = React.useState(initialSearchValue);

	// Handler for search value changes
	const handleSearchChange = React.useCallback(
		(value: string) => {
			setSearchValue(value);
			onSearchValueChange?.(value);
		},
		[onSearchValueChange]
	);

	const debouncedSearchValue = useDebounce(searchValue, searchDebounce);

	// Store previous search results to avoid flashing
	const previousSearchResults = React.useRef<SelectableItem[]>([]);

	// Use async search hooks if provided
	const searchResult = useSearch?.(debouncedSearchValue);
	const allItemsResult = useAllItems?.();

	// ----- current items (async vs static) -----
	// Determine which items to use (async or static)
	const currentItems = React.useMemo(() => {
		if (useSearch && useAllItems) {
			// Using async search
			if (debouncedSearchValue && debouncedSearchValue.trim()) {
				// Use search results
				if (searchResult?.isLoading) {
					// While loading, keep showing previous results if available
					return previousSearchResults.current.length > 0
						? previousSearchResults.current
						: [];
				}

				// Process search data
				const searchData: unknown = searchResult?.data;
				let itemsToReturn: SelectableItem[] = [];

				// Handle different data structures
				// First, check if it's already processed as SelectableItem[] (from adapter functions)
				if (
					Array.isArray(searchData) &&
					searchData.length > 0 &&
					typeof searchData[0] === "object" &&
					searchData[0] !== null &&
					"id" in searchData[0] &&
					"label" in searchData[0]
				) {
					itemsToReturn = searchData as SelectableItem[];
				} else if (Array.isArray(searchData)) {
					itemsToReturn = searchData as SelectableItem[];
				} else if (
					searchData &&
					typeof searchData === "object" &&
					"results" in searchData &&
					Array.isArray((searchData as { results: unknown }).results)
				) {
					itemsToReturn = (searchData as { results: SelectableItem[] }).results;
				} else if (
					searchData &&
					typeof searchData === "object" &&
					"branches" in searchData &&
					(searchData as { branches: unknown }).branches &&
					typeof (searchData as { branches: unknown }).branches === "object" &&
					"results" in
						(searchData as { branches: { results: unknown } }).branches &&
					Array.isArray(
						(searchData as { branches: { results: unknown } }).branches.results
					)
				) {
					itemsToReturn = (
						searchData as { branches: { results: SelectableItem[] } }
					).branches.results;
				} else if (
					searchData &&
					typeof searchData === "object" &&
					"departments" in searchData &&
					(searchData as { departments: unknown }).departments &&
					typeof (searchData as { departments: unknown }).departments ===
						"object" &&
					"results" in
						(searchData as { departments: { results: unknown } }).departments &&
					Array.isArray(
						(searchData as { departments: { results: unknown } }).departments
							.results
					)
				) {
					itemsToReturn = (
						searchData as { departments: { results: SelectableItem[] } }
					).departments.results;
				}

				// Update previous results and return
				previousSearchResults.current = itemsToReturn;
				return itemsToReturn;
			} else {
				// Use all items
				if (allItemsResult?.isLoading) {
					return [];
				}

				const allData: unknown = allItemsResult?.data;
				let itemsToReturn: SelectableItem[] = [];

				// Handle different data structures for all items
				// First, check if it's already processed as SelectableItem[] (from adapter functions)
				if (
					Array.isArray(allData) &&
					allData.length > 0 &&
					typeof allData[0] === "object" &&
					allData[0] !== null &&
					"id" in allData[0] &&
					"label" in allData[0]
				) {
					itemsToReturn = allData as SelectableItem[];
				} else if (Array.isArray(allData)) {
					itemsToReturn = allData as SelectableItem[];
				} else if (
					allData &&
					typeof allData === "object" &&
					"results" in allData &&
					Array.isArray((allData as { results: unknown }).results)
				) {
					itemsToReturn = (allData as { results: SelectableItem[] }).results;
				} else if (
					allData &&
					typeof allData === "object" &&
					"branches" in allData &&
					(allData as { branches: unknown }).branches &&
					typeof (allData as { branches: unknown }).branches === "object" &&
					"results" in
						(allData as { branches: { results: unknown } }).branches &&
					Array.isArray(
						(allData as { branches: { results: unknown } }).branches.results
					)
				) {
					itemsToReturn = (
						allData as { branches: { results: SelectableItem[] } }
					).branches.results;
				} else if (
					allData &&
					typeof allData === "object" &&
					"departments" in allData &&
					(allData as { departments: unknown }).departments &&
					typeof (allData as { departments: unknown }).departments ===
						"object" &&
					"results" in
						(allData as { departments: { results: unknown } }).departments &&
					Array.isArray(
						(allData as { departments: { results: unknown } }).departments
							.results
					)
				) {
					itemsToReturn = (
						allData as { departments: { results: SelectableItem[] } }
					).departments.results;
				}

				// Clear previous search results when showing all items
				previousSearchResults.current = [];
				return itemsToReturn;
			}
		} else {
			// Using static items with local filtering
			if (!debouncedSearchValue) return items;

			return items.filter((item) =>
				item.label.toLowerCase().includes(debouncedSearchValue.toLowerCase())
			);
		}
	}, [
		useSearch,
		useAllItems,
		debouncedSearchValue,
		searchResult,
		allItemsResult,
		items,
	]);

	// Make sure currentItems is always an array
	const safeCurrentItems = useMemo(() => {
		return Array.isArray(currentItems) ? currentItems : [];
	}, [currentItems]);

	// Loading state
	const isLoading = React.useMemo(() => {
		if (useSearch && useAllItems) {
			// When searching, use search loading state
			if (debouncedSearchValue && debouncedSearchValue.trim()) {
				return searchResult?.isLoading ?? false;
			}
			// When not searching, use all items loading state
			return allItemsResult?.isLoading ?? false;
		}
		return false;
	}, [
		useSearch,
		useAllItems,
		debouncedSearchValue,
		searchResult?.isLoading,
		allItemsResult?.isLoading,
	]);

	// Selected set for O(1) lookups
	const selectedSet = useMemo(() => new Set(selectedItems), [selectedItems]);

	// Stable label map (prevents chip flicker to raw ids)
	const labelMap = useMemo(() => {
		const m = new Map<string, string>();
		items.forEach((i) => m.set(i.id, i.label));
		safeCurrentItems.forEach((i) => m.set(i.id, i.label));
		return m;
	}, [items, safeCurrentItems]);

	// Available options in the dropdown
	const availableItems = useMemo(() => {
		if (!hideSelectedFromList) return safeCurrentItems;
		return safeCurrentItems.filter((item) => !selectedSet.has(item.id));
	}, [safeCurrentItems, selectedSet, hideSelectedFromList]);

	// ----- handlers -----
	const handleRemove = useCallback(
		(value: string) => {
			if (!selectedSet.has(value)) return;
			onSelectionChange(selectedItems.filter((v) => v !== value));
		},
		[onSelectionChange, selectedItems, selectedSet]
	);

	const handleSelect = useCallback(
		(value: string) => {
			if (selectedSet.has(value)) {
				onSelectionChange(selectedItems.filter((v) => v !== value));
			} else {
				onSelectionChange([...selectedItems, value]);
			}
		},
		[onSelectionChange, selectedItems, selectedSet]
	);

	const handleCreateTag = useCallback(() => {
		if (allowCreate && onCreateTag && searchValue.trim()) {
			onCreateTag(searchValue.trim());
			handleSearchChange("");
		}
	}, [allowCreate, onCreateTag, searchValue, handleSearchChange]);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Enter" && allowCreate && searchValue.trim()) {
				e.preventDefault();
				handleCreateTag();
			}
		},
		[allowCreate, searchValue, handleCreateTag]
	);

	// ----- render -----
	return (
		<div className={cn("w-full", className)}>
			<Tags>
				<TagsTrigger
					className="w-full min-h-10 h-auto border-[#E2E8F0] rounded-[8px]"
					disabled={disabled}
					placeholder={placeholder}
					icon={icon}>
					{selectedItems.map((itemId) => {
						const label = labelMap.get(itemId) ?? itemId;

						if (renderSelected) {
							return (
								<TagsValue
									key={itemId}
									onRemove={() => handleRemove(itemId)}
									className="bg-white hover:bg-transparent text-current flex items-center border border-[#AFAFAF]"
									icon={<CircleX size={12} />}
									iconContainerClassName="grid size-5 place-items-center rounded-full text-[#868C98] hover:text-[#868C98]/80">
									<div className="flex items-center gap-2 rounded-[10px] py-1">
										{renderSelected(itemId)}
									</div>
								</TagsValue>
							);
						}

						return (
							<TagsValue
								key={itemId}
								onRemove={() => handleRemove(itemId)}
								variant="secondary"
								className="bg-[#FFF2F6] text-primary group"
								icon={<CircleX size={12} />}
								iconContainerClassName="text-muted-foreground group-hover:text-muted-foreground/80 hover:text-muted-foreground/80">
								{label}
							</TagsValue>
						);
					})}
				</TagsTrigger>

				<TagsContent
					className="w-[var(--radix-popover-trigger-width)] p-0"
					align="start">
					{(() => {
						return (
							<>
								<TagsInput
									placeholder={searchPlaceholder}
									value={searchValue}
									onValueChange={handleSearchChange}
									onKeyDown={handleKeyDown}
								/>

								<TagsList style={{ maxHeight }} className="p-1 overflow-auto">
									{isLoading ? (
										<TagsEmpty>Loading...</TagsEmpty>
									) : availableItems.length === 0 ? (
										<TagsEmpty>{emptyMessage}</TagsEmpty>
									) : (
										<TagsGroup>
											{availableItems.map((item) => (
												<TagsItem
													key={item.id}
													onSelect={() => handleSelect(item.id)}
													value={item.id}
													className="cursor-pointer">
													{renderItem ? renderItem(item.id) : item.label}
												</TagsItem>
											))}{" "}
											{allowCreate &&
												searchValue.trim() &&
												!safeCurrentItems.some(
													(it) =>
														it.label.toLowerCase() ===
														searchValue.trim().toLowerCase()
												) && (
													<TagsItem
														onSelect={handleCreateTag}
														value={`create-${searchValue}`}
														className="cursor-pointer text-primary">
														Create &ldquo;{searchValue}&rdquo;
													</TagsItem>
												)}
										</TagsGroup>
									)}
								</TagsList>
							</>
						);
					})()}
				</TagsContent>
			</Tags>
		</div>
	);
}

// Helper: normalize from {id,name}
export function createSelectableItems<T extends { id: string; name: string }>(
	data: T[]
): SelectableItem[] {
	return data.map((item) => ({
		id: String(item.id),
		label: String(item.name),
	}));
}

// Helper: normalize from custom keys
export function createCustomSelectableItems<T>(
	data: T[],
	idKey: keyof T,
	labelKey: keyof T
): SelectableItem[] {
	return data.map((item) => ({
		id: String(item[idKey]),
		label: String(item[labelKey]),
	}));
}
