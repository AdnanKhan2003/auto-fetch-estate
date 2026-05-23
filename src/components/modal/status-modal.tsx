"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";

interface StatuModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "success" | "error";
  title: string;
  message: string;
  buttonText?: string;
}

function StatusModal({
  isOpen,
  onClose,
  type,
  title,
  message,
  buttonText,
}: StatuModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-xl border-border bg-card p-8 max-w-sm shadow-2xl">
        <DialogHeader className="flex flex-col items-center gap-4 text-center">
          {type === "success" ? (
            <div className="rounded-full bg-green-50 p-3 dark:bg-green-950/30">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </div>
          ) : (
            <div className="rounded-full bg-red-50 p-3 dark:bg-red-950/30">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          )}
          <DialogTitle className="text-xl font-bold tracking-tight">
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="py-2 text-center">
          <p className="text-sm text-muted-foreground leading-relaxed">
            {message}
          </p>
        </div>

        <DialogFooter className="mt-6">
          <Button
            onClick={onClose}
            className="w-full h-11 rounded-md font-semibold"
            variant={type == "success" ? "default" : "destructive"}
          >
            {buttonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default StatusModal;
