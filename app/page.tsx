"use client";

import { useState, useEffect } from "react";
import {
  ExternalLink,
  Loader2,
  Plus,
  Trash2,
  ShieldCheck,
  MapPin,
  Ruler,
  Home,
  ArrowRight,
  Search,
  Activity,
} from "lucide-react";

// Shadcn UI Components
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface ScrapeResult {
  url: string;
  screenshotUrl?: string;
  data?: any;
  status: "success" | "error";
}

export default function HomePage() {
  const [urls, setUrls] = useState<string[]>([""]);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ScrapeResult[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<ScrapeResult | null>(
    null,
  );

  const handleScrape = async () => {
    setIsLoading(true);
    const urlArray = urls.filter((u) => u.trim() !== "");
    if (urlArray.length === 0) {
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: urlArray }),
      });
      const data = await response.json();
      setResults(data.results || []);
    } catch (error) {
      alert("Failed to scrape data");
    } finally {
      setIsLoading(false);
    }
  };

  const validPrices = results
    .map((r) => {
      const priceStr = r.data?.price?.replace(/[^0-9]/g, "");
      return priceStr ? parseInt(priceStr, 10) : null;
    })
    .filter((p): p is number => p !== null && p > 0);

  const averagePrice =
    validPrices.length > 0
      ? Math.round(validPrices.reduce((a, b) => a + b, 0) / validPrices.length)
      : 0;

  return (
    <div className="min-h-screen bg-white text-zinc-900 p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header Section */}
        <header className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">
            V S Jadon Compare
          </h1>
        </header>

        {/* Input Configuration Card */}
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
                onClick={handleScrape}
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

        {/* Results Data Table */}
        {results.length > 0 && (
          <div className="space-y-4 animate-in fade-in duration-700">
            <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 px-1">
              {/* Market Discoveries */}
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
                  {results.map((item, idx) => (
                    <TableRow
                      key={idx}
                      onClick={() => setSelectedProperty(item)}
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
                  ))}
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
        )}
      </div>

      {/* Property Details Modal - Fixed Width & Content Layout */}
      <Dialog
        open={!!selectedProperty}
        onOpenChange={() => setSelectedProperty(null)}
      >
        <DialogContent className="sm:max-w-5xl w-[95vw] max-h-[90vh] overflow-hidden flex flex-col p-0 border-zinc-200 bg-white shadow-2xl rounded-2xl">
          <DialogHeader className="p-6 sm:p-8 border-b border-zinc-50 bg-white space-y-0 flex-row items-center justify-between overflow-x-hidden">
            <div className="space-y-1 text-zinc-900 min-w-0 flex-1">
              <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight truncate">
                {selectedProperty?.data?.propertyTitle || "Property Overview"}
              </DialogTitle>
              <div className="flex items-center gap-2 text-[10px] sm:text-xs text-zinc-400 font-mono italic bg-zinc-50 w-fit px-2 py-0.5 rounded border border-zinc-100 max-w-full">
                <ExternalLink size={10} className="shrink-0" />
                <span className="truncate max-w-[200px] sm:max-w-sm">
                  {selectedProperty?.url}
                </span>
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto overflow-x-hidden p-6 sm:p-10 space-y-12 bg-white">
            {/* Primary Metrics Section */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: "Market Price",
                  value: selectedProperty?.data?.price,
                  highlight: true,
                },
                {
                  label: "Rate / Sqft",
                  value: selectedProperty?.data?.pricePerSqft,
                },
                { label: "Total Area", value: selectedProperty?.data?.area },
                {
                  label: "Bldg Age",
                  value: selectedProperty?.data?.ageOfBuilding,
                },
              ].map((stat, i) => (
                <div
                  key={i}
                  className={`p-6 rounded-xl border border-zinc-100 ${stat.highlight ? "bg-zinc-900 text-zinc-50 shadow-lg" : "bg-white text-zinc-900"} min-w-0 overflow-hidden`}
                >
                  <p
                    className={`text-[10px] uppercase tracking-widest font-black mb-2 ${stat.highlight ? "text-zinc-500" : "text-zinc-400"}`}
                  >
                    {stat.label}
                  </p>
                  <p className="text-xl font-bold tracking-tight truncate">
                    {stat.value || "N/A"}
                  </p>
                </div>
              ))}
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Technical Specifications */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300 border-b border-zinc-50 pb-3">
                  Technical Matrix
                </h4>
                <div className="space-y-4">
                  {[
                    {
                      label: "Locality",
                      value: selectedProperty?.data?.location,
                      icon: <MapPin size={14} />,
                    },
                    {
                      label: "Internal Floor Area",
                      value: selectedProperty?.data?.carpetArea,
                      icon: <Ruler size={14} />,
                    },
                    {
                      label: "Vertical Position",
                      value: selectedProperty?.data?.floorNo,
                      icon: <Home size={14} />,
                    },
                    {
                      label: "Cardinal Facing",
                      value: selectedProperty?.data?.facing,
                      icon: <ArrowRight size={14} />,
                    },
                    {
                      label: "Furnishing Status",
                      value: selectedProperty?.data?.furnishingStatus,
                      icon: <Home size={14} />,
                    },
                    {
                      label: "Legal Status",
                      value: selectedProperty?.data?.reraApproved
                        ? "RERA Approved"
                        : "Pending",
                      icon: <ShieldCheck size={14} />,
                    },
                  ].map((row, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between py-2 text-sm border-b border-zinc-50 last:border-0"
                    >
                      <span className="text-zinc-400 flex items-center gap-3">
                        {row.icon} {row.label}
                      </span>
                      <span className="font-semibold text-zinc-900">
                        {row.value || "-"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visual Evidence Area */}
              <div className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300 border-b border-zinc-50 pb-3">
                  Evidence Verification
                </h4>
                <div className="rounded-xl border border-zinc-200 overflow-hidden bg-zinc-50 shadow-inner group relative">
                  {selectedProperty && (
                    <img
                      src={selectedProperty.screenshotUrl}
                      className="w-full h-auto transition-all duration-1000"
                    />
                  )}
                </div>
                <Button
                  variant="outline"
                  className="w-full h-12 text-zinc-600 hover:text-zinc-900 border-zinc-200 font-bold rounded-xl gap-3 cursor-pointer"
                  asChild
                >
                  <a
                    href={selectedProperty?.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <ExternalLink size={16} /> Open Original Source
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
