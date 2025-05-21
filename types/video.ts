import { Comment } from "./comment"; // Assuming Comment is in comment.ts
import { ProductTag, StoreProduct } from "./product"; // Import product types
import { User } from "./user"; // Assuming User is in user.ts

export interface User {
  id: string;
  username: string;
  avatar: string;
  verified: boolean;
  role: "user" | "business";
}

export interface Comment {
  id: string;
  user: User;
  text: string;
  timestamp: number;
  likes: number;
}

export interface Video {
  id: string;
  user: User;
  videoUrl: string;
  thumbnailUrl: string;
  caption: string;
  hashtags: string[];
  likes: number;
  comments: Comment[];
  timestamp: number;
  mimeType?: string;
  products?: StoreProduct[]; // Optional products associated with the video
  tags?: ProductTag[]; // Optional product tags associated with the video
}
