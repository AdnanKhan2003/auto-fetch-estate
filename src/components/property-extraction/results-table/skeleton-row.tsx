import { Skeleton } from "@/components/ui/skeleton";
import { TableRow, TableCell } from "../../ui/table";

export function SkeletonRow() {
  return (
    <TableRow className="animate-pulse border-border">
      <TableCell className="py-4">
        <Skeleton className="mx-auto flex h-6 w-6 items-center justify-center rounded-md bg-muted/40" />
      </TableCell>

      {/* 1. Select Column */}
      <TableCell className="py-4 pl-6 w-[50px]">
        <Skeleton className="mx-auto h-4 w-4 rounded bg-muted/40" />
      </TableCell>

      {/* 2. Image Column */}
      <TableCell className="py-4 px-4">
        <Skeleton className="h-10 w-14 rounded border border-border bg-muted/40" />
      </TableCell>

      {/* 3. Property Column */}
      <TableCell className="py-4 px-4">
        <Skeleton className="h-4 w-48 rounded bg-muted/40" />
      </TableCell>

      {/* 4. Location Column */}
      <TableCell className="py-4 px-4">
        <Skeleton className="h-4 w-32 rounded bg-muted/40" />
      </TableCell>

      {/* 5. Price Column */}
      <TableCell className="py-4 px-4">
        <Skeleton className="h-4 w-20 rounded bg-muted/40" />
      </TableCell>

      {/* 6. Area Column */}
      <TableCell className="py-4 px-4">
        <Skeleton className="h-4 w-24 rounded bg-muted/40" />
      </TableCell>

      {/* 7. Rate/Sqft Column */}
      <TableCell className="py-4 pr-6 text-right">
        <Skeleton className="ml-auto h-4 w-28 rounded bg-muted/40" />
      </TableCell>
    </TableRow>
  );
}
