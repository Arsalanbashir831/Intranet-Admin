"use client";

import * as React from "react";
import { ReactNode } from "react";
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
  // Optional hooks for async search
  useSearch?: (query: string) => {
    data?: { results?: SelectableItem[] } | SelectableItem[];
    isLoading: boolean;
  };
  useAllItems?: () => {
    data?: { results?: SelectableItem[] } | SelectableItem[];
    isLoading: boolean;
  };
  // Debounce search in milliseconds
  searchDebounce?: number;
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
  searchDebounce = 300,
}: SelectableTagsProps) {
  const [searchValue, setSearchValue] = React.useState("");
  const debouncedSearchValue = useDebounce(searchValue, searchDebounce);
  
  // Store previous search results to avoid flashing
  const previousSearchResults = React.useRef<SelectableItem[]>([]);

  // Use async search hooks if provided
  const searchResult = useSearch?.(debouncedSearchValue);
  const allItemsResult = useAllItems?.();
  
  // Debug logging
  React.useEffect(() => {
    if (useSearch && useAllItems) {
      console.log('=== SelectableTags Debug ===');
      console.log('Search value:', searchValue);
      console.log('Debounced search value:', debouncedSearchValue);
      console.log('Search result:', searchResult);
      console.log('All items result:', allItemsResult);
    }
  }, [searchValue, debouncedSearchValue, searchResult, allItemsResult, useSearch, useAllItems]);
  
  // Determine which items to use (async or static)
  const currentItems = React.useMemo(() => {
    if (useSearch && useAllItems) {
      // Using async search
      if (debouncedSearchValue && debouncedSearchValue.trim()) {
        const searchData = searchResult?.data;
        console.log('Using search data:', searchData, 'isLoading:', searchResult?.isLoading); // Debug
        
        // If loading and we have previous results, keep showing them
        if (searchResult?.isLoading && previousSearchResults.current.length > 0) {
          return previousSearchResults.current;
        }
        
        if (Array.isArray(searchData)) {
          previousSearchResults.current = searchData;
          return searchData;
        } else if (searchData?.results) {
          previousSearchResults.current = searchData.results;
          return searchData.results;
        }
        return previousSearchResults.current;
      } else {
        const allData = allItemsResult?.data;
        console.log('Using all data:', allData, 'isLoading:', allItemsResult?.isLoading); // Debug
        
        if (allItemsResult?.isLoading) {
          return []; // Return empty while loading initial data
        }
        
        if (Array.isArray(allData)) {
          return allData;
        } else if (allData?.results) {
          return allData.results;
        }
        return [];
      }
    } else {
      // Using static items with local filtering
      if (!searchValue) return items;
      return items.filter((item) =>
        item.label.toLowerCase().includes(searchValue.toLowerCase())
      );
    }
  }, [useSearch, useAllItems, debouncedSearchValue, searchValue, searchResult, allItemsResult, items]);

  const isLoading = React.useMemo(() => {
    if (useSearch && useAllItems) {
      return debouncedSearchValue && debouncedSearchValue.trim() 
        ? (searchResult?.isLoading ?? false) 
        : (allItemsResult?.isLoading ?? false);
    }
    return false;
  }, [useSearch, useAllItems, debouncedSearchValue, searchResult, allItemsResult]);

  // Get available items (not selected)
  const availableItems = React.useMemo(() => {
    const filtered = currentItems.filter((item: SelectableItem) => !selectedItems.includes(item.id));
    return filtered;
  }, [currentItems, selectedItems]);

  const handleRemove = (value: string) => {
    if (!selectedItems.includes(value)) {
      return;
    }
    onSelectionChange(selectedItems.filter((v) => v !== value));
  };

  const handleSelect = (value: string) => {
    if (selectedItems.includes(value)) {
      handleRemove(value);
      return;
    }
    onSelectionChange([...selectedItems, value]);
  };

  const handleCreateTag = () => {
    if (searchValue.trim() && allowCreate && onCreateTag) {
      onCreateTag(searchValue.trim());
      setSearchValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && searchValue.trim() && allowCreate) {
      e.preventDefault();
      handleCreateTag();
    }
  };

  return (
    <div className={cn("w-full", className)}>
      <Tags>
        <TagsTrigger 
          className="w-full min-h-10 h-auto border-[#E2E8F0] rounded-[8px]" 
          disabled={disabled}
          placeholder={placeholder}
          icon={icon}
        >
          {selectedItems.map((itemId) => {
            const item = currentItems.find((i: SelectableItem) => i.id === itemId) || items.find((i: SelectableItem) => i.id === itemId);
            if (renderSelected) {
              return (
                <TagsValue
                  key={itemId}
                  onRemove={() => handleRemove(itemId)}
                  className="bg-white hover:bg-transparent text-current flex items-center border border-[#AFAFAF]"
                  icon={<CircleX size={12} />}
                  iconContainerClassName="grid size-5 place-items-center rounded-full text-[#868C98] hover:text-[#868C98]/80"
                >
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
                iconContainerClassName="text-muted-foreground group-hover:text-muted-foreground/80 hover:text-muted-foreground/80"
              >
                {item?.label || itemId}
              </TagsValue>
            );
          })}
        </TagsTrigger>
        <TagsContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <TagsInput
            placeholder={searchPlaceholder}
            value={searchValue}
            onValueChange={setSearchValue}
            onKeyDown={handleKeyDown}
          />
          <TagsList style={{ maxHeight }} className="p-1">
            <TagsEmpty>{isLoading ? "Loading..." : emptyMessage}</TagsEmpty>
            <TagsGroup>
              {availableItems.map((item: SelectableItem) => (
                <TagsItem
                  key={item.id}
                  onSelect={() => handleSelect(item.id)}
                  value={item.id}
                  className="cursor-pointer"
                >
                  {renderItem ? renderItem(item.id) : item.label}
                </TagsItem>
              ))}
              {allowCreate && searchValue.trim() && !currentItems.some((item: SelectableItem) => item.label.toLowerCase() === searchValue.toLowerCase()) && (
                <TagsItem
                  onSelect={handleCreateTag}
                  value={`create-${searchValue}`}
                  className="cursor-pointer text-primary"
                >
                  Create &ldquo;{searchValue}&rdquo;
                </TagsItem>
              )}
            </TagsGroup>
          </TagsList>
        </TagsContent>
      </Tags>
    </div>
  );
}

// Helper function to create SelectableItem from simple data
export function createSelectableItems<T extends { id: string; name: string }>(
  data: T[]
): SelectableItem[] {
  return data.map((item) => ({
    id: item.id,
    label: item.name,
  }));
}

// Helper function to create SelectableItem from custom data
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
