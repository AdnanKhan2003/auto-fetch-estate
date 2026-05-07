import { TableRow, TableCell } from "../../ui/table";

export function EmptyState() {
  return (
    <TableRow>
      <TableCell colSpan={6} className="py-24 text-center">
        <div className="flex flex-col items-center gap-2">
          <p className="font-medium text-muted-foreground">
            No results to compare yet.
          </p>
          <p className="text-xs text-muted-foreground/70">
            Enter listing URLs above to start your analysis.
          </p>
        </div>
      </TableCell>
    </TableRow>
  );
}
