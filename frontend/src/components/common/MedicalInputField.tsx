import * as React from "react";
import { LucideIcon } from "lucide-react";
import { Input, InputProps } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export interface MedicalInputFieldProps extends InputProps {
  label: string;
  required?: boolean;
  error?: string;
  icon?: LucideIcon;
  rightAction?: React.ReactNode;
  containerClassName?: string;
}

export const MedicalInputField = React.forwardRef<
  HTMLInputElement,
  MedicalInputFieldProps
>(
  (
    {
      label,
      id,
      required,
      error,
      icon: Icon,
      rightAction,
      className,
      containerClassName,
      ...inputProps
    },
    ref
  ) => {
    return (
      <div className={cn("space-y-1.5", containerClassName)}>
        <Label htmlFor={id} required={required}>
          {label}
        </Label>
        <div className="relative">
          {Icon && (
            <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          )}
          <Input
            id={id}
            ref={ref}
            className={cn(
              Icon && "pl-10",
              rightAction && "pr-10",
              error && "border-rose-400 focus-visible:ring-rose-400/20",
              className
            )}
            {...inputProps}
          />
          {rightAction && (
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
              {rightAction}
            </div>
          )}
        </div>
        {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
      </div>
    );
  }
);

MedicalInputField.displayName = "MedicalInputField";
