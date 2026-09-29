import React from "react";
import { ShieldCheck, AlertTriangle, AlertOctagon } from "lucide-react";
import { cn } from "@/lib/utils";

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH";

interface RiskBadgeProps {
  level: RiskLevel | string;
  score?: number;
  percentage?: number;
  showIcon?: boolean;
  className?: string;
}

export function RiskBadge({
  level,
  score,
  percentage,
  showIcon = true,
  className,
}: RiskBadgeProps) {
  const normalizedLevel = (level || "LOW").toUpperCase() as RiskLevel;

  const config = {
    LOW: {
      label: "NGUY CƠ THẤP",
      icon: ShieldCheck,
      classes: "bg-risk-low-bg border-risk-low-border text-risk-low-text dark:bg-emerald-950/40 dark:border-emerald-800/60 dark:text-emerald-400",
      iconColor: "text-risk-low-solid dark:text-emerald-400",
    },
    MEDIUM: {
      label: "NGUY CƠ TRUNG BÌNH",
      icon: AlertTriangle,
      classes: "bg-risk-medium-bg border-risk-medium-border text-risk-medium-text dark:bg-amber-950/40 dark:border-amber-800/60 dark:text-amber-400",
      iconColor: "text-risk-medium-solid dark:text-amber-400",
    },
    HIGH: {
      label: "NGUY CƠ CAO",
      icon: AlertOctagon,
      classes: "bg-risk-high-bg border-risk-high-border text-risk-high-text dark:bg-rose-950/40 dark:border-rose-800/60 dark:text-rose-400",
      iconColor: "text-risk-high-solid dark:text-rose-400",
    },
  }[normalizedLevel] || {
    label: "CHƯA XÁC ĐỊNH",
    icon: ShieldCheck,
    classes: "bg-slate-100 border-slate-200 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300",
    iconColor: "text-slate-500 dark:text-slate-400",
  };

  const IconComponent = config.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border tracking-wide shadow-sm",
        config.classes,
        className
      )}
    >
      {showIcon && <IconComponent className={cn("w-3.5 h-3.5", config.iconColor)} />}
      <span>{config.label}</span>
      {percentage !== undefined && (
        <span className="font-extrabold ml-0.5">({percentage.toFixed(1)}%)</span>
      )}
      {percentage === undefined && score !== undefined && (
        <span className="font-extrabold ml-0.5">({(score * 100).toFixed(1)}%)</span>
      )}
    </span>
  );
}
