"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { authClient } from "@/lib/auth/auth-client";
import { Button } from "../ui/button";
import { AlertCircle, Loader2, Trash2, Pencil } from "lucide-react";
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

  return (
    <div
      className="divide-y divide-border relative"
      style={{ fontFamily: "'Poppins', sans-serif" }}
    >
      {users.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground text-sm">
          No records found.
        </div>
      ) : (
        users.map((user) => (
          <UserRow
            key={user.id}
            user={user}
            isDeleting={isDeleting == user.id}
            onEdit={() => setUserToEdit(user)}
            onDelete={() => setUserToDelete(user)}
          />
        ))
      )}
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
