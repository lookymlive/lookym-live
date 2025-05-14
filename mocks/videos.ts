import { Video } from '@/types/video.ts';

export const videos: Video[] = [
  {
    id: '1',
    user: {
      id: 'user1',
      username: 'zoenahir15',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80',
      verified: true,
      role: 'business'
    },
    videoUrl: 'https://www.tiktok.com/@paulomajul/video/7488322895718993157?is_from_webapp=1&sender_device=pc&web_id=7484276184025630263',
    thumbnailUrl: 'https://images.unsplash.com/photo-1743511982501-ea0e4b26d209?fm=jpg&q=60&w=3000&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    caption: 'Our new summer collection is here! #fashion #summer #newcollection',
    hashtags: ['fashion', 'summer', 'newcollection'],
    likes: 1245,
    comments: [
      {
        id: 'comment1',
        user: {
          id: 'user2',
          username: 'fashionlover',
          avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80',
          verified: false,
          role: 'user'
        },
        text: 'Love this collection! When will it be available in stores?',
        timestamp: Date.now() - 3600000, // 1 hour ago
        likes: 24
      },
      {
        id: 'comment2',
        user: {
          id: 'user3',
          username: 'styleicon',
          avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80',
          verified: true,
          role: 'business'
        },
        text: 'The yellow jacket is amazing! 💛',
        timestamp: Date.now() - 7200000, // 2 hours ago
        likes: 56
      }
    ],
    timestamp: Date.now() - 86400000 // 1 day ago
  },
  {
    id: '2',
    user: {
      id: 'user4',
      username: 'traveladventures',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80',
      verified: false,
      role: 'business'
    },
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-a-road-in-the-middle-of-a-mountain-range-41537-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=821&q=80',
    caption: 'Exploring the beautiful mountains of Switzerland! The views are breathtaking. #travel #mountains #switzerland',
    hashtags: ['travel', 'mountains', 'switzerland'],
    likes: 3782,
    comments: [
      {
        id: 'comment3',
        user: {
          id: 'user5',
          username: 'wanderlust',
          avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80',
          verified: false,
          role: 'user'
        },
        text: 'This is now on my bucket list! Which part of Switzerland is this?',
        timestamp: Date.now() - 5400000, // 1.5 hours ago
        likes: 42
      }
    ],
    timestamp: Date.now() - 172800000 // 2 days ago
  },
  {
    id: '3',
    user: {
      id: 'user6',
      username: 'foodieheaven',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=870&q=80',
      verified: true,
      role: 'business'
    },
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-making-a-strawberry-dessert-7210-large.mp4',
    thumbnailUrl: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=765&q=80',
    caption: 'Delicious strawberry dessert recipe! Perfect for summer evenings. #food #dessert #recipe',
    hashtags: ['food', 'dessert', 'recipe'],
    likes: 5621,
    comments: [
      {
        id: 'comment4',
        user: {
          id: 'user7',
          username: 'sweetooth',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=464&q=80',
          verified: false,
          role: 'user'
        },
        text: 'This looks amazing! Can you share the full recipe?',
        timestamp: Date.now() - 10800000, // 3 hours ago
        likes: 89
      },
      {
        id: 'comment5',
        user: {
          id: 'user8',
          username: 'bakingpro',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=387&q=80',
          verified: true,
          role: 'business'
        },
        text: 'I love the presentation! What kind of cream did you use?',
        timestamp: Date.now() - 14400000, // 4 hours ago
        likes: 32
      },
      {
        id: 'comment6',
        user: {
          id: 'user9',
          username: 'healthyeats',
          avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=388&q=80',
          verified: false,
          role: 'user'
        },
        text: 'Is there a way to make this with less sugar?',
        timestamp: Date.now() - 18000000, // 5 hours ago
        likes: 17
      }
    ],
    timestamp: Date.now() - 259200000 // 3 days ago
  }
];