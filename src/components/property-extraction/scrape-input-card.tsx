"use client";

import { Card, CardContent } from "../ui/card";
import { ScrapeInputHeader } from "./scrape-input/scrape-input-header";
import { UrlInputRow } from "./scrape-input/url-input-row";
import { ActionButtons } from "./scrape-input/action-buttons";
import { useForm, useFieldArray } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { Loader2, Search, X } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { cn } from "@/lib/utils";

interface ScrapeInputCardProps {
  urls: string[];
  isLoading: boolean;
  onScrape: (activeUrls: string[], refNumber?: string) => void;
  setFocusedUrl: (url: string | null) => void;
  onPropertyScraped?: (data: any) => void;
  onStopScrape?: () => void;
  onUrlsFound?: (urls: string[]) => void;
  onSearchStart?: () => void;
  onSearchEnd?: () => void;
}

const schema = z.object({
  urls: z
    .array(
      z.object({
        value: z
          .string()
          .refine(
            (val) => val === "" || z.string().url().safeParse(val).success,
            {
              message: "Please enter a valid URL",
            },
          ),
      }),
    )
    .min(1),
});

type FormValues = z.infer<typeof schema>;

function ScrapeInputCard({
  urls: initialUrls,
  isLoading,
  onScrape,
  setFocusedUrl,
  onPropertyScraped,
  onStopScrape,
  onUrlsFound,
  onSearchStart,
  onSearchEnd,
}: ScrapeInputCardProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchStatus, setSearchStatus] = useState<string>("");
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null);
  const [refError, setRefError] = useState(false);
  // Dev purpose only
  // const [referenceNumber, setReferenceNumber] = useState<string | null>(
  //   "DEV-A1B2C3D4",
  // );

  const abortSearchRef = useRef<AbortController | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      urls: initialUrls.map((u) => ({ value: u })),
    },
  });
  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "urls",
  });

  useEffect(() => {
    if (initialUrls.length > 0) {
      replace(initialUrls.map((u) => ({ value: u })));
    }
  }, [initialUrls]);

  const watchedUrls = form.watch("urls");

  const handleSubmit = (data: FormValues) => {
    if (!referenceNumber || referenceNumber.trim() === "") {
      setRefError(true);
      return;
    }

    const activeUrls = data.urls
      .map((u) => u.value)
      .filter((v) => v.trim() !== "");
    
    if (activeUrls.length > 0) {
      onScrape(activeUrls, referenceNumber);
    }
  };

  const handleAISearch = async (e: React.FormEvent) => {
    e.preventDefault();

    if(!referenceNumber?.trim()) {
      setRefError(true);
      return;
    }
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    if (onSearchStart) onSearchStart();
    setSearchStatus("Initializing AI Agent...");

    abortSearchRef.current = new AbortController();

    try {
      const response = await fetch("/api/property-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery }),
        signal: abortSearchRef.current.signal,
      });

      if (!response.body) throw new Error("No response body");
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);

            if (data.type === "action") {
              setSearchStatus(data.action);
            } else if (data.type === "message") {
              setSearchStatus("Agent thinking...");
            } else if (data.type === "error") {
              const isRateLimit =
                data.error.includes("429") ||
                data.error.toLowerCase().includes("quota");

              const freindlyMessage = isRateLimit
                ? "Gemini AI server is busy (quota exceeded). Please try again in a few minutes."
                : "Search failed. Please try again.";
              setSearchStatus(freindlyMessage);
              setIsSearching(false);
              if (onSearchEnd) onSearchEnd();
            } else if (data.type === "urls_found") {
              setSearchStatus(
                `Found ${data.urls.length} URLs! Starting scrape...`,
              );

              replace(data.urls.map((u: string) => ({ value: u })));
              if (onUrlsFound) onUrlsFound(data.urls);
            } else if (data.type === "property_scraped") {
              setSearchStatus(
                `Scraped property: ${data.data?.data?.propertyTitle?.substring(0, 30) || "Unknown"}...`,
              );
              if (onPropertyScraped) {
                onPropertyScraped(data.data);
              }
              // Add URL to the input list dynamically
              if (data.data?.url) {
                const currentUrls = form.getValues("urls");
                if (!currentUrls.some((u) => u.value === data.data.url)) {
                  // Update form values
                  const newUrls = currentUrls.filter(
                    (u) => u.value.trim() !== "",
                  );
                  newUrls.push({ value: data.data.url });
                  if (newUrls.length === 0) newUrls.push({ value: "" });
                  replace(newUrls);
                }
              }
            } else if (data.type === "done" && data.urls?.length > 0) {
              setSearchStatus("Found URLs! Populating...");

              // Populate the form fields with the found URLs
              replace(data.urls.map((u: string) => ({ value: u })));

              // Automatically trigger the scrape
              setTimeout(() => {
                if (referenceNumber) {
                  onScrape(data.urls, referenceNumber);
                }
              }, 500);
            }
          } catch (e) {
            console.error("Failed to parse NDJSON line", line);
          }
        }
      }
    } catch (error) {
      setSearchStatus("Search failed. Please try again.");
    } finally {
      setIsSearching(false);
      if (onSearchEnd) onSearchEnd();
      setTimeout(() => setSearchStatus(""), 3000); // Clear status after 3s
    }
  };

  return (
    <Card className="bg-card shadow-none border-border rounded-xl">
      <ScrapeInputHeader />
      <CardContent className="space-y-6">
        {/* Mandatory Reference Number Input */}
        <div className="space-y-3">
          <div className="flex flex-col gap-1">
            <Label htmlFor="reference-number" className="font-semibold text-foreground text-sm">
              Reference Number <span className="text-destructive">*</span>
            </Label>
            <p className="text-muted-foreground text-xs">
              Required identifier for this scraping batch.
            </p>
          </div>
          <Input
            id="reference-number"
            placeholder="e.g. BATCH-Q2-VASHI"
            value={referenceNumber || ""}
            disabled={isSearching || isLoading}
            onChange={(e) => {
              setReferenceNumber(e.target.value || null);
              setRefError(false);
            }}
            className={cn(
              "bg-background max-w-sm",
              refError && "border-destructive focus-visible:ring-destructive"
            )}
          />
          {refError && (
            <p className="text-destructive text-xs font-medium mt-1">
              Reference number is required.
            </p>
          )}
        </div>

        {/* New AI Search Section */}
        <div className="space-y-3 bg-muted/30 p-4 border border-border rounded-lg">
          <label className="font-semibold text-foreground text-sm">
            AI Property Search
          </label>
          <form onSubmit={handleAISearch} className="flex gap-2">
            <Input
              placeholder="e.g. 2 BHK sale in Vashi"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={isSearching || isLoading}
              className="bg-background"
            />

            {isSearching && (
              <Button
                type="button"
                variant="destructive"
                className="cursor-pointer"
                onClick={() => abortSearchRef.current?.abort()}
              >
                <X className="mr-2 w-4 h-4" /> Stop
              </Button>
            )}

            <Button
              type="submit"
              className="cursor-pointer"
              disabled={isSearching || isLoading || !searchQuery.trim()}
            >
              {isSearching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="mr-2 w-4 h-4" />
              )}
              {isSearching ? "Searching..." : "Search"}
            </Button>
          </form>
          {searchStatus && (
            <p className="text-muted-foreground text-xs animate-pulse">
              {searchStatus}
            </p>
          )}


        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="border-border border-t w-full" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or Enter Manual URLs
            </span>
          </div>
        </div>

        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <div className="space-y-3">
            {fields.map((field, index) => (
              <UrlInputRow
                key={field.id}
                index={index}
                control={form.control as any}
                canDelete={fields.length > 1}
                onDelete={() => remove(index)}
                onFocus={() => setFocusedUrl(watchedUrls[index]?.value || null)}
                isLoading={isLoading || isSearching}
              />
            ))}
          </div>

          <ActionButtons
            isLoading={isLoading}
            isExecuteDisabled={
              isLoading ||
              isSearching ||
              watchedUrls.every((u) => !u.value.trim())
            }
            isAddTargetDisabled={isSearching}
            onAddTarget={() => {
              append({ value: "" });
              const newIndex = fields.length;
              setTimeout(() => form.clearErrors(`urls.${newIndex}.value`), 0);
            }}
            onExecute={form.handleSubmit(handleSubmit)}
            onStopScrape={onStopScrape}
          />
        </form>
      </CardContent>
    </Card>
  );
}

export default ScrapeInputCard;
