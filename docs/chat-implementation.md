# LOOKYM - Implementación del Chat

Este documento describe el sistema de chat utilizado en la aplicación LOOKYM.

## Arquitectura del Chat

LOOKYM utiliza Supabase para el almacenamiento de mensajes y Supabase Realtime para la entrega de mensajes en tiempo real. El sistema ha sido optimizado para proporcionar una experiencia de chat fluida y eficiente.

### Características Principales

- Entrega instantánea de mensajes con Supabase Realtime
- Sistema de notificaciones push para mensajes nuevos
- Indicadores de estado de lectura y escritura
- Soporte para mensajes multimedia
- Historial de chat con paginación eficiente

## Chat Data Structure

```typescript
interface Chat {
  id: string;
  participants: {
    id: string;
    username: string;
    avatar: string;
    role: 'user' | 'business';
    verified: boolean;
  }[];
  messages: Message[];
  lastMessage: Message;
  unreadCount: number;
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  read: boolean;
}
```

## Chat Database Schema

The chat system uses the following tables in Supabase:

```sql
-- Chats table
CREATE TABLE chats (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chat participants table
CREATE TABLE chat_participants (
  chat_id UUID REFERENCES chats(id) NOT NULL,
  user_id UUID REFERENCES users(id) NOT NULL,
  PRIMARY KEY (chat_id, user_id)
);

-- Messages table
CREATE TABLE messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  chat_id UUID REFERENCES chats(id) NOT NULL,
  sender_id UUID REFERENCES users(id) NOT NULL,
  text TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Chat Store

The chat state is managed through the `useChatStore` Zustand store:

```typescript
interface ChatState {
  chats: Chat[];
  loadChats: () => Promise<void>;
  getChat: (chatId: string) => Chat | undefined;
  sendMessage: (chatId: string, text: string) => void;
  createChat: (participantId: string, initialMessage: string) => string;
  markChatAsRead: (chatId: string) => void;
}
```

## Chat Components

### ChatList

Displays a list of chat conversations:

```tsx
<FlatList
  data={chats}
  keyExtractor={(item) => item.id}
  renderItem={({ item }) => (
    <ChatItem
      chat={item}
      currentUserId={currentUser.id}
      onPress={() => navigateToChat(item.id)}
    />
  )}
