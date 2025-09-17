"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dropzone } from "@/components/ui/dropzone";
import { SelectableTags, createSelectableItems, type SelectableItem } from "@/components/ui/selectable-tags";

export function OrgChartForm() {
  // Sample departments data - in real app, this would come from props or API
  const departments = [
    { id: "1", name: "Human Resources" },
    { id: "2", name: "Engineering" },
    { id: "3", name: "Marketing" },
    { id: "4", name: "Sales" },
    { id: "5", name: "Finance" },
    { id: "6", name: "Operations" },
  ];

  const [selectedDepartment, setSelectedDepartment] = React.useState<string[]>([]);

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
            <SelectableTags
              items={createSelectableItems(departments)}
              selectedItems={selectedDepartment}
              onSelectionChange={setSelectedDepartment}
              searchPlaceholder="Search departments..."
              emptyMessage="No departments found."
            />
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
             <Dropzone 
               onFileSelect={(files) => {
                 console.log("Files selected:", files);
                 // Handle file upload logic here
               }}
               accept="image/*"
               maxSize={800 * 400}
             />
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


