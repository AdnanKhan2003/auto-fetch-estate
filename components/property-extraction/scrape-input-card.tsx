import { Card, CardContent } from "../ui/card";
import { ScrapeInputHeader } from "./scrape-input/scrape-input-header";
import { UrlInputRow } from "./scrape-input/url-input-row";
import { ActionButtons } from "./scrape-input/action-buttons";

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
  const handleUrlChange = (index: number, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = value;
    setUrls(newUrls);
  };

  const handleDelete = (index: number) => {
    const newUrls = [...urls];
    newUrls.splice(index, 1);
    setUrls(newUrls);
  };

  return (
    <Card className="rounded-xl border-border bg-card shadow-none">
      <ScrapeInputHeader />
      <CardContent className="space-y-6">
        <div className="space-y-3">
          {urls.map((url, index) => (
            <UrlInputRow
              key={index}
              url={url}
              canDelete={urls.length > 1}
              onChange={(value) => handleUrlChange(index, value)}
              onDelete={() => handleDelete(index)}
            />
          ))}
        </div>

        <ActionButtons
          isLoading={isLoading}
          isExecuteDisabled={isLoading || urls.every((u) => !u.trim())}
          onAddTarget={() => setUrls([...urls, ""])}
          onExecute={onScrape}
        />
      </CardContent>
    </Card>
  );
}

export default ScrapeInputCard;
