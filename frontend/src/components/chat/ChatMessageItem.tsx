"use client";

import React from "react";
import { AIChatMessageItem } from "@/types/chat";
import { Bot, User as UserIcon, AlertTriangle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "cn";

interface ChatMessageItemProps {
  message: AIChatMessageItem;
}

/**
 * Hiển thị từng dòng nội dung có hỗ trợ định dạng tiêu đề, in đậm và danh sách y tế.
 */
function FormattedText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1 text-sm leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;
        if (trimmed.startsWith("###")) {
          return (
            <div key={idx} className="font-bold text-teal-800 dark:text-teal-300 pt-2 pb-0.5 text-[13px] flex items-center gap-1.5">
              {trimmed.replace(/^###\s*/, "")}
            </div>
          );
        }
        if (trimmed.startsWith("•") || trimmed.startsWith("-")) {
          return (
            <div key={idx} className="pl-2 flex items-start gap-1.5 text-xs text-slate-700 dark:text-slate-300">
              <span className="text-teal-600 dark:text-teal-400 font-bold shrink-0 mt-0.5">•</span>
              <span>{renderInlineBold(trimmed.replace(/^[•\-]\s*/, ""))}</span>
            </div>
          );
        }
        if (trimmed.startsWith("---")) {
          return <hr key={idx} className="my-1.5 border-slate-200 dark:border-slate-800" />;
        }
        if (trimmed.startsWith("*") && trimmed.endsWith("*")) {
          return (
            <div key={idx} className="italic text-[11px] text-slate-500 dark:text-slate-400 pt-1">
              {trimmed.replace(/^\*|\*$/g, "")}
            </div>
          );
        }
        return <div key={idx}>{renderInlineBold(line)}</div>;
      })}
    </div>
  );
}

function renderInlineBold(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-semibold text-slate-900 dark:text-slate-100">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return part;
  });
}

export function ChatMessageItem({ message }: ChatMessageItemProps) {
  const isUser = message.sender_role === "user";
  const isEmergency = message.is_emergency_flag;

  return (
    <div className={cn("flex w-full gap-2.5 my-2.5 items-end", isUser ? "justify-end" : "justify-start")}>
      {!isUser && (
        <Avatar className="w-8 h-8 shrink-0 shadow-sm border border-slate-200 dark:border-slate-800">
          <AvatarFallback className={cn("text-white text-xs", isEmergency ? "bg-rose-600" : "bg-teal-600")}>
            {isEmergency ? <AlertTriangle className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
          </AvatarFallback>
        </Avatar>
      )}

      <div className="max-w-[88%] space-y-1">
        {isEmergency ? (
          <Alert variant="destructive" className="rounded-xl border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 py-2.5 px-3.5 shadow-sm">
            <AlertTriangle className="h-4 w-4 animate-bounce text-rose-600 dark:text-rose-400" />
            <AlertTitle className="text-xs font-bold uppercase tracking-wider mb-1 text-rose-700 dark:text-rose-300">
              Cảnh báo y tế khẩn cấp (115)
            </AlertTitle>
            <AlertDescription className="text-xs leading-relaxed whitespace-pre-wrap font-medium">
              {message.content}
            </AlertDescription>
          </Alert>
        ) : (
          <div
            className={cn(
              "rounded-xl px-4 py-3 shadow-sm transition-all whitespace-pre-wrap",
              isUser
                ? "bg-teal-600 text-white rounded-br-xs text-sm"
                : "bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700/60 rounded-bl-xs"
            )}
          >
            {isUser ? message.content : <FormattedText text={message.content} />}
          </div>
        )}

        <div className={cn("text-[10px] px-1 select-none", isUser ? "text-right text-slate-600 dark:text-slate-300" : "text-left text-slate-600 dark:text-slate-300")}>
          {new Date(message.created_at).toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}
        </div>
      </div>

      {isUser && (
        <Avatar className="w-8 h-8 shrink-0 shadow-sm border border-slate-200 dark:border-slate-700">
          <AvatarFallback className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs">
            <UserIcon className="w-4 h-4" />
          </AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
