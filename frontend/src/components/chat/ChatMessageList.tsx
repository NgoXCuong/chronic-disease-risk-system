"use client";

import React, { useEffect, useRef } from "react";
import { AIChatMessageItem } from "@/types/chat";
import { ChatMessageItem } from "./ChatMessageItem";
import { BookOpen, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface ChatMessageListProps {
  messages: AIChatMessageItem[];
  isLoading: boolean;
  citedSources?: string[];
}

/**
 * Danh sách hiển thị lịch sử trao đổi y tế có khả năng tự động cuộn và thanh cuộn mượt mà.
 */
export function ChatMessageList({ messages, isLoading, citedSources = [] }: ChatMessageListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Tự động cuộn xuống tin nhắn mới nhất
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages, isLoading]);

  return (
    <div
      ref={scrollRef}
      className="flex-1 min-h-0 overflow-y-auto px-4 py-3 space-y-2.5 overscroll-contain"
      tabIndex={0}
      role="region"
      aria-label="Lịch sử tin nhắn tư vấn"
    >
      {messages.map((msg) => (
        <ChatMessageItem key={msg.id} message={msg} />
      ))}

      {isLoading && (
        <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400 text-xs py-2 px-3 bg-teal-50/70 dark:bg-teal-950/30 rounded-xl w-fit border border-teal-100 dark:border-teal-900 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-teal-600 animate-spin shrink-0" />
          <div className="space-y-1">
            <span className="font-medium text-teal-900 dark:text-teal-200">Trợ lý AI đang tra cứu y văn Bộ Y tế & suy luận...</span>
            <div className="flex gap-1.5 items-center">
              <Skeleton className="h-2 w-16 bg-teal-200 dark:bg-teal-800" />
              <Skeleton className="h-2 w-24 bg-teal-200 dark:bg-teal-800" />
            </div>
          </div>
        </div>
      )}

      {citedSources.length > 0 && (
        <div className="pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-1.5">
            <BookOpen className="w-3.5 h-3.5 text-teal-600" />
            Nguồn tri thức y khoa đối chiếu:
          </div>
          <div className="flex flex-wrap gap-1.5">
            {citedSources.map((src, i) => (
              <Badge
                key={i}
                variant="outline"
                className="text-[11px] bg-teal-50/50 dark:bg-teal-950/30 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800 rounded-lg py-0.5"
              >
                {src}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
