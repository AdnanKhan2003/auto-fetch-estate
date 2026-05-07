import { TableHeader, TableRow, TableHead } from "../../ui/table";

export function TableHeaderRow() {
  return (
    <TableHeader className="hover:bg-transparent border-none">
      <TableRow className="hover:bg-transparent border-none">
        <TableHead className="w-10 py-4 pl-4 text-[10px] font-black uppercase text-muted-foreground">
          {/* checkbox */}
        </TableHead>
        <TableHead className="w-[100px] py-4 pl-2 text-[10px] font-black uppercase text-muted-foreground">
          Evidence
        </TableHead>
        <TableHead className="max-w-[180px] py-4 text-[10px] font-black uppercase text-muted-foreground">
          Property
        </TableHead>
        <TableHead className="py-4 text-center text-[10px] font-black uppercase text-muted-foreground">
          Price/sqft
        </TableHead>
        <TableHead className="py-4 text-center text-[10px] font-black uppercase text-muted-foreground">
          Area
        </TableHead>
        <TableHead className="py-4 pr-6 text-right text-[10px] font-black uppercase text-muted-foreground">
          Locality
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}
