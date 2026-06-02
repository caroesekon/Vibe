import { useEffect } from 'react';
import { connectSocket, disconnectSocket, getSocket } from '../api/socket';
import useAuthStore from '../store/useAuthStore';
import useChatStore from '../store/useChatStore';
import useNotificationStore from '../store/useNotificationStore';

const useSocket = () => {
  const token = useAuthStore((s) => s.token);

  useEffect(() => {
    if (!token) {
      disconnectSocket();
      return;
    }

    const socket = connectSocket(token);

    socket.on('message:new', (message) => {
      useChatStore.getState().addMessage(message);
    });

    socket.on('notification:new', (notification) => {
      useNotificationStore.getState().addNotification(notification);
    });

    socket.on('typing:start', (data) => {
      const { activeConversation } = useChatStore.getState();
      if (activeConversation?._id === data.conversationId) {
        useChatStore.setState({ typingUser: data.userId });
      }
    });

    socket.on('typing:stop', (data) => {
      useChatStore.setState({ typingUser: null });
    });

    socket.on('message:seen', (data) => {
      const messages = useChatStore.getState().messages.map((m) =>
        m._id === data.messageId ? { ...m, readBy: [...(m.readBy || []), { user: data.userId }] } : m
      );
      useChatStore.setState({ messages });
    });

    socket.on('user:online', (data) => {
      // Handle online status
    });

    socket.on('user:offline', (data) => {
      // Handle offline status
    });

    return () => {
      disconnectSocket();
    };
  }, [token]);

  const emitTyping = (conversationId, isTyping) => {
    const socket = getSocket();
    if (socket) {
      socket.emit(isTyping ? 'typing:start' : 'typing:stop', { conversationId });
    }
  };

  return { emitTyping };
};

export default useSocket;