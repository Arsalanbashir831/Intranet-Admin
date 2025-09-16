"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Upload } from "lucide-react";

export function OrgChartForm() {
  return (
      <div className="grid gap-6">
        <div className="grid grid-cols-12 items-center gap-4 border-t border-[#E9EAEB] pt-4">
          <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">Name:</Label>
          <div className="col-span-12 md:col-span-10">
            <Input placeholder="Name" />
          </div>
        </div>

        <div className="grid grid-cols-12 items-center gap-4">
          <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">Address:</Label>
          <div className="col-span-12 md:col-span-10">
            <Input placeholder="Address" />
          </div>
        </div>

        <div className="grid grid-cols-12 items-center gap-4">
          <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">City:</Label>
          <div className="col-span-12 md:col-span-10">
            <Input placeholder="City" />
          </div>
        </div>

        <div className="grid grid-cols-12 items-center gap-4">
          <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">Phone Number:</Label>
          <div className="col-span-12 md:col-span-10">
            <Input placeholder="Phone Number" />
          </div>
        </div>

        <div className="grid grid-cols-12 items-center gap-4">
          <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">Email Id:</Label>
          <div className="col-span-12 md:col-span-10">
            <Input placeholder="Email Id" type="email" />
          </div>
        </div>

        <div className="grid grid-cols-12 items-center gap-4 border-t border-[#E9EAEB] pt-4">
          <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">Reporting to:</Label>
          <div className="col-span-12 md:col-span-10">
            <Input placeholder="Michael James" />
          </div>
        </div>

        <div className="grid grid-cols-12 items-center gap-4">
          <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">Department:</Label>
          <div className="col-span-12 md:col-span-10">
            <Input placeholder="HR" />
          </div>
        </div>

        <div className="grid grid-cols-12 items-center gap-4">
          <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">Branch/Location:</Label>
          <div className="col-span-12 md:col-span-10">
            <Input placeholder="Lahore" />
          </div>
        </div>

        <div className="grid grid-cols-12 items-start gap-4 border-t border-[#E9EAEB] pt-4">
          <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">Profile Picture:</Label>
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

        <div className="grid grid-cols-12 items-start gap-4">
          <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">Qualification and Education</Label>
          <div className="col-span-12 md:col-span-10">
            <div className="rounded-md border">
              <div className="flex items-center justify-between border-b p-2 text-muted-foreground text-sm">
                <div className="flex items-center gap-2">
                  <span>16</span>
                  <span>A</span>
                  <span>B</span>
                  <span>I</span>
                  <span>U</span>
                  <span>S</span>
                </div>
                <div className="text-xs text-muted-foreground">10–60 word limit</div>
              </div>
              <Textarea rows={8} placeholder="Write Qualification and Education" className="min-h-40 resize-y rounded-none border-0 focus-visible:ring-0" />
            </div>
          </div>
        </div>
      </div>
  );
}


