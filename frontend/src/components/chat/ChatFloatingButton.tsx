"use client";

import React, { useState } from "react";
import { Bot } from "lucide-react";
import { AIChatDrawer } from "./AIChatDrawer";
import { Button } from "@/components/ui/button";

interface ChatFloatingButtonProps {
  screeningResultId?: string | null;
}

/**
 * Nút Trợ lý Y tế AI nổi cố định ở góc dưới bên phải màn hình (Floating Action Button).
 * Xây dựng bằng Shadcn UI Button, Medical Teal và kích thước mobile touch target >= 44px (56px).
 */
export function ChatFloatingButton({ screeningResultId }: ChatFloatingButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40 flex items-center gap-2">
        <Button
          onClick={() => setIsOpen(true)}
          className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-700/25 transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer p-0"
          title="Trò chuyện với Trợ lý Y tế AI"
          aria-label="Mở Trợ lý Y tế AI"
        >
          <span className="absolute -top-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white" />
          </span>
          <Bot className="w-6 h-6 transition-transform group-hover:rotate-6" />
        </Button>
      </div>

      <AIChatDrawer
        open={isOpen}
        onOpenChange={setIsOpen}
        screeningResultId={screeningResultId}
      />
    </>
  );
}
