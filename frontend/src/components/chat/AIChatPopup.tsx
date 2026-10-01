"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Bot, Maximize2, RotateCcw, X, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChatMessageList } from "./ChatMessageList";
import { ChatInputForm } from "./ChatInputForm";
import { chatApi } from "@/lib/api/chat";
import { AIChatMessageItem } from "@/types/chat";
import { toast } from "sonner";

interface AIChatPopupProps {
  open: boolean;
  onClose: () => void;
  screeningResultId?: string | null;
}

/**
 * Cửa sổ Popup Trợ lý Y tế AI nổi ở góc dưới bên phải màn hình (Floating Widget).
 * Hỗ trợ mở toàn màn hình sang trang riêng /chat và làm mới phiên trò chuyện.
 */
export function AIChatPopup({ open, onClose, screeningResultId }: AIChatPopupProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AIChatMessageItem[]>([]);
  const [citedSources, setCitedSources] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
      setCitedSources([]);
    } catch {
      toast.error("Không thể khởi tạo phiên trò chuyện y tế.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!sessionId) return;
    try {
      setIsLoading(true);
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
      toast.error("Lỗi khi gửi tin nhắn tới AI.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[92vw] sm:w-[420px] h-[580px] max-h-[82vh] bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-200">
      {/* Header Widget */}
      <div className="px-4 py-3 bg-gradient-to-r from-teal-700 to-teal-800 text-white flex items-center justify-between shadow-xs shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white backdrop-blur-xs">
            <Bot className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-bold flex items-center gap-1.5">
              Trợ lý Y tế AI (CDSS)
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="text-[10px] text-teal-200 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Chuẩn Bộ Y tế & WHO
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Link href="/chat" onClick={onClose} title="Mở trang riêng toàn màn hình">
            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-white/80 hover:text-white hover:bg-white/10">
              <Maximize2 className="w-4 h-4" />
            </Button>
          </Link>
          <Button variant="ghost" size="icon" onClick={initSession} title="Làm mới phiên trò chuyện" className="w-8 h-8 rounded-lg text-white/80 hover:text-white hover:bg-white/10">
            <RotateCcw className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} title="Thu nhỏ popup" className="w-8 h-8 rounded-lg text-white/80 hover:text-white hover:bg-white/10">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Danh sách tin nhắn & Khung nhập */}
      <ChatMessageList messages={messages} isLoading={isLoading} citedSources={citedSources} />
      <div className="shrink-0">
        <ChatInputForm onSendMessage={handleSendMessage} isLoading={isLoading} />
      </div>
    </div>
  );
}
