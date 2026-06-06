"use client";

import { Eye, EyeOff, Lock } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ComponentProps, forwardRef, useState } from "react";
import { cn } from "@/lib/utils";
import TooltipWrapper from "../tooltip/tooltip";

const PasswordInput = forwardRef<HTMLInputElement, ComponentProps<"input">>(
  ({ className, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    return (
      <div className="relative">
        <Lock className="top-1/2 left-3 absolute w-4 h-4 text-muted-foreground -translate-y-1/2" />
        <Input
          {...props}
          ref={ref}
          type={showPassword ? "text" : "password"}
          className={cn("pl-10 h-11", className)}
        />
        <div className="top-1/2 right-1 absolute -translate-y-1/2">
          <TooltipWrapper
            content={showPassword ? "Hide Password" : "Show Password"}
          >
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="hover:bg-transparent w-8 h-8 text-muted-foreground cursor-pointer"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </Button>
          </TooltipWrapper>
        </div>
      </div>
    );
  },
);

export default PasswordInput;
