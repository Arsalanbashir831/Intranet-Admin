"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Upload } from "lucide-react";

export function CompanyHubForm() {
  return (
      <div className="grid gap-6">
        <div className="grid grid-cols-12 items-start gap-4 border-b border-[#E9EAEB] pb-4">
          <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">Type:</Label>
          <div className="col-span-12 md:col-span-10">
            <RadioGroup defaultValue="policy" className="flex gap-6">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="announcement" id="type-ann" />
                <Label htmlFor="type-ann" className="cursor-pointer">Announcement</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="policy" id="type-pol" />
                <Label htmlFor="type-pol" className="cursor-pointer">Policy</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <div className="grid grid-cols-12 items-center gap-4 border-b border-[#E9EAEB] pb-4">
          <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">Title:</Label>
          <div className="col-span-12 md:col-span-10">
            <Input placeholder="e.g. Announcement 1/Policy" />
          </div>
        </div>

        <div className="grid grid-cols-12 items-start gap-4 border-b border-[#E9EAEB] pb-4">
          <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">Attachments:</Label>
          <div className="col-span-12 md:col-span-10">
            <div className="flex items-center gap-4">
              <button className="grid size-14 place-items-center rounded-full border-2 border-[#D64575] text-[#D64575]" type="button">
                <Upload />
              </button>
              <div className="flex-1 rounded-md border p-6 text-sm text-muted-foreground">
                <span className="text-[#D64575]">Click to upload</span> or drag and drop
                <div className="text-xs">SVG, PNG, JPG or GIF (max. 800x400px)</div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-12 items-center gap-4 border-b border-[#E9EAEB] pb-4">
          <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">Hashtags/tags:</Label>
          <div className="col-span-12 md:col-span-10">
            <Input defaultValue="#importantNotice" />
          </div>
        </div>

        <div className="grid grid-cols-12 items-center gap-4 border-b border-[#E9EAEB] pb-4">
          <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">View Access:</Label>
          <div className="col-span-12 md:col-span-10">
            <Input placeholder="Select teams" />
          </div>
        </div>

        <div className="grid grid-cols-12 items-center gap-4 border-b border-[#E9EAEB] pb-4">
          <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">Posted by:</Label>
          <div className="col-span-12 md:col-span-10">
            <Input defaultValue="Michael James" />
          </div>
        </div>

        <div className="grid grid-cols-12 items-start gap-4">
          <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">Description:</Label>
          <div className="col-span-12 md:col-span-10">
            <div className="rounded-md border">
              <div className="flex items-center gap-2 border-b p-2 text-muted-foreground text-sm">
                <span>16</span>
                <span>A</span>
                <span>B</span>
                <span>I</span>
                <span>U</span>
                <span>S</span>
              </div>
              <Textarea rows={8} placeholder="Write Description for the Announcement/Policy" className="min-h-40 resize-y rounded-none border-0 focus-visible:ring-0" />
            </div>
          </div>
        </div>
      </div>
  );
}


