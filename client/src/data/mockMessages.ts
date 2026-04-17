export interface ChatMessage {
  id: number;
  fromMe: boolean;
  time: string;
  translations: Record<string, string>;
}

export interface ChatThread {
  id: number;
  company: string;
  logo: string;
  logoBg: string;
  lastMessage: string;
  lastTime: string;
  unread: number;
  messages: ChatMessage[];
}

export const mockChats: ChatThread[] = [];
