import { Search } from "lucide-react";
import { CardDescription, CardHeader, CardTitle } from "../../ui/card";

export function ScrapeInputHeader() {
  return (
    <CardHeader className="pb-4">
      <CardTitle className="flex items-center gap-2 text-lg font-bold text-card-foreground">
        <Search className="h-4 w-4 text-muted-foreground" /> Target Configuration
      </CardTitle>
      <CardDescription className="text-muted-foreground">
        Input URLs to extract valuation data and specifications.
      </CardDescription>
    </CardHeader>
  );
}
