import { Loader2, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Input } from "../ui/input";

interface ScrapeInputCardProps {
  urls: string[];
  setUrls: (urls: string[]) => void;
  isLoading: boolean;
  onScrape: () => void;
}

function ScrapeInputCard({
  urls,
  setUrls,
  isLoading,
  onScrape,
}: ScrapeInputCardProps) {
  return (
    <Card className="rounded-xl border-border bg-card shadow-none">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg font-bold text-card-foreground">
          <Search className="h-4 w-4 text-muted-foreground" /> Target Configuration
        </CardTitle>
        <CardDescription className="text-muted-foreground">
          Input URLs to extract valuation data and specifications.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          {urls.map((url, index) => (
            <div key={index} className="flex items-center gap-2">
              <Input
                type="url"
                value={url}
                onChange={(e) => {
                  const newUrls = [...urls];
                  newUrls[index] = e.target.value;
                  setUrls(newUrls);
                }}
                spellCheck="false"
                className="h-11 flex-1 border-border bg-background text-foreground focus-visible:ring-ring"
                placeholder="Paste listing URL here..."
              />
              {urls.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    const newUrls = [...urls];
                    newUrls.splice(index, 1);
                    setUrls(newUrls);
                  }}
                  className="cursor-pointer text-muted-foreground hover:bg-red-500/10 hover:text-red-500"
                >
                  <Trash2 size={18} />
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setUrls([...urls, ""])}
            className="cursor-pointer gap-2 border-border font-medium text-foreground hover:bg-muted"
          >
            <Plus size={14} /> Add Target
          </Button>
          <Button
            onClick={onScrape}
            disabled={isLoading || urls.every((u) => !u.trim())}
            className="h-11 cursor-pointer border-none bg-primary px-10 font-bold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:bg-muted disabled:text-muted-foreground"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin w-4 h-4 mr-2" />
                Extracting...
              </>
            ) : (
              "Execute Scrape"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default ScrapeInputCard;
