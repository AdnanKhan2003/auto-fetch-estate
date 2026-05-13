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
import { Loader2, Copy, Check } from "lucide-react";

function CreateMakersForm() {
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
    data?: { name: string; email: string; pass: string };
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const { error } = await authClient.admin.createUser({
      name,
      email,
      password,
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
        message: "User created successfully",
        data: { name, email, pass: password },
      });
      (e.target as HTMLFormElement).reset();
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
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground ml-1">
            Full Name
          </label>
          <Input
            name="name"
            placeholder="Enter Maker's Name"
            required
            className="rounded-md h-11 border-border bg-background px-4 focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground ml-1">
            Email Address
          </label>
          <Input
            name="email"
            placeholder="Enter Maker's Email Address"
            type="email"
            required
            className="rounded-md h-11 border-border bg-background px-4 focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground ml-1">
            Password
          </label>
          <Input
            name="password"
            type="password"
            placeholder="••••••••"
            required
            className="rounded-md h-11 border-border bg-background px-4 focus-visible:ring-1 focus-visible:ring-ring"
          />
        </div>
        <Button
          type="submit"
          className="w-full h-11 rounded-md font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-colors mt-2 cursor-pointer"
          disabled={loading}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
              Processing...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
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
                <div className="flex items-center justify-between p-3 border-b border-border/50">
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-bold uppercase text-muted-foreground/70">
                      Full Name
                    </p>
                    <p className="text-[13px] font-medium">
                      {status.data.name}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-md"
                    onClick={() => copyToClipboard(status.data!.name, "name")}
                  >
                    {copiedField === "name" ? (
                      <Check size={14} className="text-green-600" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </Button>
                </div>

                {/* Email Row */}
                <div className="flex items-center justify-between p-3 border-b border-border/50">
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-bold uppercase text-muted-foreground/70">
                      Email Address
                    </p>
                    <p className="text-[13px] font-medium">
                      {status.data.email}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-md"
                    onClick={() => copyToClipboard(status.data!.email, "email")}
                  >
                    {copiedField === "email" ? (
                      <Check size={14} className="text-green-600" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </Button>
                </div>

                {/* Password Row */}
                <div className="flex items-center justify-between p-3">
                  <div className="space-y-0.5">
                    <p className="text-[9px] font-bold uppercase text-muted-foreground/70">
                      Password
                    </p>
                    <p className="text-[13px] font-medium">
                      {status.data.pass}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-md"
                    onClick={() => copyToClipboard(status.data!.pass, "pass")}
                  >
                    {copiedField === "pass" ? (
                      <Check size={14} className="text-green-600" />
                    ) : (
                      <Copy size={14} />
                    )}
                  </Button>
                </div>
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
