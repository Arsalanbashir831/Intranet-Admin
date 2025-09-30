"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { ImagePlusIcon, XIcon } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import Image from "next/image";

export interface DropzoneProps {
  onFileSelect?: (files: FileList | null) => void;
  onClear?: () => void; // Callback when images are cleared
  onImageRemove?: (url: string, index: number) => void; // Callback when individual image is removed
  accept?: string;
  maxSize?: number; // in bytes
  className?: string;
  disabled?: boolean;
  multiple?: boolean;
  children?: React.ReactNode;
  showPreview?: boolean;
  initialPreviewUrls?: string[]; // pre-loaded previews (e.g., existing images in edit mode)
}

export const Dropzone = React.forwardRef<HTMLDivElement, DropzoneProps>(
  ({
    onFileSelect,
    onClear,
    onImageRemove,
    accept = "image/*",
    maxSize = 800 * 400, // 800x400px default
    className,
    disabled = false,
    multiple = false,
    children,
    showPreview = true,
    initialPreviewUrls = [],
    ...props
  }, ref) => {
    const [isDragOver, setIsDragOver] = React.useState(false);
    const [previewUrls, setPreviewUrls] = React.useState<string[]>(initialPreviewUrls ?? []);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragOver(true);
      }
    };

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
    };


    const handleClick = () => {
      if (!disabled) {
        fileInputRef.current?.click();
      }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        onFileSelect?.(files);

        // Generate preview URLs for images
        if (showPreview && accept.includes('image')) {
          const newUrls: string[] = [];
          Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
              newUrls.push(URL.createObjectURL(file));
            }
          });
          if (multiple) {
            setPreviewUrls(prev => [...prev, ...newUrls]);
          } else {
            // Replace previous preview with the latest selected image when multiple=false
            setPreviewUrls(newUrls.slice(0, 1));
          }
        }
      }

      // Clear the input value so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        onFileSelect?.(files);

        // Generate preview URLs for images
        if (showPreview && accept.includes('image')) {
          const newUrls: string[] = [];
          Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
              newUrls.push(URL.createObjectURL(file));
            }
          });
          if (multiple) {
            setPreviewUrls(prev => [...prev, ...newUrls]);
          } else {
            setPreviewUrls(newUrls.slice(0, 1));
          }
        }
      }
    };

    const clearAllImages = () => {
      previewUrls.forEach(url => { if (url.startsWith('blob:')) URL.revokeObjectURL(url) });
      setPreviewUrls([]);
      onClear?.(); // Notify parent component about clearing
    };

    // Sync external previews and clean up on change/unmount
    React.useEffect(() => {
      if (initialPreviewUrls && initialPreviewUrls.length) {
        setPreviewUrls(initialPreviewUrls);
      }
    }, [initialPreviewUrls?.join(",")]);

    React.useEffect(() => {
      return () => {
        previewUrls.forEach(url => {
          // Only revoke blob URLs; skip absolute URLs passed in
          if (url.startsWith("blob:")) URL.revokeObjectURL(url);
        });
      };
    }, [previewUrls]);

    return (
      <div
        ref={ref}
        className={cn(
          "flex items-center gap-4",
          className
        )}
        {...props}
      >
        {/* Upload Icon Button */}
        <Button
          type="button"
          variant="outline"
          onClick={handleClick}
          disabled={disabled}
          className={cn(
            "grid size-14 place-items-center rounded-full border-2 text-primary transition-colors",
            "border-primary hover:bg-primary/5 focus:outline-none focus:ring-2 focus:ring-primary/20",
            "hover:text-secondary hover:border-secondary",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          <div className="relative">
            <ImagePlusIcon className="size-6" />
          </div>
        </Button>

        {/* Dropzone Area or Preview */}
        {previewUrls.length > 0 && showPreview ? (
          <div className="flex-1 rounded-md border border-[#E2E8F0] p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">
                {previewUrls.length} image{previewUrls.length !== 1 ? 's' : ''} selected
              </span>
              <Button
                variant="link"
                type="button"
                onClick={clearAllImages}
                className="text-xs p-0 text-red-500 hover:text-red-600 font-medium hover:no-underline h-fit"
              >
                {multiple ? "Clear all" : "Clear"}
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <Image
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-24 object-cover rounded-md border"
                    width={100}
                    height={100}
                  />
                  <Button
                    type="button"
                    size='icon'
                    onClick={() => {
                      const urlToRemove = previewUrls[index];
                      const newUrls = previewUrls.filter((_, i) => i !== index);
                      setPreviewUrls(newUrls);
                      
                      // Only revoke blob URLs, not absolute URLs
                      if (urlToRemove.startsWith('blob:')) {
                        URL.revokeObjectURL(urlToRemove);
                      }
                      
                      // Notify parent about removal
                      onImageRemove?.(urlToRemove, index);
                      
                      // If all images are removed, notify parent
                      if (newUrls.length === 0) {
                        onClear?.();
                      }
                    }}
                    className="absolute -top-2 -right-2 bg-primary text-white rounded-full size-6 flex items-center justify-center text-xs hover:bg-primary/90 transition-colors"
                  >
                    <XIcon size={12} />
                  </Button>
                </div>
              ))}
            </div>
            <Button
              variant="link"
              type="button"
              onClick={handleClick}
              className="mt-3 p-0 text-sm text-primary hover:text-primary/80 font-medium hover:no-underline h-fit"
            >
              {multiple ? "Add more images" : "Update image"}
            </Button>
          </div>
        ) : (
          <div
            onClick={handleClick}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={cn(
              "flex-1 rounded-md border border-[#E2E8F0] p-6 text-sm text-muted-foreground cursor-pointer transition-colors",
              "hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/20",
              isDragOver && "border-primary bg-primary/5",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            <div className="text-center">
              <span className="text-primary font-medium">Click to upload</span>
              <span className="text-muted-foreground"> or drag and drop</span>
              <div className="text-xs text-muted-foreground mt-1">
                SVG, PNG, JPG or GIF (max. 800x400px)
              </div>
            </div>
          </div>
        )}

        {/* Hidden File Input */}
        <Input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileChange}
          className="hidden"
          disabled={disabled}
        />

        {/* Custom Children */}
        {children}
      </div>
    );
  }
);

Dropzone.displayName = "Dropzone";
