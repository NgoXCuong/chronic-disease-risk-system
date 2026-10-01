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
 * Hiển thị một tin nhắn trong cuộc hội thoại với Trợ lý Y tế AI.
 * Sử dụng triệt để Shadcn UI (Avatar, Alert, Badge) và màu y tế Medical Teal.
 */
export function ChatMessageItem({ message }: ChatMessageItemProps) {
  const isUser = message.sender_role === "user";
  const isEmergency = message.is_emergency_flag;

  return (
    <div
      className={cn(
        "flex w-full gap-2.5 my-2.5 items-end",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <Avatar className="w-8 h-8 shrink-0 shadow-sm border border-slate-200 dark:border-slate-800">
          <AvatarFallback
            className={cn(
              "text-white text-xs",
              isEmergency ? "bg-rose-600" : "bg-teal-600"
            )}
          >
            {isEmergency ? <AlertTriangle className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
          </AvatarFallback>
        </Avatar>
      )}

      <div className="max-w-[85%] space-y-1">
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
              "rounded-xl px-4 py-3 text-sm shadow-sm transition-all leading-relaxed whitespace-pre-wrap",
              isUser
                ? "bg-teal-600 text-white rounded-br-xs"
                : "bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700/60 rounded-bl-xs"
            )}
          >
            {message.content}
          </div>
        )}

        <div
          className={cn(
            "text-[10px] px-1 select-none",
            isUser ? "text-right text-slate-600 dark:text-slate-300" : "text-left text-slate-600 dark:text-slate-300"
          )}
        >
          {new Date(message.created_at).toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          })}
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
