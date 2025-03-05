
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string | any[];
  id?: string;
  timestamp?: string | Date;
  reactions?: {
    likes: number;
    dislikes: number;
  };
  isPinned?: boolean;
  metadata?: {
    sentiment?: 'positive' | 'negative' | 'neutral';
    keywords?: string[];
    relevanceScore?: number;
  };
}

export interface ThreadData {
  id: string;
  createdAt: string | Date;
  messages: Message[];
  metadata?: {
    name?: string;
    summary?: string;
    tags?: string[];
  };
}
