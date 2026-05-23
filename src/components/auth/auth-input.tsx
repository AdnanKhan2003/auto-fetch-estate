"use client";
import { useState } from "react";
import { Label } from "../ui/label";
import { Eye, EyeOff, Lock, LucideIcon } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  icon: LucideIcon;
  isPassword?: boolean;
}

function AuthInput({
  id,
  label,
  icon: Icon,
  isPassword,
  ...props
}: AuthInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Icon
          aria-hidden="true"
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
        />
        <Input
          id={id}
          type={isPassword ? (showPassword ? "text" : "password") : props.type}
          className="pl-10"
          {...props}
        />
        {isPassword && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-transparent cursor-pointer text-muted-foreground hover:text-foreground"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
            <span className="sr-only">
              {showPassword ? "Hide password" : "Show password"}
            </span>
          </Button>
        )}
      </div>
    </div>
  );
}

export default AuthInput;