/>
```

### ChatItem

Displays a preview of a chat conversation:

```tsx
function ChatItem({ chat, currentUserId, onPress }) {
  const otherUser = chat.participants.find(p => p.id !== currentUserId);
  
  return (
    <TouchableOpacity onPress={onPress}>
      <View style={styles.container}>
        <Image source={{ uri: otherUser.avatar }} style={styles.avatar} />
        <View style={styles.content}>
          <Text style={styles.username}>{otherUser.username}</Text>
          <Text style={styles.message} numberOfLines={1}>
            {chat.lastMessage.text}
          </Text>
        </View>
        <View style={styles.meta}>
          <Text style={styles.time}>
            {formatTimeAgo(chat.lastMessage.timestamp)}
          </Text>
          {chat.unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{chat.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}
```

### ChatScreen

The main chat conversation screen:

```tsx
function ChatScreen() {
  const { id } = useLocalSearchParams();
  const { getChat, sendMessage, markChatAsRead } = useChatStore();
  const { currentUser } = useAuthStore();
  const [message, setMessage] = useState('');
  
  const chat = getChat(id as string);
  
  useEffect(() => {
    if (chat) {
      markChatAsRead(chat.id);
    }
  }, [chat]);
  
  const handleSend = () => {
    if (message.trim() && chat) {
      sendMessage(chat.id, message);
      setMessage('');
    }
  };
  
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={chat?.messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <MessageBubble
            message={item}
            isOwnMessage={item.senderId === currentUser?.id}
          />
        )}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={message}
          onChangeText={setMessage}
          placeholder="Type a message..."
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
          <Text style={styles.sendButtonText}>Send</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
```

### MessageBubble

Displays an individual message:

```tsx
function MessageBubble({ message, isOwnMessage }) {
  return (
    <View style={[
      styles.bubble,
      isOwnMessage ? styles.ownBubble : styles.otherBubble
    ]}>
      <Text style={[
        styles.text,
        isOwnMessage ? styles.ownText : styles.otherText
      ]}>
        {message.text}
      </Text>
      <Text style={styles.time}>
        {formatTime(message.timestamp)}
      </Text>
    </View>
  );
}
```

## Chat Functions

### Loading Chats

```typescript
loadChats: async () => {
  try {
    const currentUser = useAuthStore.getState().currentUser;
    if (!currentUser) return;
    
    // In a real app with Supabase
    const { data, error } = await supabase
      .from('chats')
      .select(`
        id,
        chat_participants!inner(user_id),
        messages(
          id,
          sender_id,
          text,
          read,
          created_at
        ),
        users:chat_participants!inner(
          users(
            id,
            username,
            avatar_url,
            role,
            verified
          )
        )
      `)
      .eq('chat_participants.user_id', currentUser.id)
      .order('created_at', { foreignTable: 'messages', ascending: false });
      
    if (error) throw error;
    
    // Format the chats for our app
    const formattedChats: Chat[] = data.map(chat => {
      const messages = chat.messages.map(msg => ({
        id: msg.id,
        senderId: msg.sender_id,
        text: msg.text,
        timestamp: new Date(msg.created_at).getTime(),
        read: msg.read,
      }));
      
      const participants = chat.users.map(user => ({
        id: user.users.id,
        username: user.users.username,
        avatar: user.users.avatar_url,
        role: user.users.role,
        verified: user.users.verified,
      }));
      
      const lastMessage = messages[0];
      const unreadCount = messages.filter(
        msg => !msg.read && msg.senderId !== currentUser.id
      ).length;
      
      return {
        id: chat.id,
        participants,
        messages,
        lastMessage,
        unreadCount,
      };
    });
    
    set({ chats: formattedChats });
  } catch (error) {
    console.error('Load chats error:', error);
  }
}
```

### Sending a Message

```typescript
sendMessage: async (chatId: string, text: string) => {
  try {
    const currentUser = useAuthStore.getState().currentUser;
    if (!currentUser) return;
    
    // In a real app with Supabase
    const { data, error } = await supabase
      .from('messages')
      .insert([
        {
          chat_id: chatId,
          sender_id: currentUser.id,
          text,
        }
      ])
      .select();
      
    if (error) throw error;
    
    const newMessage: Message = {
      id: data[0].id,
      senderId: currentUser.id,
      text,
      timestamp: new Date(data[0].created_at).getTime(),
      read: false,
    };
    
    // Update local state
    set((state) => ({
      chats: state.chats.map(chat => {
        if (chat.id === chatId) {
          return {
            ...chat,
            messages: [newMessage, ...chat.messages],
            lastMessage: newMessage,
          };
        }
        return chat;
      })
    }));
  } catch (error) {
    console.error('Send message error:', error);
  }
}
```

### Creating a New Chat

```typescript
createChat: async (participantId: string, initialMessage: string) => {
  try {
    const currentUser = useAuthStore.getState().currentUser;
    if (!currentUser) return '';
    
    // Check if chat already exists
    const existingChat = get().chats.find(chat => 
      chat.participants.some(p => p.id === participantId)
    );
    
    if (existingChat) {
      get().sendMessage(existingChat.id, initialMessage);
      return existingChat.id;
    }
    
    // In a real app with Supabase
    // 1. Create a new chat
    const { data: chatData, error: chatError } = await supabase
      .from('chats')
      .insert([{}])
      .select();
      
    if (chatError) throw chatError;
    
    const chatId = chatData[0].id;
    
    // 2. Add participants
    const { error: participantsError } = await supabase
      .from('chat_participants')
      .insert([
        { chat_id: chatId, user_id: currentUser.id },
        { chat_id: chatId, user_id: participantId }
      ]);
      
    if (participantsError) throw participantsError;
    
    // 3. Send initial message
    const { data: messageData, error: messageError } = await supabase
      .from('messages')
      .insert([
        {
          chat_id: chatId,
          sender_id: currentUser.id,
          text: initialMessage,
        }
      ])
      .select();
      
    if (messageError) throw messageError;
    
    // 4. Get participant info
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, username, avatar_url, role, verified')
      .eq('id', participantId)
      .single();
      
    if (userError) throw userError;
    
    // 5. Create chat object
    const newMessage: Message = {
      id: messageData[0].id,
      senderId: currentUser.id,
      text: initialMessage,
      timestamp: new Date(messageData[0].created_at).getTime(),
      read: false,
    };
    
    const newChat: Chat = {
      id: chatId,
      participants: [
        {
          id: currentUser.id,
          username: currentUser.username,
          avatar: currentUser.avatar || '',
          role: currentUser.role,
          verified: currentUser.verified,
        },
        {
          id: userData.id,
          username: userData.username,
          avatar: userData.avatar_url,
          role: userData.role,
          verified: userData.verified,
        }
      ],
      messages: [newMessage],
      lastMessage: newMessage,
      unreadCount: 0,
    };
    
    // 6. Update local state
    set((state) => ({
      chats: [newChat, ...state.chats]
    }));
    
    return chatId;
  } catch (error) {
    console.error('Create chat error:', error);
    return '';
  }
}
```

## Real-time Updates

The application uses Supabase Realtime for real-time chat updates:

```typescript
useEffect(() => {
  const currentUser = useAuthStore.getState().currentUser;
  if (!currentUser) return;
  
  // Subscribe to new messages
  const subscription = supabase
    .channel('messages')
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`,
      },
      (payload) => {
        // Only process messages from other users
        if (payload.new.sender_id !== currentUser.id) {
          const newMessage: Message = {
            id: payload.new.id,
            senderId: payload.new.sender_id,
            text: payload.new.text,
            timestamp: new Date(payload.new.created_at).getTime(),
            read: false,
          };
          
          // Update local state
          set((state) => ({
            chats: state.chats.map(chat => {
              if (chat.id === payload.new.chat_id) {
                return {
                  ...chat,
                  messages: [newMessage, ...chat.messages],
                  lastMessage: newMessage,
                  unreadCount: chat.unreadCount + 1,
                };
              }
              return chat;
            })
          }));
        }
      }
    )
    .subscribe();
  
  return () => {
    supabase.removeChannel(subscription);
  };
}, []);
```

## Performance Considerations

- Messages are paginated
- Real-time updates are optimized
- Unread counts are maintained locally
- Chat list is sorted by most recent message
- Message read status is updated in real-time
