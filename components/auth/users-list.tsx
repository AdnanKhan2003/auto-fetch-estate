"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { authClient } from "@/lib/auth/auth-client";
import { Button } from "../ui/button";
import { AlertCircle, Loader2, Trash2, Pencil } from "lucide-react";
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

function UsersList() {
  const [users, setUsers] = useState<any[]>([]);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [userToEdit, setUserToEdit] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const { data: session } = authClient.useSession();
  const [status, setStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

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

  const confirmDelete = async () => {
    if (!userToDelete) return;

    setIsDeleting(userToDelete.id);
    const { error } = await authClient.admin.removeUser({
      userId: userToDelete.id,
    });

    if (error) {
      setStatus({ type: "error", message: error.message || "Failed to delete user" });
    } else {
      await fetchUsers();
    }
    setIsDeleting(null);
    setUserToDelete(null);
  };

  const handleUpdateUser = async () => {
    if (!userToEdit) return;
    setIsUpdating(true);

    try {
      await authClient.admin.updateUser({
        userId: userToEdit.id,
        data: { name: userToEdit.name },
      });

      await authClient.admin.setRole({
        userId: userToEdit.id,
        role: userToEdit.role,
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
    <div className="divide-y divide-border relative" style={{ fontFamily: "'Poppins', sans-serif" }}>
      {users.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground text-sm">
          No records found.
        </div>
      ) : (
        users.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-4 hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Avatar className="h-9 w-9 rounded-full border border-border">
                <AvatarImage src={user.image || ""} />
                <AvatarFallback className="rounded-full font-bold">{user.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-semibold text-sm">{user.name}</p>
                <p className="text-[11px] text-muted-foreground uppercase">{user.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded border border-border bg-muted">
                {user.role}
              </span>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-md hover:bg-accent cursor-pointer"
                  onClick={() => setUserToEdit(user)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-md hover:bg-red-50 hover:text-red-600 cursor-pointer"
                  onClick={() => setUserToDelete(user)}
                  disabled={isDeleting === user.id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))
      )}

      {/* 🔵 PROFESSIONAL EDIT DIALOG */}
      <Dialog open={!!userToEdit} onOpenChange={(open) => !open && setUserToEdit(null)}>
        <DialogContent className="rounded-md border-border bg-card p-8 max-w-sm shadow-none">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-xl font-bold">Manage Account</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-muted-foreground ml-0.5">Account Name</label>
              <Input
                value={userToEdit?.name || ""}
                onChange={(e) => setUserToEdit({ ...userToEdit, name: e.target.value })}
                className="h-11 rounded-md border-border bg-background px-4 focus-visible:ring-1"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase text-muted-foreground ml-0.5">Assigned Role</label>
              <Select
                value={userToEdit?.role}
                onValueChange={(val: string) => setUserToEdit({ ...userToEdit, role: val })}
              >
                <SelectTrigger className="h-11 rounded-md border-border bg-background px-4">
                  <SelectValue placeholder="Select Role" />
                </SelectTrigger>
                <SelectContent className="rounded-md border-border bg-card shadow-lg">
                  <SelectItem value="admin" className="rounded-md cursor-pointer">Admin</SelectItem>
                  <SelectItem value="maker" className="rounded-md cursor-pointer">Maker</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="mt-8">
            <Button
              onClick={handleUpdateUser}
              disabled={isUpdating}
              className="w-full rounded-md font-semibold h-11 transition-all"
            >
              {isUpdating && <Loader2 className="animate-spin h-4 w-4 mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 🔴 PROFESSIONAL DELETE DIALOG */}
      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent className="rounded-md border-border bg-card p-8 max-w-sm shadow-none">
          <AlertDialogHeader className="mb-4">
            <AlertDialogTitle className="text-xl font-bold">Confirm Removal</AlertDialogTitle>
          </AlertDialogHeader>
          
          <AlertDialogDescription className="text-sm text-muted-foreground leading-relaxed">
            This action will permanently delete <span className="font-bold text-foreground">{userToDelete?.name}</span> from the database.
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

      {/* 🟢 PROFESSIONAL STATUS DIALOG */}
      <Dialog open={!!status} onOpenChange={() => setStatus(null)}>
        <DialogContent className="rounded-md border-border bg-card p-8 max-w-sm shadow-none">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-bold">Notification</DialogTitle>
          </DialogHeader>
           <div className="space-y-6">
              <p className="text-sm font-medium text-muted-foreground leading-relaxed">{status?.message}</p>
              <Button
                onClick={() => setStatus(null)}
                className="w-full h-10 rounded-md font-semibold"
              >
                Close
              </Button>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default UsersList;
