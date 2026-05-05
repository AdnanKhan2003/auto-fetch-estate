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
  discountPercentage: number;
  discountedAverage: number;
}

function ResultsTable({
  results,
  onRowClick,
  averagePrice,
  discountPercentage,
  discountedAverage,
}: ResultsTableProps) {
  return (
    <div className="space-y-4 animate-in fade-in duration-700">
      <h2 className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
        Compare Prices
      </h2>
      <Card className="overflow-hidden rounded-xl border-border bg-card shadow-none">
        <Table>
          <TableHeader className="hover:bg-transparent border-none">
            <TableRow className="hover:bg-transparent border-none">
              <TableHead className="w-[100px] py-4 pl-6 text-[10px] font-black uppercase text-muted-foreground">
                Evidence
              </TableHead>
              <TableHead className="py-4 text-[10px] font-black uppercase text-muted-foreground">
                Property
              </TableHead>
              <TableHead className="py-4 text-center text-[10px] font-black uppercase text-muted-foreground">
                Price
              </TableHead>
              <TableHead className="py-4 text-center text-[10px] font-black uppercase text-muted-foreground">
                Carpet Area
              </TableHead>
              <TableHead className="py-4 pr-6 text-right text-[10px] font-black uppercase text-muted-foreground">
                Locality
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {results.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-24 text-center">
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
            ) : (
              results.map((item, idx) => (
                <TableRow
                  key={idx}
                  onClick={() => onRowClick(item)}
                  className="cursor-pointer border-border transition-colors hover:bg-muted/40"
                >
                  <TableCell className="py-4 pl-6">
                    <div className="h-10 w-14 overflow-hidden rounded border border-border bg-muted">
                      <img
                        src={item.screenshotUrl}
                        className="object-cover w-full h-full transition-all duration-700"
                      />
                    </div>
                  </TableCell>
                  <TableCell className="py-4 font-bold text-foreground">
                    {item.data?.propertyTitle || "Pending Analysis..."}
                  </TableCell>
                  <TableCell className="py-4 text-center font-black text-foreground">
                    {item.data?.price || "-"}
                  </TableCell>
                  <TableCell className="py-4 text-center font-medium text-muted-foreground">
                    {item.data?.carpetArea || item.data?.area || "-"}
                  </TableCell>
                  <TableCell className="py-4 pr-6 text-right text-sm text-muted-foreground">
                    {item.data?.location || "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
          <TableFooter className="border-t-0">
            <TableRow className="bg-secondary text-secondary-foreground hover:bg-secondary">
              <TableCell
                colSpan={3}
                className="py-4 pl-6 text-right font-medium text-secondary-foreground/70"
              >
                Aggregated Market Average:
              </TableCell>
              <TableCell colSpan={2} className="py-4 pr-6 text-right">
                <span className="text-xl font-black text-secondary-foreground">
                  ₹{averagePrice.toLocaleString("en-IN")}
                </span>
              </TableCell>
            </TableRow>
            <TableRow className="bg-background text-foreground hover:bg-background">
              <TableCell
                colSpan={3}
                className="py-4 pl-6 text-right font-medium text-muted-foreground"
              >
                Discount Percentage:
              </TableCell>
              <TableCell colSpan={2} className="py-4 pr-6 text-right">
                <span className="text-xl font-black text-foreground">
                  {discountPercentage}%
                </span>
              </TableCell>
            </TableRow>
            <TableRow className="bg-secondary text-secondary-foreground hover:bg-secondary">
              <TableCell
                colSpan={3}
                className="py-4 pl-6 text-right font-medium text-secondary-foreground/70"
              >
                Discounted Average (After Discount):
              </TableCell>
              <TableCell colSpan={2} className="py-4 pr-6 text-right">
                <span className="text-2xl font-black text-secondary-foreground">
                  ₹{discountedAverage.toLocaleString("en-IN")}
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
