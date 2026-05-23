import { Pencil, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Button } from "../ui/button";

interface UserRowProps {
  user: any;
  isDeleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}

function UserRow({ user, isDeleting, onEdit, onDelete }: UserRowProps) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-muted/40 transition-colors">
      <div className="flex items-center gap-3">
        <Avatar>
          <AvatarImage src={user.image || ""} />
          <AvatarFallback className="rounded-full font-bold">
            {user.name?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-semibold text-sm">{user.name}</p>
          <p className="text-[11px] text-muted-foreground uppercase">
            {user.email}
          </p>
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
            onClick={onEdit}
          >
            <Pencil className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-md hover:bg-red-0 hover:text-red-600 cursor-pointer"
            onClick={onDelete}
            disabled={isDeleting}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default UserRow;
