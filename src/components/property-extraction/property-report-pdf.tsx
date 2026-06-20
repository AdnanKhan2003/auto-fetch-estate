"use client";

import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import { createTw } from "react-pdf-tailwind";
import { parseIndianPrice, formatRatePerSqft } from "@/lib/format-utils";

// Initialize Tailwind for React-PDF
const tw = createTw({
  fontFamily: {
    sans: ["Helvetica"],
  },
});

export const PropertyReportPdf = ({
  properties,
  rowFactors = {},
}: {
  properties: any[];
  rowFactors?: Record<string, number>;
}) => {
  const imageRows = [];
  for (let i = 0; i < properties.length; i += 2) {
    imageRows.push(properties.slice(i, i + 2));
  }

  return (
    <Document>
      {/* PAGE 1: THE TABLE */}
      <Page size="A4" style={tw("p-8 font-sans text-[10px]")}>
        <Text style={tw("text-lg mb-5 font-bold text-center")}>
          Property Extraction Report
        </Text>

        <View
          style={tw("flex w-full border border-gray-300 border-r-0 border-b-0")}
        >
          {/* Table Header */}
          <View style={tw("flex flex-row")}>
            <View
              style={tw(
                "w-[8%] border border-gray-300 border-l-0 border-t-0 bg-gray-100 p-1.5",
              )}
            >
              <Text style={tw("font-bold")}>Index</Text>
            </View>
            <View
              style={tw(
                "w-[26%] border border-gray-300 border-l-0 border-t-0 bg-gray-100 p-1.5",
              )}
            >
              <Text style={tw("font-bold")}>Name</Text>
            </View>
            <View
              style={tw(
                "w-[22%] border border-gray-300 border-l-0 border-t-0 bg-gray-100 p-1.5",
              )}
            >
              <Text style={tw("font-bold")}>Area/Sqft</Text>
            </View>
            <View
              style={tw(
                "w-[22%] border border-gray-300 border-l-0 border-t-0 bg-gray-100 p-1.5",
              )}
            >
              <Text style={tw("font-bold")}>Market Price</Text>
            </View>
            <View
              style={tw(
                "w-[22%] border border-gray-300 border-l-0 border-t-0 bg-gray-100 p-1.5",
              )}
            >
              <Text style={tw("font-bold")}>Rate/Sqft</Text>
            </View>
          </View>

          {/* Table Rows */}
          {properties.map((p, index) => {
            const nameMatch = p.url.match(/https?:\/\/(?:www\.)?([^./]+)\./i);
            const siteName = nameMatch ? nameMatch[1] : "Unknown";
            const area =
              p.data?.carpetArea ||
              p.data?.builtupArea ||
              p.data?.superBuiltupArea ||
              "N/A";

            // Convert Price text to actual Numbers (e.g. 2 Cr -> 2,00,00,000)
            let price = p.data?.price || "N/A";
            if (p.data?.price) {
              const numericPrice = parseIndianPrice(p.data.price);
              if (numericPrice) {
                price = `₹${numericPrice.toLocaleString("en-IN")}`;
              }
            }

            // Calculate Rate
            let effectiveArea = null;
            let factor = rowFactors[p.url];
            if (p.data?.carpetArea) {
              effectiveArea = parseIndianPrice(p.data.carpetArea);
            } else if (p.data?.builtupArea) {
              effectiveArea =
                parseIndianPrice(p.data.builtupArea) * (factor ?? 0.85);
            } else if (p.data?.superBuiltupArea) {
              effectiveArea =
                parseIndianPrice(p.data.superBuiltupArea) * (factor ?? 0.72);
            }
            const calculatedRate = formatRatePerSqft(
              p.data?.price,
              effectiveArea,
            );
            const rate = calculatedRate || p.data?.pricePerSqft || "N/A";

            return (
              <View style={tw("flex flex-row")} key={index}>
                <View
                  style={tw(
                    "w-[8%] border border-gray-300 border-l-0 border-t-0 p-1.5",
                  )}
                >
                  <Text>{index + 1}</Text>
                </View>
                <View
                  style={tw(
                    "w-[26%] border border-gray-300 border-l-0 border-t-0 p-1.5",
                  )}
                >
                  <Text>{siteName}</Text>
                </View>
                <View
                  style={tw(
                    "w-[22%] border border-gray-300 border-l-0 border-t-0 p-1.5",
                  )}
                >
                  <Text>{area}</Text>
                </View>
                <View
                  style={tw(
                    "w-[22%] border border-gray-300 border-l-0 border-t-0 p-1.5",
                  )}
                >
                  <Text>{price}</Text>
                </View>
                <View
                  style={tw(
                    "w-[22%] border border-gray-300 border-l-0 border-t-0 p-1.5",
                  )}
                >
                  <Text>{rate}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </Page>

      {/* PAGE 2+: THE SCREENSHOTS GRID */}
      <Page size="A4" style={tw("p-8 font-sans")}>
        <Text style={tw("text-lg mb-5 font-bold text-center")}>
          Property Screenshots
        </Text>

        {imageRows.map((row, rowIndex) => (
          // Increased height from h-[30%] to h-[45%] so only 2 rows (4 screenshots) fit per page!
          <View
            key={rowIndex}
            style={tw("flex flex-row justify-between h-[45%] mb-[4%]")}
            wrap={false}
          >
            {row.map((p, colIndex) => {
              if (!p.screenshotUrl)
                return <View key={colIndex} style={tw("w-[48%]")} />;

              const nameMatch = p.url.match(/https?:\/\/(?:www\.)?([^./]+)\./i);
              const siteName = nameMatch ? nameMatch[1] : "Unknown";
              const globalIndex = rowIndex * 2 + colIndex + 1;
              console.log(
                ">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>",
              );
              {
                console.log("Please see me", p.screenshotUrl);
              }

              return (
                <View key={colIndex} style={tw("w-[48%]")}>
                  <Text style={tw("mb-1 text-[10px] font-bold")}>
                    Screenshot {globalIndex} ({siteName})
                  </Text>
                  <Image
                    src={`${typeof window !== "undefined" ? window.location.origin : ""}/api/images/${p.screenshotUrl}`}
                    style={tw(
                      "w-full h-[92%] object-contain border border-gray-300",
                    )}
                  />
                </View>
              );
            })}
          </View>
        ))}
      </Page>
    </Document>
  );
};
