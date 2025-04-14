export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatar: string;
  bio: string;
  role: 'user' | 'business';
  verified: boolean;
}