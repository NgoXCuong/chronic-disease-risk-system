import client from "./client";
import {
  AIChatSendMessageRequest,
  AIChatSendMessageResponse,
  AIChatSessionCreate,
  AIChatSessionListItem,
  AIChatSessionResponse,
} from "@/types/chat";

/**
 * Module API Trợ lý Y tế AI Chatbot RAG (Sprint 16: FR-20 -> FR-22).
 */
export const chatApi = {
  /**
   * Tạo phiên hội thoại y tế mới (tùy chọn gắn với screening_result_id)
   */
  async createSession(payload: AIChatSessionCreate = {}): Promise<AIChatSessionResponse> {
    const res = await client.post<AIChatSessionResponse>("/chat/sessions", payload);
    return res.data;
  },

  /**
   * Lấy danh sách các phiên trò chuyện của người dùng hiện tại
   */
  async listSessions(): Promise<AIChatSessionListItem[]> {
    const res = await client.get<AIChatSessionListItem[]>("/chat/sessions");
    return res.data;
  },

  /**
   * Lấy chi tiết phiên kèm toàn bộ lịch sử tin nhắn
   */
  async getSessionDetail(sessionId: string): Promise<AIChatSessionResponse> {
    const res = await client.get<AIChatSessionResponse>(`/chat/sessions/${sessionId}`);
    return res.data;
  },

  /**
   * Gửi tin nhắn câu hỏi tới Trợ lý Y tế AI RAG
   */
  async sendMessage(
    sessionId: string,
    payload: AIChatSendMessageRequest
  ): Promise<AIChatSendMessageResponse> {
    const res = await client.post<AIChatSendMessageResponse>(
      `/chat/sessions/${sessionId}/message`,
      payload
    );
    return res.data;
  },
};
