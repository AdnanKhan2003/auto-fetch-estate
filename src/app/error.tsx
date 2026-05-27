"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import ThemeToggle from "@/components/theme/theme-toggle";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background text-foreground p-6 font-mono relative">
      <div className="absolute top-4 right-4 z-20">
        <ThemeToggle />
      </div>

      {/* Background Glow */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_center,#ef444408_0%,transparent_70%)] dark:bg-[radial-gradient(circle_at_center,#ef444410_0%,transparent_70%)]" />

      <div className="relative z-10 flex flex-col items-center gap-6 text-center">
        <div className="relative">
          <div className="absolute inset-0 bg-red-500/20 blur-[80px]" />
          <AlertTriangle className="h-20 w-20 text-red-500 animate-pulse" />
        </div>

        <div className="space-y-2">
          <h1 className="text-4xl font-black uppercase tracking-tighter text-foreground">
            System <span className="text-red-500">Failure</span>
          </h1>
          <p className="mx-auto max-w-md text-sm text-muted-foreground">
            An unexpected exception occurred during data processing. The system
            logs have been updated.
          </p>
        </div>

        {/* Error Code Display */}
        <div className="w-full max-w-md rounded border border-red-500/20 bg-red-500/5 p-4 text-left font-mono text-[10px] text-red-400/70">
          <p className="mb-2 uppercase font-bold text-red-500">Trace Logs:</p>
          <p className="truncate">
            MESSAGE: {error.message || "Unknown Runtime Error"}
          </p>
          <p>DIGEST: {error.digest || "N/A"}</p>
        </div>

        <div className="flex gap-4">
          <Button
            onClick={() => reset()}
            className="bg-red-500 text-white hover:bg-red-600 font-bold uppercase tracking-widest px-8 cursor-pointer"
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Reboot Session
          </Button>
        </div>
      </div>
    </div>
  );
}
