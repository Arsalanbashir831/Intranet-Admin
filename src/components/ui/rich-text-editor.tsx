"use client";

import * as React from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { TextAlign } from "@tiptap/extension-text-align";
import { BulletList } from "@tiptap/extension-bullet-list";
import { OrderedList } from "@tiptap/extension-ordered-list";
import { ListItem } from "@tiptap/extension-list-item";
import { Image } from "@tiptap/extension-image";
import { Placeholder } from "@tiptap/extension-placeholder";
import { Highlight } from "@tiptap/extension-highlight";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HexColorPicker } from "react-colorful";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Image as ImageIcon,
  Upload,
  Type,
  ChevronUp,
  ChevronDown,
  HighlighterIcon,
  BaselineIcon,
} from "lucide-react";
import { Input } from "./input";
import { ScrollArea, ScrollBar } from "./scroll-area";

export interface RichTextEditorProps {
  content?: string;
  onChange?: (content: string) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  minHeight?: string;
  maxHeight?: string;
}

export function RichTextEditor({
  content = "",
  onChange,
  placeholder = "Write your content here...",
  className,
  disabled = false,
  minHeight = "200px",
  maxHeight = "400px",
}: RichTextEditorProps) {
  const [fontSize, setFontSize] = React.useState(16);
  const [showTextColorPicker, setShowTextColorPicker] = React.useState(false);
  const [showHighlightColorPicker, setShowHighlightColorPicker] = React.useState(false);
  const [textColor, setTextColor] = React.useState("#000000");
  const [highlightColor, setHighlightColor] = React.useState("#FFFF00");
  const [imageUrl, setImageUrl] = React.useState("");
  const [showImagePopover, setShowImagePopover] = React.useState(false);

  // Quick color presets
  const quickTextColors = [
    "#000000", "#333333", "#666666", "#999999", "#CCCCCC", "#FFFFFF",
    "#FF0000", "#FF6600", "#FFCC00", "#00FF00", "#0066FF", "#6600FF",
    "#FF0066", "#00FFFF", "#FFFF00", "#FF00FF", "#00FF66", "#0066FF"
  ];

  const quickHighlightColors = [
    "#FFFF00", "#FFE066", "#FFB366", "#FF9999", "#99CCFF", "#99FF99",
    "#FFCCFF", "#CC99FF", "#FFE6CC", "#E6F3FF", "#E6FFE6", "#FFF0E6",
    "#F0F8FF", "#F5F5DC", "#FFE4E1", "#E0FFFF", "#F0FFF0", "#FFFACD"
  ];

  // Close color pickers when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('[data-color-picker]')) {
        setShowTextColorPicker(false);
        setShowHighlightColorPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Remove unwanted features
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
        hardBreak: false,
        code: false,
        // Keep only what we need
        bold: {},
        italic: {},
        strike: {},
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      TextStyle,
      Color,
      TextAlign.configure({
        types: ["paragraph"],
      }),
      BulletList.configure({
        HTMLAttributes: {
          class: "list-disc list-inside",
        },
        itemTypeName: "listItem",
        keepMarks: true,
        keepAttributes: false,
      }),
      OrderedList.configure({
        HTMLAttributes: {
          class: "list-decimal list-inside",
        },
        itemTypeName: "listItem",
        keepMarks: true,
        keepAttributes: false,
      }),
      ListItem.configure({
        HTMLAttributes: {
          class: "list-item",
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: "max-w-full h-auto rounded",
        },
      }),
      Highlight.configure({
        multicolor: true,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    editable: !disabled,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange?.(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: cn(
          "prose prose-sm sm:prose-base max-w-none focus:outline-none",
          "prose-p:leading-relaxed prose-pre:p-0",
          "prose-ul:my-2 prose-ol:my-2 prose-li:my-1",
          "[&_ul_li_p]:inline [&_ol_li_p]:inline [&_ul_li_p]:m-0 [&_ol_li_p]:m-0"
        ),
      },
    },
  });

  // Update editor content when `content` prop changes (e.g., in edit forms)
  React.useEffect(() => {
    if (!editor) return;
    if (typeof content === "string") {
      // Avoid unnecessary updates if content is already the same
      try {
        const current = editor.getHTML();
        if (current !== content) {
          editor.commands.setContent(content);
        }
      } catch {
        editor.commands.setContent(content);
      }
    }
  }, [editor, content]);

  const updateFontSize = (size: number) => {
    setFontSize(size);
    editor?.chain().focus().setFontSize(`${size}px`).run();
  };

  const handleTextColorChange = (color: string) => {
    setTextColor(color);
    editor?.chain().focus().setColor(color).run();
  };

  const handleHighlightColorChange = (color: string) => {
    setHighlightColor(color);
    editor?.chain().focus().setHighlight({ color }).run();
  };

  const toggleHighlight = () => {
    if (editor?.isActive("highlight")) {
      editor?.chain().focus().unsetHighlight().run();
    } else {
      editor?.chain().focus().setHighlight({ color: highlightColor }).run();
    }
  };

  const insertImage = () => {
    if (imageUrl.trim()) {
      editor?.chain().focus().setImage({ src: imageUrl.trim() }).run();
      setImageUrl("");
      setShowImagePopover(false);
    }
  };

  const handleImageUrlKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      insertImage();
    }
  };

  const handleFontSizeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value && !isNaN(Number(value))) {
      updateFontSize(Number(value));
    }
  };

  const handleFontSizeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Prevent focus from moving to editor when typing numbers
    e.stopPropagation();
  };

  if (!editor) {
    return null;
  }

  return (
    <div className={cn("rounded-md border border-[#E2E8F0]", className)}>
      <ScrollArea className="h-full">
        <ScrollBar orientation="horizontal" />

        {/* Toolbar */}
        <div className="flex items-center gap-1 border-b border-[#E2E8F0] text-muted-foreground text-sm">
          {/* Font Size */}
          <div className="pl-2">
            <Input
              type="number"
              value={fontSize}
              onChange={handleFontSizeChange}
              onKeyDown={handleFontSizeKeyDown}
              className="w-11 h-6 text-xs text-[#475569] font-bold border-none shadow-none rounded pl-1 pr-0 [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:m-0 [&::-webkit-inner-spin-button]:m-0"
              min="8"
              max="72"
              rightIconClickable={true}
              rightIcon={<div className="flex flex-col gap-1">
                <ChevronUp className="size-3 -mb-1 cursor-pointer text-[#475569] hover:text-foreground" onClick={() => updateFontSize(fontSize + 1)} />
                <ChevronDown className="size-3 -mt-1 cursor-pointer text-[#475569] hover:text-foreground" onClick={() => updateFontSize(fontSize - 1)} />
              </div>
              }
            />
          </div>

          {/* Separator */}
          <Separator orientation="vertical" className="!h-10 mx-1 bg-[#E2E8F0]" />

          <div className="flex items-center gap-2">
            {/* Text Color */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className={cn("size-6 p-0 text-[#475569]", editor?.isActive("textStyle") && "bg-muted")}
                onClick={() => setShowTextColorPicker(!showTextColorPicker)}
              >
                <BaselineIcon className="size-4" />
              </Button>

              {/* Text Color Picker */}
              {showTextColorPicker && (
                <div className="absolute z-20 mt-2 bg-white border rounded-lg shadow-lg p-3" data-color-picker>
                  {/* Quick Color Presets */}
                  <div className="mb-3">
                    <div className="text-xs text-muted-foreground mb-2">Quick Colors</div>
                    <div className="grid grid-cols-6 gap-1">
                      {quickTextColors.map((color) => (
                        <Button
                          key={color}
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "w-6 h-6 rounded border-2 transition-all hover:scale-110",
                            textColor === color ? "border-gray-400 ring-2 ring-gray-300" : "border-gray-200 hover:border-gray-300"
                          )}
                          style={{ backgroundColor: color }}
                          onClick={() => handleTextColorChange(color)}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Color Picker */}
                  <div className="border-t pt-3">
                    <div className="text-xs text-muted-foreground mb-2">Custom Color</div>
                    <HexColorPicker
                      color={textColor}
                      onChange={handleTextColorChange}
                      style={{ width: "200px" }}
                    />
                  </div>

                  <div className="mt-3 flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Text Color</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => setShowTextColorPicker(false)}
                    >
                      Done
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Highlight Color */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className={cn("size-6 p-0 text-[#475569]", editor?.isActive("highlight") && "bg-muted")}
                onClick={toggleHighlight}
                onContextMenu={(e) => {
                  e.preventDefault();
                  setShowHighlightColorPicker(!showHighlightColorPicker);
                }}
                title="Left click: Toggle highlight | Right click: Change color"
              >
                <HighlighterIcon className="size-4" />
              </Button>

              {/* Highlight Color Picker */}
              {showHighlightColorPicker && (
                <div className="absolute z-20 mt-2 bg-white border rounded-lg shadow-lg p-3" data-color-picker>
                  {/* Quick Color Presets */}
                  <div className="mb-3">
                    <div className="text-xs text-muted-foreground mb-2">Quick Colors</div>
                    <div className="grid grid-cols-6 gap-1">
                      {quickHighlightColors.map((color) => (
                        <Button
                          variant="ghost"
                          size="sm"
                          key={color}
                          className={cn(
                            "w-6 h-6 rounded border-2 transition-all hover:scale-110",
                            highlightColor === color ? " ring-2 ring-gray-300" : "border-gray-200 hover:border-gray-300"
                          )}
                          style={{ backgroundColor: color }}
                          onClick={() => handleHighlightColorChange(color)}
                          title={color}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Color Picker */}
                  <div className="border-t pt-3">
                    <div className="text-xs text-muted-foreground mb-2">Custom Color</div>
                    <HexColorPicker
                      color={highlightColor}
                      onChange={handleHighlightColorChange}
                      style={{ width: "200px" }}
                    />
                  </div>

                  <div className="mt-3 flex justify-between items-center">
                    <span className="text-xs text-muted-foreground">Highlight Color</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                      onClick={() => setShowHighlightColorPicker(false)}
                    >
                      Done
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Bold */}
            <Button
              variant="ghost"
              size="sm"
              className={cn("size-6 p-0 text-[#475569]", editor.isActive("bold") && "bg-muted")}
              onClick={() => editor.chain().focus().toggleBold().run()}
            >
              <Bold className="size-4" />
            </Button>

            {/* Italic */}
            <Button
              variant="ghost"
              size="sm"
              className={cn("size-6 p-0 text-[#475569]", editor.isActive("italic") && "bg-muted")}
              onClick={() => editor.chain().focus().toggleItalic().run()}
            >
              <Italic className="size-4" />
            </Button>

            {/* Underline */}
            <Button
              variant="ghost"
              size="sm"
              className={cn("size-6 p-0 text-[#475569]", editor.isActive("underline") && "bg-muted")}
              onClick={() => editor.chain().focus().toggleUnderline().run()}
            >
              <Underline className="size-4" />
            </Button>

            {/* Strikethrough */}
            <Button
              variant="ghost"
              size="sm"
              className={cn("size-6 p-0 text-[#475569]", editor.isActive("strike") && "bg-muted")}
              onClick={() => editor.chain().focus().toggleStrike().run()}
            >
              <Strikethrough className="size-4" />
            </Button>
          </div>

          {/* Separator */}
          <Separator orientation="vertical" className="!h-10 mx-1 bg-[#E2E8F0]" />

          {/* Text Alignment */}
          <Button
            variant="ghost"
            size="sm"
            className={cn("size-6 p-0 text-[#475569]", editor.isActive({ textAlign: "left" }) && "bg-muted")}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
          >
            <AlignLeft className="size-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={cn("size-6 p-0 text-[#475569]", editor.isActive({ textAlign: "center" }) && "bg-muted")}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
          >
            <AlignCenter className="size-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={cn("size-6 p-0 text-[#475569]", editor.isActive({ textAlign: "right" }) && "bg-muted")}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
          >
            <AlignRight className="size-4" />
          </Button>

          {/* Separator */}
          <Separator orientation="vertical" className="!h-10 mx-1 bg-[#E2E8F0]" />

          {/* Lists */}
          <Button
            variant="ghost"
            size="sm"
            className={cn("size-6 p-0 text-[#475569]", editor.isActive("bulletList") && "bg-muted")}
            onClick={() => {
              if (editor?.isActive("bulletList")) {
                editor.chain().focus().toggleBulletList().run();
              } else {
                editor?.chain().focus().toggleBulletList().run();
              }
            }}
          >
            <List className="size-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={cn("size-6 p-0 text-[#475569]", editor.isActive("orderedList") && "bg-muted")}
            onClick={() => {
              if (editor?.isActive("orderedList")) {
                editor.chain().focus().toggleOrderedList().run();
              } else {
                editor?.chain().focus().toggleOrderedList().run();
              }
            }}
          >
            <ListOrdered className="size-4" />
          </Button>

          {/* Separator */}
          <Separator orientation="vertical" className="!h-10 mx-1 bg-[#E2E8F0]" />

          {/* Image */}
          <Popover open={showImagePopover} onOpenChange={setShowImagePopover}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="size-6 p-0 text-[#475569]"
              >
                <ImageIcon className="size-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3" align="start">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Image URL
                  </label>
                  <Input
                    placeholder="Enter image URL..."
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    onKeyDown={handleImageUrlKeyDown}
                    className="w-full"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setImageUrl("");
                      setShowImagePopover(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={insertImage}
                    disabled={!imageUrl.trim()}
                  >
                    Insert Image
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          {/* Upload */}
          <Button
            variant="ghost"
            size="sm"
            className="size-6 p-0 text-[#475569]"
            onClick={() => {
              // Handle file upload
              console.log("Upload file");
            }}
          >
            <Upload className="size-4" />
          </Button>

          {/* Separator */}
          <Separator orientation="vertical" className="!h-10 mx-1 bg-[#E2E8F0]" />

          {/* Tags */}
          <Button
            variant="ghost"
            className="w-14 h-6 p-0 text-[#475569]"
            onClick={() => {
              // Insert hashtag with muted color and italic styling
              editor?.chain().focus().insertContent('<span style="color: #6b7280; font-style: italic;">#</span>').run();
            }}
          >
            <Type className="size-4" />
            <span className="text-xs">Tags</span>
          </Button>
        </div>

      </ScrollArea>

      {/* Editor Content */}
      <div
        className="p-4 focus-within:outline-none"
        style={{
          minHeight,
          maxHeight,
          overflowY: "auto",
        }}
      >
        <EditorContent
          editor={editor}
          className="focus:outline-none [&_ul_li_p]:inline [&_ol_li_p]:inline [&_ul_li_p]:m-0 [&_ol_li_p]:m-0 [&_ul_li_p]:p-0 [&_ol_li_p]:p-0"
          style={{ fontSize: `${fontSize}px` }}
        />
      </div>
    </div>
  );
}
