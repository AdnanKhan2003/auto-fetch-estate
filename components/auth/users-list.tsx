"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { authClient } from "@/lib/auth/auth-client";
import { Button } from "../ui/button";
import { AlertCircle, Loader2, Trash2, Pencil, Search } from "lucide-react";
import * as z from "zod";
import { Field, FieldError, FieldLabel, FieldGroup } from "../ui/field";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Input } from "../ui/input";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import LoadingButton from "../button/loading-button";
import StatusModal from "../modal/status-modal";
import UserRow from "./user-row";
import EmptyState from "../empty-state";

const editUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  role: z.enum(["admin", "maker"]),
});

type EditUserValues = z.infer<typeof editUserSchema>;

function UsersList() {
  const form = useForm<EditUserValues>({
    resolver: zodResolver(editUserSchema),
    mode: "onChange",
  });
  const [users, setUsers] = useState<any[]>([]);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [userToEdit, setUserToEdit] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { data: session } = authClient.useSession();
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchUsers = async () => {
    const { data } = await authClient.admin.listUsers({
      query: { limit: 100 },
    });

    if (data?.users) {
      const otherUsers = data.users.filter((u) => u.id !== session?.user?.id);
      setUsers(otherUsers);
    }
  };

  useEffect(() => {
    if (session) fetchUsers();
  }, [session]);

  useEffect(() => {
    if (userToEdit) {
      form.reset({
        name: userToEdit.name,
        role: userToEdit.role,
      });
    }
  }, [userToEdit, form]);

  const confirmDelete = async () => {
    if (!userToDelete) return;

    setIsDeleting(userToDelete.id);
    const { error } = await authClient.admin.removeUser({
      userId: userToDelete.id,
    });

    if (error) {
      setStatus({
        type: "error",
        message: error.message || "Failed to delete user",
      });
    } else {
      await fetchUsers();
    }
    setIsDeleting(null);
    setUserToDelete(null);
  };

  const handleUpdateUser = async (values: EditUserValues) => {
    if (!userToEdit) return;
    setIsUpdating(true);

    try {
      await authClient.admin.updateUser({
        userId: userToEdit.id,
        data: { name: values.name },
      });

      await authClient.admin.setRole({
        userId: userToEdit.id,
        role: values.role as any,
      });

      await fetchUsers();
      setUserToEdit(null);
    } catch (err) {
      console.error("Update failed", err);
    } finally {
      setIsUpdating(false);
    }
  };

  const totalMakers = users.filter((u) => u.role === "maker").length;

  const createdThisMonth = users.filter((u) => {
    if (u.role !== "maker") return false;
    const date = new Date(u.createdAt);
    const now = new Date();
    return (
      date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    );
  }).length;

  const suspendedMakers = users.filter((u) => u.role === "maker" && u.banned).length;

  return (
    <div
      className="space-y-8 max-w-4xl"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      {/* 📊 KPI METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Total Makers */}
        <div className="bg-card border border-border rounded-xl p-6 flex flex-col justify-between shadow-none hover:border-foreground/20 transition-all duration-300">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            Total Makers
          </span>
          <span className="text-3xl font-bold text-foreground mt-3 font-mono">
            {totalMakers}
          </span>
        </div>

        {/* Created This Month */}
        <div className="bg-card border border-border rounded-xl p-6 flex flex-col justify-between shadow-none hover:border-foreground/20 transition-all duration-300">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            This Month
          </span>
          <span className="text-3xl font-bold text-foreground mt-3 font-mono">
            {createdThisMonth}
          </span>
        </div>

        {/* Suspended Makers */}
        <div className="bg-card border border-border rounded-xl p-6 flex flex-col justify-between shadow-none hover:border-foreground/20 transition-all duration-300">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
            Suspended
          </span>
          <span className="text-3xl font-bold text-foreground mt-3 font-mono">
            {suspendedMakers}
          </span>
        </div>
      </div>

      {/* 📁 USERS LIST CARD */}
      <div className="bg-card border border-border rounded-xl overflow-hidden shadow-none">
        <div className="p-6 border-b border-border bg-muted/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-bold tracking-tight">Active Accounts</h2>
            <p className="text-xs text-muted-foreground">
              Registry of all authorized system entities.
            </p>
          </div>
          <div className="relative max-w-xs w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
            <Input
              type="text"
              placeholder="Search name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 w-full rounded-md border-border bg-background/50 focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>
        <div className="divide-y divide-border relative">
          {(() => {
            const filteredUsers = users.filter((u) => {
              const query = searchQuery.toLowerCase().trim();
              if (!query) return true;
              return (
                u.name?.toLowerCase().includes(query) ||
                u.email?.toLowerCase().includes(query)
              );
            });

            if (filteredUsers.length === 0) {
              return (
                <EmptyState
                  title={searchQuery ? "No matching accounts" : "No Users Found"}
                  description={
                    searchQuery
                      ? `We couldn't find any account matching "${searchQuery}"`
                      : "There are currently no records to display"
                  }
                />
              );
            }

            return filteredUsers.map((user) => (
              <UserRow
                key={user.id}
                user={user}
                isDeleting={isDeleting == user.id}
                onEdit={() => setUserToEdit(user)}
                onDelete={() => setUserToDelete(user)}
              />
            ));
          })()}
        </div>
      </div>
      {/* 🔵 PROFESSIONAL EDIT DIALOG */}
      <Dialog
        open={!!userToEdit}
        onOpenChange={(open) => !open && setUserToEdit(null)}
      >
        <DialogContent className="rounded-md border-border bg-card p-8 max-w-sm shadow-none">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl font-bold">
              Manage Account
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(handleUpdateUser)}>
            <FieldGroup>
              <Controller
                name="name"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Account Name</FieldLabel>
                    <Input
                      {...field}
                      placeholder="Full Name"
                      className="h-11"
                    />
                    <FieldError
                      errors={fieldState.error ? [fieldState.error] : []}
                    ></FieldError>
                  </Field>
                )}
              />
              <Controller
                name="role"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Assigned Role</FieldLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="h-11">
                        <SelectValue placeholder="Select Role" />
                      </SelectTrigger>
                      <SelectContent className="rounded-md border-border bg-card shadow-lg">
                        <SelectItem
                          value="admin"
                          className="rounded-md cursor-pointer"
                        >
                          Admin
                        </SelectItem>
                        <SelectItem
                          value="maker"
                          className="rounded-md cursor-pointer"
                        >
                          Maker
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldError
                      errors={fieldState.error ? [fieldState.error] : []}
                    />
                  </Field>
                )}
              />
            </FieldGroup>
          </form>

          <DialogFooter className="mt-8">
            <LoadingButton
              type="submit"
              loading={isUpdating}
              disabled={!form.formState.isDirty || !form.formState.isValid}
              className="w-full font-semibold h-11"
            >
              Save Changes
            </LoadingButton>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* 🔴 PROFESSIONAL DELETE DIALOG */}
      <AlertDialog
        open={!!userToDelete}
        onOpenChange={(open) => !open && setUserToDelete(null)}
      >
        <AlertDialogContent className="rounded-md border-border bg-card p-8 max-w-sm shadow-none">
          <AlertDialogHeader className="mb-4">
            <AlertDialogTitle className="text-xl font-bold">
              Confirm Removal
            </AlertDialogTitle>
          </AlertDialogHeader>

          <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
            This action will permanently delete{" "}
            <span className="font-bold text-foreground">
              {userToDelete?.name}
            </span>{" "}
            from the database.
          </AlertDialogDescription>

          <AlertDialogFooter className="mt-8 grid grid-cols-2 gap-3">
            <AlertDialogCancel className="rounded-md border-border font-semibold h-10 m-0 cursor-pointer">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="rounded-md bg-red-600 hover:bg-red-700 text-white border-none font-semibold h-10 m-0 cursor-pointer"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <StatusModal
        isOpen={!!status}
        onClose={() => setStatus(null)}
        type={status?.type || "success"}
        title={status?.type == "success" ? "Success" : "Notification"}
        message={status?.message || ""}
        buttonText="Close"
      />
    </div>
  );
}

export default UsersList;
