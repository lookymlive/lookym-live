import { Post } from "@/types/post.ts";

export const posts: Post[] = [
  {
    id: "1",
    user: {
      id: "user1",
      username: "johndoe",
      displayName: "John Doe",
      avatar:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80",
      verified: true,
    },
    caption: "Beautiful sunset at the beach today! 🌅 #sunset #beach #summer",
    location: "Malibu Beach",
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      },
    ],
    likes: 1243,
    comments: [],
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    saved: false,
  },
  {
    id: "2",
    user: {
      id: "user2",
      username: "janedoe",
      displayName: "Jane Doe",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80",
      verified: false,
    },
    caption:
      "Just finished this painting! What do you think? 🎨 #art #painting #creative",
    location: "Art Studio",
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      },
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      },
    ],
    likes: 892,
    comments: [],
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    saved: true,
  },
  {
    id: "3",
    user: {
      id: "user3",
      username: "foodlover",
      displayName: "Food Lover",
      avatar:
        "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80",
      verified: true,
    },
    caption:
      "Made this delicious pasta dish tonight! Recipe in comments 🍝 #food #pasta #homemade",
    location: "Home Kitchen",
    media: [
      {
        type: "image",
        url: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      },
    ],
    likes: 2156,
    comments: [],
    timestamp: new Date(Date.now() - 172800000).toISOString(),
    saved: false,
  },
  {
    id: "4",
    user: {
      id: "user4",
      username: "travelbug",
      displayName: "Travel Bug",
      avatar:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=crop&w=150&q=80",
      verified: false,
    },
    caption:
      "Exploring the streets of Tokyo! Such an amazing city 🗼 #travel #tokyo #japan",
    location: "Tokyo, Japan",
    media: [
      {
        type: "video",
        url: "https://assets.mixkit.co/videos/preview/mixkit-a-girl-blowing-a-bubble-gum-at-an-amusement-park-1226-large.mp4",
        thumbnail:
          "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
      },
    ],
    likes: 3421,
    comments: [],
    timestamp: new Date(Date.now() - 259200000).toISOString(),
    saved: false,
  },
];
