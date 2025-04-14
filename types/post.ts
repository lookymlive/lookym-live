export interface PostUser {
  id: string;
  username: string;
  displayName: string;
  avatar: string;
  verified: boolean;
}

export interface PostMedia {
  type: "image" | "video";
  url: string;
  thumbnail?: string; // For videos
}

export interface Post {
  id: string;
  user: PostUser;
  caption: string;
  location?: string;
  media: PostMedia[];
  likes: number;
  comments: Comment[];
  timestamp: string;
  saved: boolean;
}

export interface Comment {
  id: string;
  user: PostUser;
  text: string;
  timestamp: string;
  likes: number;
}
