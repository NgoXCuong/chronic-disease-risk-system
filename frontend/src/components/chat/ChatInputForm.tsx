"use client";

import React, { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ChatInputFormProps {
  onSendMessage: (content: string) => void;
  isLoading: boolean;
}

const QUICK_PROMPTS = [
  "Ý nghĩa của chỉ số HbA1c và Glucose đói?",
  "Người bị tăng huyết áp nên ăn bao nhiêu muối mỗi ngày?",
  "Định mức tập thể dục theo WHO để phòng đột quỵ?",
  "Chỉ số BMI của tôi là 27 có nguy hiểm không?",
];

/**
 * Khung nhập tin nhắn và các nút gợi ý câu hỏi nhanh chuẩn lâm sàng.
 * Tuân thủ triệt để Quy tắc Shadcn UI First (Textarea, Button).
 */
export function ChatInputForm({ onSendMessage, isLoading }: ChatInputFormProps) {
  const [content, setContent] = useState("");

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!content.trim() || isLoading) return;
    onSendMessage(content.trim());
    setContent("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        {QUICK_PROMPTS.map((prompt, i) => (
          <Button
            key={i}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onSendMessage(prompt)}
            disabled={isLoading}
            className="text-[11px] h-7 whitespace-nowrap bg-teal-50/70 dark:bg-teal-950/40 text-teal-800 dark:text-teal-200 hover:bg-teal-100 dark:hover:bg-teal-900/60 px-2.5 rounded-full border-teal-200/80 dark:border-teal-800 shadow-none font-normal"
          >
            {prompt}
          </Button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2 items-center mt-1">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Hỏi về kết quả sàng lọc, chỉ số xét nghiệm, dinh dưỡng..."
          disabled={isLoading}
          rows={1}
          className="flex-1 resize-none rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 py-2.5 text-sm focus-visible:ring-2 focus-visible:ring-teal-500 min-h-[44px] max-h-24"
        />
        <Button
          type="submit"
          disabled={!content.trim() || isLoading}
          className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl min-h-[44px] min-w-[44px] px-3 shrink-0 flex items-center justify-center transition-all shadow-sm cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
