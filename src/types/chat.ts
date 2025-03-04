
export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string | any[];
  id?: string;
  timestamp?: string | Date;
}
