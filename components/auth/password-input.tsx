"use client";

import { Eye, EyeOff, Lock } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ComponentProps, forwardRef, useState } from "react";
import { cn } from "@/lib/utils";

const PasswordInput = forwardRef<HTMLInputElement, ComponentProps<"input">>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          {...props}
          ref={ref}
          type={showPassword ? "text" : "password"}
          className={cn("pl-10 h-11", className)}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent text-muted-foreground cursor-pointer"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
        </Button>
      </div>
    );
  },
);

export default PasswordInput;
