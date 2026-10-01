/**
 * Định nghĩa Type-Safe cho Trợ lý Y tế AI Chatbot RAG (Sprint 16: FR-20 -> FR-22).
 * Đồng bộ với Schemas Pydantic v2 ở Backend FastAPI.
 */

export type MessageSenderRole = "user" | "assistant" | "system";

export interface AIChatMessageItem {
  id: string;
  session_id: string;
  sender_role: MessageSenderRole;
  content: string;
  is_emergency_flag: boolean;
  tokens_used: number;
  created_at: string;
}

export interface AIChatSessionListItem {
  id: string;
  title: string;
  screening_result_id?: string | null;
  is_archived: boolean;
  message_count: number;
  last_message?: string | null;
  created_at: string;
  updated_at: string;
}

export interface AIChatSessionResponse {
  id: string;
  user_id: string;
  screening_result_id?: string | null;
  title: string;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  messages: AIChatMessageItem[];
}

export interface AIChatSessionCreate {
  screening_result_id?: string | null;
  title?: string;
}

export interface AIChatSendMessageRequest {
  content: string;
}

export interface AIChatSendMessageResponse {
  session_id: string;
  user_message: AIChatMessageItem;
  assistant_message: AIChatMessageItem;
  is_emergency: boolean;
  emergency_alert?: string | null;
  cited_sources: string[];
}
