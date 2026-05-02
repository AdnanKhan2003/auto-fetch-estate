import { Card } from "../ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

interface ResultsTableProps {
  results: any[];
  onRowClick: (property: any) => void;
  averagePrice: number;
}

function ResultsTable({
  results,
  onRowClick,
  averagePrice,
}: ResultsTableProps) {
  return (
    <div className="space-y-4 animate-in fade-in duration-700">
      <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 px-1">
        Compare Prices
      </h2>
      <Card className="border-zinc-200 shadow-none bg-white rounded-xl overflow-hidden">
        <Table>
          <TableHeader className="hover:bg-transparent border-none">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="w-[100px] py-4 pl-6 text-zinc-400 text-[10px] uppercase font-black">
                Evidence
              </TableHead>
              <TableHead className="py-4 text-zinc-400 text-[10px] uppercase font-black">
                Property
              </TableHead>
              <TableHead className="py-4 text-zinc-400 text-[10px] uppercase font-black text-center">
                Price
              </TableHead>
              <TableHead className="py-4 text-zinc-400 text-[10px] uppercase font-black text-center">
                Carpet Area
              </TableHead>
              <TableHead className="py-4 text-zinc-400 text-[10px] uppercase font-black text-right pr-6">
                Locality
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-24 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-zinc-400 font-medium">
                      No results to compare yet.
                    </p>
                    <p className="text-zinc-300 text-xs">
                      Enter listing URLs above to start your analysis.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              results.map((item, idx) => (
                <TableRow
                  key={idx}
                  onClick={() => onRowClick(item)}
                  className="cursor-pointer hover:bg-zinc-50/50 transition-colors border-zinc-100"
                >
                  <TableCell className="py-4 pl-6">
                    <div className="w-14 h-10 rounded border border-zinc-100 bg-zinc-50 overflow-hidden">
                      <img
                        src={item.screenshotUrl}
                        className="object-cover w-full h-full transition-all duration-700"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="py-4 font-bold text-zinc-900">
                    {item.data?.propertyTitle || "Pending Analysis..."}
                  </TableCell>
                  <TableCell className="py-4 text-center font-black text-zinc-900">
                    {item.data?.price || "-"}
                  </TableCell>
                  <TableCell className="py-4 text-center text-zinc-600 font-medium">
                    {item.data?.carpetArea || item.data?.area || "-"}
                  </TableCell>
                  <TableCell className="py-4 text-right pr-6 text-zinc-400 text-sm">
                    {item.data?.location || "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          <TableFooter className="bg-zinc-900 text-zinc-50 border-t-0">
            <TableRow className="hover:bg-transparent">
              <TableCell
                colSpan={3}
                className="py-8 pl-6 font-medium text-zinc-400 text-right"
              >
                Aggregated Market Average:
              </TableCell>
              <TableCell colSpan={2} className="py-8 pr-6 text-right">
                <span className="text-2xl font-black text-white">
                  ₹{averagePrice.toLocaleString("en-IN")}
                </span>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </Card>
    </div>
  );
}

export default ResultsTable;
