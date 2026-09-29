import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tiện ích kết hợp class Tailwind có điều kiện,
 * tự động giải quyết xung đột class theo chuẩn mực Shadcn/ui.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
