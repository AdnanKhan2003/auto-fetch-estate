"use client";

import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { authClient } from "@/lib/auth/auth-client";

function UsersList() {
  const [users, setUsers] = useState<any[]>([]);
  const { data: session } = authClient.useSession();

  useEffect(() => {
    const fetchUsers = async () => {
      const { data } = await authClient.admin.listUsers({
        query: { limit: 100 },
      });

      if (data?.users) {
        const otherUsers = data.users.filter((u) => u.id !== session?.user?.id);
        setUsers(otherUsers);
      }
    };

    if (session) fetchUsers();
  }, [session]);

  return (
    <div className="divide-y divide-border">
      {users.length === 0 ? (
        <div className="p-8 text-center text-muted-foreground">
          No other Users Found
        </div>
      ) : (
        users.map((user) => (
          <div
            key={user.id}
            className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={user.image || ""} />
                <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider rounded bg-primary/10 text-primary">
                  {user.role}
                </span>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

export default UsersList;
