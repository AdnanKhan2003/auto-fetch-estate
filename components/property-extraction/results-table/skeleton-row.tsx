import { TableRow, TableCell } from "../../ui/table";

export function SkeletonRow() {
  return (
    <TableRow className="animate-pulse border-border">
      <TableCell className="py-4 pl-4 w-10">
        <div className="mx-auto h-4 w-4 rounded bg-muted" />
      </TableCell>
      <TableCell className="py-4 pl-2">
        <div className="h-10 w-14 rounded border border-border bg-muted" />
      </TableCell>
      <TableCell className="py-4">
        <div className="h-4 w-52 rounded bg-muted" />
      </TableCell>
      <TableCell className="py-4 text-center">
        <div className="mx-auto h-4 w-24 rounded bg-muted" />
      </TableCell>
      <TableCell className="py-4 text-center">
        <div className="mx-auto h-4 w-16 rounded bg-muted" />
      </TableCell>
      <TableCell className="py-4 pr-6 text-right">
        <div className="ml-auto h-4 w-28 rounded bg-muted" />
      </TableCell>
    </TableRow>
  );
}
