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
    <Card className="border-zinc-200 shadow-none bg-white rounded-xl">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-bold flex items-center gap-2 text-zinc-900">
          <Search className="w-4 h-4 text-zinc-400" /> Target Configuration
        </CardTitle>
        <CardDescription className="text-zinc-500">
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
                className="flex-1 bg-zinc-50/30 border-zinc-200 text-zinc-900 focus-visible:ring-zinc-900 h-11"
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
                  className="text-zinc-300 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                >
                  <Trash2 size={18} />
                </Button>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setUrls([...urls, ""])}
            className="text-zinc-900 border-zinc-200 hover:bg-zinc-50 gap-2 font-medium cursor-pointer"
          >
            <Plus size={14} /> Add Target
          </Button>
          <Button
            onClick={onScrape}
            disabled={isLoading || urls.every((u) => !u.trim())}
            className="bg-black text-white hover:bg-zinc-800 px-10 h-11 font-bold cursor-pointer disabled:bg-zinc-200 disabled:text-zinc-400 border-none transition-all shadow-sm"
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
