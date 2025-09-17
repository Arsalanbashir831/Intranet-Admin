"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Upload, Plus, ImagePlusIcon } from "lucide-react";
import { Button } from "./button";
import { Input } from "./input";
import Image from "next/image";

export interface DropzoneProps {
  onFileSelect?: (files: FileList | null) => void;
  accept?: string;
  maxSize?: number; // in bytes
  className?: string;
  disabled?: boolean;
  multiple?: boolean;
  children?: React.ReactNode;
  showPreview?: boolean;
}

export const Dropzone = React.forwardRef<HTMLDivElement, DropzoneProps>(
  ({ 
    onFileSelect, 
    accept = "image/*", 
    maxSize = 800 * 400, // 800x400px default
    className,
    disabled = false,
    multiple = false,
    children,
    showPreview = true,
    ...props 
  }, ref) => {
    const [isDragOver, setIsDragOver] = React.useState(false);
    const [previewUrls, setPreviewUrls] = React.useState<string[]>([]);
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
          setPreviewUrls(prev => [...prev, ...newUrls]);
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
          setPreviewUrls(prev => [...prev, ...newUrls]);
        }
      }
    };

    const clearAllImages = () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      setPreviewUrls([]);
    };

    // Clean up preview URLs on unmount
    React.useEffect(() => {
      return () => {
        previewUrls.forEach(url => URL.revokeObjectURL(url));
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
              <button
                type="button"
                onClick={clearAllImages}
                className="text-xs text-red-500 hover:text-red-600 font-medium"
              >
                Clear all
              </button>
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
                  <button
                    type="button"
                    onClick={() => {
                      const newUrls = previewUrls.filter((_, i) => i !== index);
                      setPreviewUrls(newUrls);
                      URL.revokeObjectURL(url);
                    }}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleClick}
              className="mt-3 text-sm text-primary hover:text-primary/80 font-medium"
            >
              Add more images
            </button>
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
