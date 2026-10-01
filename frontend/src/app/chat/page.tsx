"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ChatMessageList } from "@/components/chat/ChatMessageList";
import { ChatInputForm } from "@/components/chat/ChatInputForm";
import { chatApi } from "@/lib/api/chat";
import { AIChatMessageItem, AIChatSessionListItem } from "@/types/chat";
import { useAuth } from "@/hooks/useAuth";
import { Bot, MessageSquare, Plus, ShieldCheck, Sparkles, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import Link from "next/link";

export default function ChatPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [sessions, setSessions] = useState<AIChatSessionListItem[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AIChatMessageItem[]>([]);
  const [citedSources, setCitedSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  // Nạp danh sách các phiên trò chuyện nếu đã đăng nhập
  useEffect(() => {
    if (isAuthenticated) {
      loadSessions();
    }
  }, [isAuthenticated]);

  const loadSessions = async () => {
    try {
      setLoading(true);
      const list = await chatApi.listSessions();
      setSessions(list);
      if (list.length > 0) {
        selectSession(list[0].id);
      } else {
        handleCreateSession();
      }
    } catch {
      toast.error("Không thể tải danh sách phiên trò chuyện.");
    } finally {
      setLoading(false);
    }
  };

  const selectSession = async (sessionId: string) => {
    try {
      setLoading(true);
      setActiveSessionId(sessionId);
      const detail = await chatApi.getSessionDetail(sessionId);
      setMessages(detail.messages || []);
      setCitedSources([]);
    } catch {
      toast.error("Không thể tải nội dung phiên trò chuyện.");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSession = async () => {
    try {
      setLoading(true);
      const newSession = await chatApi.createSession({
        title: "Tư vấn sức khỏe AI mới",
      });
      setActiveSessionId(newSession.id);
      setMessages(newSession.messages || []);
      setCitedSources([]);
      // Cập nhật lại danh sách phiên
      const list = await chatApi.listSessions();
      setSessions(list);
    } catch {
      toast.error("Lỗi khi khởi tạo phiên trò chuyện mới.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!activeSessionId) return;
    try {
      setSending(true);
      const optimisticMsg: AIChatMessageItem = {
        id: `temp-${Date.now()}`,
        session_id: activeSessionId,
        sender_role: "user",
        content,
        is_emergency_flag: false,
        tokens_used: 0,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, optimisticMsg]);

      const res = await chatApi.sendMessage(activeSessionId, { content });
      setMessages((prev) => [
        ...prev.filter((m) => m.id !== optimisticMsg.id),
        res.user_message,
        res.assistant_message,
      ]);
      if (res.cited_sources?.length) setCitedSources(res.cited_sources);
      if (res.is_emergency) toast.error("🚨 Phát hiện dấu hiệu cấp cứu! Hãy liên hệ 115 ngay!");
    } catch {
      toast.error("Không thể gửi tin nhắn. Vui lòng thử lại!");
    } finally {
      setSending(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 text-center shadow-lg">
            <div className="w-14 h-14 rounded-2xl bg-teal-100 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center mx-auto mb-4">
              <Bot className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              Trợ lý Y tế AI (CDSS)
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
              Vui lòng đăng nhập để lưu trữ lịch sử tư vấn, đối chiếu kết quả sàng lọc và chỉ số xét nghiệm lâm sàng an toàn.
            </p>
            <div className="flex gap-3 justify-center">
              <Link href="/login">
                <Button className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl min-h-[44px] px-6">
                  Đăng nhập
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" className="rounded-xl min-h-[44px] px-6">
                  Đăng ký
                </Button>
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Bot className="w-7 h-7 text-teal-600" />
              Trợ lý Y tế AI RAG
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Tư vấn kết quả sàng lọc, phân tích chỉ số sinh hóa từ giấy khám bệnh và khuyến cáo lối sống
            </p>
          </div>
          <Button
            onClick={handleCreateSession}
            disabled={loading}
            className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl min-h-[44px] flex items-center gap-1.5 shadow-sm"
          >
            <Plus className="w-4 h-4" /> Phiên mới
          </Button>
        </div>

        {/* Khung trò chuyện 2 cột */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden min-h-[600px]">
          {/* Cột trái: Danh sách phiên */}
          <div className="hidden lg:flex flex-col border-r border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 p-3">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 px-2">
              Lịch sử trao đổi ({sessions.length})
            </div>
            <ScrollArea className="flex-1 pr-1">
              <div className="space-y-1.5">
                {sessions.map((s) => (
                  <Button
                    key={s.id}
                    variant="ghost"
                    onClick={() => selectSession(s.id)}
                    className={`w-full justify-start text-left p-3 h-auto rounded-xl transition-all border text-xs cursor-pointer flex flex-col items-start ${
                      activeSessionId === s.id
                        ? "bg-teal-50 dark:bg-teal-950/40 border-teal-200 dark:border-teal-800 text-teal-900 dark:text-teal-200 shadow-xs"
                        : "bg-white dark:bg-slate-900 border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <div className="font-semibold truncate w-full mb-0.5">{s.title}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate w-full font-normal">
                      {s.last_message || "Chưa có tin nhắn"}
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Cột phải: Khung chat chính */}
          <div className="lg:col-span-3 flex flex-col h-full bg-white dark:bg-slate-900">
            {/* Header chat */}
            <div className="px-5 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-teal-600 text-white flex items-center justify-center shadow-xs">
                  <Bot className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    Trợ lý Y tế AI (CDSS)
                    <Badge variant="outline" className="text-[10px] text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800">
                      Sẵn sàng
                    </Badge>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-teal-600" />
                    Căn cứ Hướng dẫn Chẩn đoán Bộ Y tế (QĐ 5481, QĐ 5904) & WHO
                  </div>
                </div>
              </div>
            </div>

            {/* Danh sách tin nhắn */}
            <ChatMessageList
              messages={messages}
              isLoading={sending || loading}
              citedSources={citedSources}
            />

            {/* Khung nhập tin nhắn */}
            <ChatInputForm onSendMessage={handleSendMessage} isLoading={sending || loading} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
