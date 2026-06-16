import type { Metadata } from "next";
import { Poppins } from "next/font/google"; // Import Poppins
import ThemeProvider from "@/components/theme/theme-provider";
import "./globals.css";
import { TooltipProvider } from "@/components/ui/tooltip";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-poppins", // Optional: for Tailwind use
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000",
  ),
  title: "V S Jadon Compare | AI Real Estate Analysis",
  description:
    "Analyze and compare real estate properties using AI. Extract structured data and visual evidence to make informed investment decisions instantly.",

  // This explicitly fixes Discord & WhatsApp
  openGraph: {
    title: "V S Jadon Compare | AI-Powered Real Estate",
    description:
      "AI-driven tool for extracting structured data and visual evidence from property listings.",
    url: "https://auto-fetch-estate.vercel.app",
    siteName: "V S Jadon Compare",
    type: "website",
    images: [
      {
        url: "https://auto-fetch-estate.vercel.app/vsjadon-og-image.png",
        width: 1200, // WhatsApp requires dimensions!
        height: 630,
        alt: "V S Jadon Compare Preview Image",
      },
    ],
  },

  // This explicitly fixes the Twitter validation error
  twitter: {
    card: "summary_large_image",
    title: "V S Jadon Compare",
    description: "AI-Powered Real Estate Property Analysis Tool",
    images: ["https://auto-fetch-estate.vercel.app/vsjadon-og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <body
        className={`${poppins.className} min-h-full flex flex-col antialiased selection:bg-zinc-900 selection:text-white dark:selection:bg-zinc-200 dark:selection:text-zinc-900`}
      >
        <ThemeProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
