import * as React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dropzone } from "@/components/ui/dropzone";
import { SelectableTags, createSelectableItems } from "@/components/ui/selectable-tags";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { ChevronDownIcon } from "lucide-react";

export function CompanyHubForm() {
  // Sample departments data - in real app, this would come from props or API
  const departments = [
    { id: "1", name: "Human Resources" },
    { id: "2", name: "Engineering" },
    { id: "3", name: "Marketing" },
    { id: "4", name: "Sales" },
    { id: "5", name: "Finance" },
    { id: "6", name: "Operations" },
  ];

  const [selectedDepartments, setSelectedDepartments] = React.useState<string[]>([]);

  return (
      <div className="grid gap-6">
        <div className="grid grid-cols-12 items-start gap-4 border-b border-[#E9EAEB] pb-4">
          <Label className="col-span-12 md:col-span-2 text-sm">Type:</Label>
          <div className="col-span-12 md:col-span-10">
            <RadioGroup defaultValue="policy" className="flex gap-6">
              <div className="flex items-center gap-2">
                <RadioGroupItem value="announcement" id="type-ann"/>
                <Label htmlFor="type-ann" className="cursor-pointer text-[#535862]">Announcement</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="policy" id="type-pol" />
                <Label htmlFor="type-pol" className="cursor-pointer text-[#535862]">Policy</Label>
              </div>
            </RadioGroup>
          </div>
        </div>

        <div className="grid grid-cols-12 items-center gap-4 border-b border-[#E9EAEB] pb-4">
          <Label className="col-span-12 md:col-span-2 text-sm">Title:</Label>
          <div className="col-span-12 md:col-span-10">
            <Input placeholder="e.g. Announcement 1/Policy" className="border-[#E2E8F0]"/>
          </div>
        </div>

        <div className="grid grid-cols-12 items-start gap-4 border-b border-[#E9EAEB] pb-4">
          <Label className="col-span-12 md:col-span-2 text-sm">Attachments:</Label>
          <div className="col-span-12 md:col-span-10">
            <Dropzone 
              onFileSelect={(files) => {
                console.log("Files selected:", files);
                // Handle file upload logic here
              }}
              accept="image/*"
              maxSize={800 * 400}
              multiple
            />
          </div>
        </div>

        <div className="grid grid-cols-12 items-center gap-4 border-b border-[#E9EAEB] pb-4">
          <Label className="col-span-12 md:col-span-2 text-sm">Hashtags/tags:</Label>
          <div className="col-span-12 md:col-span-10">
            <Input placeholder="#importantNotice" className="border-[#E2E8F0]" />
          </div>
        </div>

        <div className="grid grid-cols-12 items-center gap-4 border-b border-[#E9EAEB] pb-4">
          <Label className="col-span-12 md:col-span-2 text-sm">View Access:</Label>
          <div className="col-span-12 md:col-span-10">
            <SelectableTags
              items={createSelectableItems(departments)}
              selectedItems={selectedDepartments}
              onSelectionChange={setSelectedDepartments}
              placeholder="Select view access"
              searchPlaceholder="Search departments..."
              emptyMessage="No departments found."
              icon={<ChevronDownIcon size={12} className="text-[#535862]" />}
            />
          </div>
        </div>

        <div className="grid grid-cols-12 items-center gap-4 border-b border-[#E9EAEB] pb-4">
          <Label className="col-span-12 md:col-span-2 text-sm">Posted by:</Label>
          <div className="col-span-12 md:col-span-10">
            <Input placeholder="Michael James" className="border-[#E2E8F0]" />
          </div>
        </div>

        <div className="grid grid-cols-12 items-start gap-4">
          <Label className="col-span-12 md:col-span-2 text-sm">Description:</Label>
          <div className="col-span-12 md:col-span-10">
            <RichTextEditor
              placeholder="Write Description for the Announcement/Policy"
              minHeight="200px"
              maxHeight="400px"
            />
          </div>
        </div>
      </div>
  );
}


