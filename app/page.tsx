"use client";

import {
  ExternalLink,
  Loader2,
  Plus,
  Trash2,
  X,
  ShieldCheck,
  MapPin,
  Ruler,
  Home,
} from "lucide-react";
import { useState } from "react";

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
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-[95%] mx-auto space-y-8">
        {/* Input Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Home className="text-blue-600" /> Real Estate Scraper
          </h1>
          <div className="space-y-3">
            {urls.map((url, index) => (
              <div key={index} className="flex items-center gap-3">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => {
                    const newUrls = [...urls];
                    newUrls[index] = e.target.value;
                    setUrls(newUrls);
                  }}
                  className="flex-1 p-3 text-gray-900 bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Paste property URL..."
                />
                {urls.length > 1 && (
                  <button
                    onClick={() => {
                      const newUrls = [...urls];
                      newUrls.splice(index, 1);
                      setUrls(newUrls);
                    }}
                    className="p-3 text-red-500 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="flex items-center mt-6 gap-4">
            <button
              onClick={() => setUrls([...urls, ""])}
              className="flex items-center gap-2 px-4 py-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg font-medium"
            >
              <Plus className="w-4 h-4" /> Add URL
            </button>
            <button
              onClick={handleScrape}
              disabled={isLoading || urls.every((u) => !u.trim())}
              className="ml-auto px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : null}
              {isLoading ? "Scraping..." : "Extract Data"}
            </button>
          </div>
        </div>

        {/* Results Table */}
        {results.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50 text-gray-900 font-semibold border-b">
                <tr>
                  <th className="p-4">Image</th>
                  <th className="p-4">Title</th>
                  <th className="p-4">Price</th>
                  <th className="p-4">Area</th>
                  <th className="p-4">Carpet Area</th>
                  <th className="p-4">Location</th>
                  <th className="p-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {results.map((item, idx) => (
                  <tr
                    key={idx}
                    onClick={() => setSelectedProperty(item)}
                    className="hover:bg-blue-50 cursor-pointer transition-colors group"
                  >
                    <td className="p-4">
                      <img
                        src={item.screenshotUrl}
                        className="w-20 h-14 object-cover rounded border"
                      />
                    </td>
                    <td className="p-4 font-medium text-gray-900">
                      {item.data?.propertyTitle || "Pending..."}
                    </td>
                    <td className="p-4 text-green-700 font-bold">
                      {item.data?.price || "-"}
                    </td>
                    <td className="p-4 text-gray-900 font-bold">
                      {item.data?.area || "N/A"}
                    </td>
                    <td className="p-4 text-gray-900 font-bold">
                      {item.data?.carpetArea || "N/A"}
                    </td>
                    <td className="p-4">{item.data?.location || "-"}</td>
                    <td className="p-4">
                      <button className="text-blue-600 font-semibold group-hover:underline">
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-gray-50 border-t-2 border-gray-200">
                <tr className="bg-gray-100">
                  <td
                    colSpan={2}
                    className="p-4 font-bold text-gray-900 text-right"
                  >
                    Average Market Price:
                  </td>
                  <td className="p-4 font-black text-blue-700 text-lg">
                    ₹{averagePrice.toLocaleString("en-IN")}
                  </td>
                  <td colSpan={3} className="p-4 text-xs text-gray-500 italic">
                    Calculated from {validPrices.length} sucessful scrapes
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      {/* --- FULL DETAILS MODAL --- */}
      {selectedProperty && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-white sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {selectedProperty.data?.propertyTitle || "Property Details"}
                </h2>
                <p className="text-sm text-gray-500 truncate max-w-md">
                  {selectedProperty.url}
                </p>
              </div>
              <button
                onClick={() => setSelectedProperty(null)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="overflow-y-auto p-8 space-y-10">
              {/* Section A: Valuation Summary */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-blue-600 mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Section A: Valuation
                  Summary
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div className="bg-blue-50 p-4 rounded-xl">
                    <p className="text-xs text-blue-600 font-medium mb-1">
                      Total Price
                    </p>
                    <p className="text-xl font-bold text-gray-900">
                      {selectedProperty.data?.price || "N/A"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs text-gray-500 font-medium mb-1">
                      Price per Sqft
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedProperty.data?.pricePerSqft || "N/A"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs text-gray-500 font-medium mb-1">
                      Area
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedProperty.data?.area || "N/A"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-xs text-gray-500 font-medium mb-1">
                      Building Age
                    </p>
                    <p className="text-lg font-semibold text-gray-900">
                      {selectedProperty.data?.ageOfBuilding || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section B: Location & Scores */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-orange-600 mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Section B: Location & Scores
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-gray-100 rounded-xl p-4 flex justify-between items-center">
                    <span className="text-gray-500">City / Locality</span>
                    <span className="font-semibold text-gray-900">
                      {selectedProperty.data?.city} /{" "}
                      {selectedProperty.data?.location}
                    </span>
                  </div>
                  <div className="border border-gray-100 rounded-xl p-4 flex justify-between items-center">
                    <span className="text-gray-500">Livability Score</span>
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full font-bold">
                      {selectedProperty.data?.livabilityScore || "N/A"}
                    </span>
                  </div>
                  <div className="border border-gray-100 rounded-xl p-4 flex justify-between items-center">
                    <span className="text-gray-500">Safety Score</span>
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-bold">
                      {selectedProperty.data?.safetyScore || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section C: Technical Specs */}
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-purple-600 mb-4 flex items-center gap-2">
                  <Ruler className="w-4 h-4" /> Section C: Technical Specs
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                  <div className="p-4 border border-gray-100 rounded-xl">
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">
                      Floor
                    </p>
                    <p className="font-semibold text-gray-900">
                      {selectedProperty.data?.floorNo} /{" "}
                      {selectedProperty.data?.totalFloors}
                    </p>
                  </div>
                  <div className="p-4 border border-gray-100 rounded-xl">
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">
                      Facing
                    </p>
                    <p className="font-semibold text-gray-900">
                      {selectedProperty.data?.facing || "N/A"}
                    </p>
                  </div>
                  <div className="p-4 border border-gray-100 rounded-xl">
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">
                      Overlooking
                    </p>
                    <p className="font-semibold text-gray-900">
                      {selectedProperty.data?.overlooking || "N/A"}
                    </p>
                  </div>
                  <div className="p-4 border border-gray-100 rounded-xl">
                    <p className="text-[10px] text-gray-400 uppercase font-bold mb-1">
                      Furnishing
                    </p>
                    <p className="font-semibold text-gray-900">
                      {selectedProperty.data?.furnishingStatus || "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Section D: Trust & Legal */}
              <div className="bg-gray-900 p-6 rounded-2xl text-white">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4" /> Section D: Trust & Legal
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${selectedProperty.data?.reraApproved ? "bg-green-500" : "bg-red-500"}`}
                    />
                    <span>
                      RERA Approved:{" "}
                      <b>
                        {selectedProperty.data?.reraApproved ? "YES" : "NO"}
                      </b>
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${selectedProperty.data?.verifiedTag ? "bg-blue-500" : "bg-gray-500"}`}
                    />
                    <span>
                      Verified Listing:{" "}
                      <b>{selectedProperty.data?.verifiedTag ? "YES" : "NO"}</b>
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span>
                      Ownership:{" "}
                      <b>{selectedProperty.data?.ownershipType || "N/A"}</b>
                    </span>
                  </div>
                </div>
              </div>

              {/* Full Page Screenshot Preview */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500">
                  Full Webpage Evidence
                </h3>
                <img
                  src={selectedProperty.screenshotUrl}
                  alt="Full Screenshot"
                  className="w-full rounded-xl border border-gray-200 shadow-sm"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <a
                href={selectedProperty.url}
                target="_blank"
                className="flex items-center gap-2 px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-black transition-colors"
              >
                <ExternalLink className="w-4 h-4" /> Visit Original Website
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
