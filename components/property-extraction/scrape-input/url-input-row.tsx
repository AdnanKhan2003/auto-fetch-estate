import { Trash2 } from "lucide-react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/input";
import { Control, Controller } from "react-hook-form";
import { Field, FieldError } from "@/components/ui/field";

interface UrlInputRowProps {
  index: number;
  control: Control<any>;
  canDelete: boolean;
  onDelete: () => void;
}

export function UrlInputRow({
  index,
  control,
  canDelete,
  onDelete,
}: UrlInputRowProps) {
  return (
    <Controller
      name={`urls.${index}.value`}
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid} className="w-full">
          <div className="flex gap-2 items-start">
            <div className="flex-1 space-y-1">
              <Input
                {...field}
                id={`url-${index}`}
                spellCheck="false"
                aria-label="Property Listing URL"
                className="h-11 border-border bg-background text-foreground focus-visible:ring-ring"
                placeholder="Paste Listing URL here..."
                aria-invalid={fieldState.invalid}
              />
              <FieldError errors={fieldState.error ? [fieldState.error] : []} />
            </div>
            {canDelete && (
              <Button
                variant="ghost"
                size="icon"
                type="button"
                onClick={onDelete}
                className="h-11 w-11 cursor-pointer text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
              >
                <Trash2 size={18} />
              </Button>
            )}
          </div>
        </Field>
      )}
    />
  );
}
