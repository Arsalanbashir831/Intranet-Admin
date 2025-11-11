"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useChangePassword } from "@/hooks/queries/use-auth";
import { toast } from "sonner";

type Values = { current: string; next: string; confirm: string };

// Move Field component outside to prevent re-creation on each render
const Field = React.memo(
  ({
    id,
    label,
    valueKey,
    values,
    setValues,
    show,
    toggle,
    loading,
  }: {
    id: string;
    label: string;
    valueKey: keyof Values;
    values: Values;
    setValues: React.Dispatch<React.SetStateAction<Values>>;
    show: { [k: string]: boolean };
    toggle: (k: keyof Values) => void;
    loading: boolean;
  }) => (
    <div className="space-y-2">
      <Label htmlFor={id} className="text-sm">
        {label}
      </Label>
      <div className="relative">
        <Input
          id={id}
          type={show[valueKey] ? "text" : "password"}
          value={values[valueKey]}
          onChange={(e) =>
            setValues((v) => ({ ...v, [valueKey]: e.target.value }))
          }
          className="w-full"
          placeholder="Your Password"
          disabled={loading}
        />
        <Button
          variant="ghost"
          onClick={() => toggle(valueKey)}
          className="absolute right-3 top-1/2 -translate-y-1/2"
          aria-label="Toggle password visibility"
          disabled={loading}
        >
          {show[valueKey] ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  )
);

Field.displayName = "Field";

export function ChangePasswordDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [show, setShow] = React.useState<{ [k: string]: boolean }>({});
  const [values, setValues] = React.useState<Values>({
    current: "",
    next: "",
    confirm: "",
  });
  const [error, setError] = React.useState<string>("");
  const { mutate: changePassword, isPending: loading } = useChangePassword();

  const toggle = (k: keyof Values) => setShow((s) => ({ ...s, [k]: !s[k] }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!values.current || !values.next || !values.confirm) {
      setError("All fields are required.");
      return;
    }
    if (values.next !== values.confirm) {
      setError("New password and confirm password do not match.");
      return;
    }

    changePassword(
      {
        current_password: values.current,
        new_password: values.next,
      },
      {
        onSuccess: () => {
          // Reset form on success
          setValues({ current: "", next: "", confirm: "" });
          toast.success("Password changed successfully");
          onOpenChange(false);
        },
        onError: (error: unknown) => {
          // Handle API error response with multiple fallbacks
          let errorMessage = "Failed to change password. Please try again.";

          // Check various possible error structures
          if (error && typeof error === "object" && "response" in error) {
            const axiosError = error as {
              response?: { data?: { error?: string; detail?: string } };
            };
            if (axiosError.response?.data?.error) {
              // Direct error message from API
              errorMessage = axiosError.response.data.error;
            } else if (axiosError.response?.data?.detail) {
              // Django REST framework style error
              errorMessage = axiosError.response.data.detail;
            }
          } else if (error instanceof Error) {
            // Standard Error message
            errorMessage = error.message;
          }

          // Display error with toast notification as per project specification
          toast.error(errorMessage);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Change Password</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Field
            id="current"
            label="Current password"
            valueKey="current"
            values={values}
            setValues={setValues}
            show={show}
            toggle={toggle}
            loading={loading}
          />
          <Field
            id="next"
            label="New password"
            valueKey="next"
            values={values}
            setValues={setValues}
            show={show}
            toggle={toggle}
            loading={loading}
          />
          <Field
            id="confirm"
            label="Confirm password"
            valueKey="confirm"
            values={values}
            setValues={setValues}
            show={show}
            toggle={toggle}
            loading={loading}
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Change Password"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
