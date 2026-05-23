import { UserX } from "lucide-react";
import { ReactNode } from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
}

function EmptyState({ title, description, icon, className }: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-12 text-center ${className || ""}`}
    >
      <div className="mb-4 rounded-full bg-muted p-4 text-muted-foreground/50">
        {icon || <UserX size={32} />}
      </div>
      <h3 className="font-semibold text-foreground">{title}</h3>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

export default EmptyState;
