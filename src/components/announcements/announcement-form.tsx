import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCreateAnnouncement, useUpdateAnnouncement } from "@/hooks/queries/use-announcements";
import { toast } from "sonner";
import type { AnnouncementCreateRequest } from "@/services/announcements";

const announcementSchema = z.object({
  title: z.string().min(1, "Title is required"),
  body: z.string().min(1, "Body is required"),
  type: z.enum(["announcement", "policy"]).optional(),
  hash_tags: z.string().optional(),
  is_active: z.boolean().optional(),
  inherits_parent_permissions: z.boolean().optional(),
});

type AnnouncementFormValues = z.infer<typeof announcementSchema>;

export type AnnouncementFormProps = {
  initialValues?: Partial<AnnouncementFormValues>;
  isEdit?: boolean;
  announcementId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
};

export function AnnouncementForm({
  initialValues,
  isEdit = false,
  announcementId,
  onSuccess,
  onCancel,
}: AnnouncementFormProps) {
  const createAnnouncement = useCreateAnnouncement();
  const updateAnnouncement = useUpdateAnnouncement(announcementId || "");

  const form = useForm<AnnouncementFormValues>({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      title: "",
      body: "",
      type: "announcement",
      hash_tags: "",
      is_active: true,
      inherits_parent_permissions: true,
      ...initialValues,
    },
  });

  const onSubmit = async (values: AnnouncementFormValues) => {
    try {
      const payload: AnnouncementCreateRequest = {
        title: values.title,
        body: values.body,
        type: values.type,
        hash_tags: values.hash_tags || null,
        is_active: values.is_active,
        inherits_parent_permissions: values.inherits_parent_permissions,
      };

      if (isEdit && announcementId) {
        await updateAnnouncement.mutateAsync(payload);
        toast.success("Announcement updated successfully");
      } else {
        await createAnnouncement.mutateAsync(payload);
        toast.success("Announcement created successfully");
      }

      onSuccess?.();
    } catch (error) {
      console.error("Error saving announcement:", error);
      toast.error(isEdit ? "Failed to update announcement" : "Failed to create announcement");
    }
  };

  const isLoading = createAnnouncement.isPending || updateAnnouncement.isPending;

  return (
    <Card className="border-[#FFF6F6] shadow-none">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">
          {isEdit ? "Edit Announcement" : "Create New Announcement"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter announcement title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="body"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Content</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter announcement content" 
                      className="min-h-[120px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select announcement type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="announcement">Announcement</SelectItem>
                      <SelectItem value="policy">Policy</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="hash_tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter tags separated by commas" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex items-center justify-between">
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">Publish immediately</FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="inherits_parent_permissions"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="font-normal">Inherit permissions</FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? "Saving..." : isEdit ? "Update" : "Create"} Announcement
              </Button>
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}