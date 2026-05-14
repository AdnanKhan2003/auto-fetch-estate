"use client";

import { Slot } from "radix-ui";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import * as React from "react";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Field = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("space-y-2", className)} {...props} />
);

const FieldLabel = ({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label
    className={cn(
      "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground ml-1",
      className,
    )}
    {...props}
  />
);

const FieldDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className={cn("text-[10px] text-muted-foreground ml-1", className)}
    {...props}
  />
);

const FieldError = ({
  errors,
  className,
}: {
  errors?: any[];
  className?: string;
}) => {
  if (!errors?.length) return null;
  return (
    <p
      className={cn("text-[10px] font-medium text-destructive ml-1", className)}
    >
      {errors[0]?.message}
    </p>
  );
};

const FieldGroup = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("space-y-4", className)} {...props} />
);

export { Field, FieldLabel, FieldDescription, FieldError, FieldGroup };
