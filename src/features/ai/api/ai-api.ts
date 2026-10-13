import axiosInstance from '@/api/axiosInstance';

export interface AiChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export interface SendAiChatPayload {
  message: string;
  conversationId?: string;
}

export interface AiChatResponse {
  reply: string;
  conversationId: string;
  success?: boolean;
}

/**
 * Send a chat message to the AI Health & Wellness Assistant.
 * POST /api/ai/chat
 * 
 * Rules:
 * - Omits conversationId on the first message of a session.
 * - Stores and reuses conversationId returned by the backend on subsequent messages.
 * - Allowed roles on backend: donor and hospital.
 */
export const sendAiChatMessage = async (
  message: string,
  conversationId?: string
): Promise<AiChatResponse> => {
  const payload: SendAiChatPayload = { message: message.trim() };
  if (conversationId && conversationId.trim()) {
    payload.conversationId = conversationId.trim();
  }

  const res = await axiosInstance.post<{
    reply?: string;
    message?: string;
    text?: string;
    conversationId?: string;
    data?: { reply?: string; message?: string; conversationId?: string };
    success?: boolean;
  }>('/api/ai/chat', payload);

  const data = res.data;
  const reply =
    data?.reply ||
    data?.message ||
    data?.text ||
    data?.data?.reply ||
    data?.data?.message ||
    'I received your message. How else can I assist with general health or donor wellness questions?';

  const returnedConversationId =
    data?.conversationId ||
    data?.data?.conversationId ||
    conversationId ||
    `conv_${Date.now()}`;

  return {
    reply,
    conversationId: returnedConversationId,
    success: true,
  };
};
