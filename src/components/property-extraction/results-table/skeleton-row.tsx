import { Skeleton } from "@/components/ui/skeleton";
import { TableRow, TableCell } from "../../ui/table";

export function SkeletonRow() {
  return (
    <TableRow className="border-border animate-pulse">
      {/* 1. Index Column */}
      <TableCell className="py-4">
        <Skeleton className="flex justify-center items-center bg-muted/40 mx-auto rounded-md w-6 h-6" />
      </TableCell>
      {/* 2. Select Column */}
      <TableCell className="py-4 pl-6 w-[50px]">
        <Skeleton className="bg-muted/40 mx-auto rounded w-4 h-4" />
      </TableCell>
      {/* 3. Image Column */}
      <TableCell className="px-4 py-4">
        <Skeleton className="bg-muted/40 border border-border rounded w-14 h-10" />
      </TableCell>
      {/* 4. Property Column */}
      <TableCell className="px-4 py-4">
        <Skeleton className="bg-muted/40 rounded w-48 h-4" />
      </TableCell>
      {/* 5. Furnishing Column */}
      <TableCell className="px-4 py-4">
        <Skeleton className="bg-muted/40 rounded w-20 h-4" />
      </TableCell>
      {/* 6. Location Column */}
      <TableCell className="px-4 py-4">
        <Skeleton className="bg-muted/40 rounded w-32 h-4" />
      </TableCell>
      {/* 7. Price Column */}
      <TableCell className="px-4 py-4">
        <Skeleton className="bg-muted/40 rounded w-20 h-4" />
      </TableCell>
      {/* 8. Area Column */}
      <TableCell className="px-4 py-4">
        <Skeleton className="bg-muted/40 rounded w-24 h-4" />
      </TableCell>
      {/* 9. Rate/Sqft Column */}
      <TableCell className="py-4 pr-6 text-right">
        <Skeleton className="bg-muted/40 ml-auto rounded w-28 h-4" />
      </TableCell>
      {/* 10. Actions Column */}
      <TableCell className="px-4 py-4">
        <Skeleton className="bg-muted/40 mx-auto rounded-md w-8 h-8" />
      </TableCell>
    </TableRow>
  );
}
