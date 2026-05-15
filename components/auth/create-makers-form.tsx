"use client";

import React, { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { authClient } from "@/lib/auth/auth-client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "../ui/dialog";
import { Loader2, Copy, Check, EyeOff, Eye } from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { Field, FieldError, FieldLabel } from "../ui/field";
import LoadingButton from "../button/loading-button";
import CopyableDataRow from "./copyable-data-row";

const makerSchema = z.object({
  name: z.string().min(2, "Name must be atleast 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type MakerFormValues = z.infer<typeof makerSchema>;

function CreateMakersForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
    data?: { name: string; email: string; pass: string };
  } | null>(null);
  const form = useForm<MakerFormValues>({
    resolver: zodResolver(makerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: MakerFormValues) => {
    setLoading(true);

    const { error } = await authClient.admin.createUser({
      ...values,
      role: "maker" as any,
    });
    setLoading(false);

    if (error) {
      setStatus({
        type: "error",
        message: error.message || "Failed to create user",
      });
    } else {
      setStatus({
        type: "success",
        message: "User created Successfully",
        data: { name: values.name, email: values.email, pass: values.password },
      });
      form.reset();
    }
  };

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const copyAll = () => {
    if (!status?.data) return;
    const text = `Name: ${status.data.name}\nEmail: ${status.data.email}\nPassword: ${status.data.pass}`;
    copyToClipboard(text, "all");
  };

  return (
    <div style={{ fontFamily: "'Poppins', sans-serif" }}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <Controller
          name="name"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="text"
                placeholder="Enter Maker's Email Address"
                aria-invalid={fieldState.invalid}
                className="rounded-md h-11"
              />
              <FieldError errors={fieldState.error ? [fieldState.error] : []} />
            </Field>
          )}
        />

        <Controller
          name="email"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Email</FieldLabel>
              <Input
                {...field}
                id={field.name}
                type="email"
                placeholder="Enter your email address"
                aria-invalid={fieldState.invalid}
                className="rounded-md h-11"
              />
              <FieldError errors={fieldState.error ? [fieldState.error] : []} />
            </Field>
          )}
        />

        <Controller
          name="password"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Pasword</FieldLabel>
              <div className="relative">
                <Input
                  {...field}
                  id={field.name}
                  type={showPassword ? "text" : "password"}
                  placeholder="**********"
                  aria-invalid={fieldState.invalid}
                  className="rounded-md h-11"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 rounded-md hover:bg-muted cursor-pointer"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>

              <FieldError errors={fieldState.error ? [fieldState.error] : []} />
            </Field>
          )}
        />
        <LoadingButton
          type="submit"
          loading={loading}
          className="w-full h-11 rounded-md font-semibold mt-2"
        >
          Create Account
        </LoadingButton>
      </form>

      {/* 🏙️ PROFESSIONAL SUCCESS MODAL */}
      <Dialog open={!!status} onOpenChange={() => setStatus(null)}>
        <DialogContent className="rounded-md border-border bg-card p-8 max-w-sm shadow-none">
          <DialogHeader className="mb-4 text-left">
            <DialogTitle className="text-xl font-bold tracking-tight">
              {status?.type === "success" ? "User Provisioned" : "System Error"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5">
            <p className="text-sm text-muted-foreground leading-relaxed">
              {status?.message}
            </p>

            {status?.data && (
              <div className="space-y-1 rounded-md border border-border bg-muted/30 overflow-hidden">
                {/* Name Row */}
                <CopyableDataRow
                  label="Full Name"
                  value={status.data.name}
                  fieldName="name"
                  copiedField={copiedField}
                  onCopy={copyToClipboard}
                />

                {/* Email Row */}
                <CopyableDataRow
                  label="Email Address"
                  value={status.data.email}
                  fieldName="email"
                  copiedField={copiedField}
                  onCopy={copyToClipboard}
                />

                {/* Password Row */}
                <CopyableDataRow
                  label="Password"
                  value={status.data.pass}
                  fieldName="pass"
                  copiedField={copiedField}
                  onCopy={copyToClipboard}
                  isLast
                />
              </div>
            )}

            {status?.data && (
              <Button
                variant="outline"
                size="sm"
                className="w-full h-10 rounded-md gap-2 text-xs font-semibold"
                onClick={copyAll}
              >
                {copiedField === "all" ? (
                  <Check size={14} className="text-green-600" />
                ) : (
                  <Copy size={14} />
                )}
                {copiedField === "all" ? "Copied All" : "Copy Full Report"}
              </Button>
            )}
          </div>

          <DialogFooter className="mt-8 pt-4 border-t border-border/50">
            <Button
              onClick={() => setStatus(null)}
              className="w-full h-10 rounded-md font-semibold"
            >
              Dismiss
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default CreateMakersForm;
