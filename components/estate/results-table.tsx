import { Card } from "../ui/card";
import { Table, TableBody } from "../ui/table";
import { EmptyState } from "./results-table/empty-state";
import { PropertyRow } from "./results-table/property-row";
import { ResultsTableFooter } from "./results-table/results-table-footer";
import { SkeletonRow } from "./results-table/skeleton-row";
import { TableHeaderRow } from "./results-table/table-header-row";

interface ResultsTableProps {
  results: any[];
  pendingUrls: string[];
  onRowClick: (property: any) => void;
  averagePrice: number;
  discountPercentage: number;
  setDiscountPercentage: (value: number) => void;
  discountedAverage: number;
  selectedUrls: Set<string>;
  onToggleUrl: (url: string) => void;
}

function ResultsTable({
  results,
  pendingUrls,
  onRowClick,
  averagePrice,
  discountPercentage,
  setDiscountPercentage,
  discountedAverage,
  selectedUrls,
  onToggleUrl,
}: ResultsTableProps) {
  const isEmpty = results.length === 0 && pendingUrls.length === 0;

  return (
    <div className="space-y-4 animate-in fade-in duration-700">
      <h2 className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">
        Compare Prices
      </h2>
      <Card className="overflow-hidden rounded-xl border-border bg-card shadow-none">
        <Table>
          <TableHeaderRow />
          <TableBody>
            {isEmpty ? (
              <EmptyState />
            ) : (
              <>
                {results.map((item, idx) => (
                  <PropertyRow
                    key={idx}
                    item={item}
                    isSelected={selectedUrls.has(item.url)}
                    onToggle={() => onToggleUrl(item.url)}
                    onClick={() => onRowClick(item)}
                  />
                ))}
                {pendingUrls.map((url) => (
                  <SkeletonRow key={url} />
                ))}
              </>
            )}
          </TableBody>
          <ResultsTableFooter
            averagePrice={averagePrice}
            discountPercentage={discountPercentage}
            setDiscountPercentage={setDiscountPercentage}
            discountedAverage={discountedAverage}
          />
        </Table>
      </Card>
    </div>
  );
}

export default ResultsTable;
