"use client";

import React, { useEffect, useState } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Bot, PlusCircle, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatMessageList } from "./ChatMessageList";
import { ChatInputForm } from "./ChatInputForm";
import { chatApi } from "@/lib/api/chat";
import { AIChatMessageItem } from "@/types/chat";
import { toast } from "sonner";

interface AIChatDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  screeningResultId?: string | null;
}

/**
 * Cửa sổ Trợ lý Y tế AI dạng Drawer (Sheet Shadcn UI) trượt từ cạnh phải màn hình.
 */
export function AIChatDrawer({ open, onOpenChange, screeningResultId }: AIChatDrawerProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AIChatMessageItem[]>([]);
  const [citedSources, setCitedSources] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Khởi tạo phiên trò chuyện khi mở Drawer
  useEffect(() => {
    if (open && !sessionId) {
      initSession();
    }
  }, [open, screeningResultId]);

  const initSession = async () => {
    try {
      setIsLoading(true);
      const res = await chatApi.createSession({
        screening_result_id: screeningResultId || undefined,
        title: "Tư vấn sức khỏe AI",
      });
      setSessionId(res.id);
      setMessages(res.messages || []);
    } catch {
      toast.error("Không thể khởi tạo phiên trò chuyện y tế. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!sessionId) return;
    try {
      setIsLoading(true);
      // Hiển thị tin nhắn người dùng tức thì (Optimistic UI)
      const optimisticMsg: AIChatMessageItem = {
        id: `temp-${Date.now()}`,
        session_id: sessionId,
        sender_role: "user",
        content,
        is_emergency_flag: false,
        tokens_used: 0,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimisticMsg]);

      const res = await chatApi.sendMessage(sessionId, { content });
      setMessages((prev) => [...prev.filter((m) => m.id !== optimisticMsg.id), res.user_message, res.assistant_message]);
      if (res.cited_sources?.length) setCitedSources(res.cited_sources);
      if (res.is_emergency) toast.error("🚨 Phát hiện triệu chứng khẩn cấp! Hãy gọi 115 ngay!");
    } catch {
      toast.error("Có lỗi xảy ra khi trao đổi với AI. Vui lòng thử lại!");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md p-0 flex flex-col h-full bg-slate-50 dark:bg-slate-950">
        <SheetHeader className="px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center text-white">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <SheetTitle className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">
                Trợ lý Y tế AI (CDSS)
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </SheetTitle>
              <div className="text-[11px] text-slate-500 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-teal-600" />
                Chuẩn Bộ Y tế & WHO
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={initSession} className="text-xs text-slate-600 hover:text-teal-600 flex items-center gap-1">
            <PlusCircle className="w-3.5 h-3.5" /> Mới
          </Button>
        </SheetHeader>

        <ChatMessageList messages={messages} isLoading={isLoading} citedSources={citedSources} />
        <ChatInputForm onSendMessage={handleSendMessage} isLoading={isLoading} />
      </SheetContent>
    </Sheet>
  );
}
