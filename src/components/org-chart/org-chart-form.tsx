"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dropzone } from "@/components/ui/dropzone";
import { SelectableTags, createSelectableItems, type SelectableItem } from "@/components/ui/selectable-tags";
import { RichTextEditor } from "@/components/ui/rich-text-editor";

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
            <Input placeholder="Name" className="border-[#E2E8F0]"/>
          </div>
        </div>

        <div className="grid grid-cols-12 items-center gap-4">
          <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">Address:</Label>
          <div className="col-span-12 md:col-span-10">
            <Input placeholder="Address" className="border-[#E2E8F0]"/>
          </div>
        </div>

        <div className="grid grid-cols-12 items-center gap-4">
          <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">City:</Label>
          <div className="col-span-12 md:col-span-10">
            <Input placeholder="City" className="border-[#E2E8F0]"/>
          </div>
        </div>

        <div className="grid grid-cols-12 items-center gap-4">
          <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">Phone Number:</Label>
          <div className="col-span-12 md:col-span-10">
            <Input placeholder="Phone Number" className="border-[#E2E8F0]"/>
          </div>
        </div>

        <div className="grid grid-cols-12 items-center gap-4">
          <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">Email Id:</Label>
          <div className="col-span-12 md:col-span-10">
            <Input placeholder="Email Id" type="email" className="border-[#E2E8F0]"/>
          </div>
        </div>

        <div className="grid grid-cols-12 items-center gap-4 border-t border-[#E9EAEB] pt-4">
          <Label className="col-span-12 md:col-span-2 text-sm text-muted-foreground">Reporting to:</Label>
          <div className="col-span-12 md:col-span-10">
            <Input placeholder="Michael James" className="border-[#E2E8F0]"/>
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
            <Input placeholder="Lahore" className="border-[#E2E8F0]"/>
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
            <RichTextEditor
              placeholder="Write Qualification and Education"
              minHeight="200px"
              maxHeight="400px"
            />
          </div>
        </div>
      </div>
  );
}


