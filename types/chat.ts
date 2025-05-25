import { User } from './user.ts';

export interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  read: boolean;
}

export interface Chat {
  id: string;
  participants: User[];
  messages: Message[];
  lastMessage: Message;
  unreadCount: number;
}