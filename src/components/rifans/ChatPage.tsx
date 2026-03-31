import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, ArrowRight, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

interface ChatPageProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId?: string; // For admin: specific client to chat with
  targetUserName?: string;
}

interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

const ADMIN_ID = 'admin';

const ChatPage: React.FC<ChatPageProps> = ({ isOpen, onClose, targetUserId, targetUserName }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [chatUsers, setChatUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(targetUserId || null);
  const [selectedUserName, setSelectedUserName] = useState(targetUserName || '');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isAdmin = user?.role === 'admin';
  const currentUserId = user?.id?.toString() || '';

  // Fetch chat users list (for admin)
  const fetchChatUsers = useCallback(async () => {
    if (!isAdmin) return;
    const { data } = await supabase
      .from('chat_messages')
      .select('sender_id, receiver_id')
      .or(`sender_id.eq.${ADMIN_ID},receiver_id.eq.${ADMIN_ID}`);
    
    if (data) {
      const userIds = new Set<string>();
      data.forEach((m: any) => {
        if (m.sender_id !== ADMIN_ID) userIds.add(m.sender_id);
        if (m.receiver_id !== ADMIN_ID) userIds.add(m.receiver_id);
      });
      
      if (userIds.size > 0) {
        const { data: usersData } = await supabase
          .from('app_users')
          .select('id, full_name, phone')
          .in('id', Array.from(userIds));
        setChatUsers(usersData || []);
      }
    }
  }, [isAdmin]);

  // Fetch messages
  const fetchMessages = useCallback(async () => {
    if (!currentUserId) return;
    setIsLoading(true);

    let query;
    if (isAdmin && selectedUser) {
      query = supabase
        .from('chat_messages')
        .select('*')
        .or(`and(sender_id.eq.${ADMIN_ID},receiver_id.eq.${selectedUser}),and(sender_id.eq.${selectedUser},receiver_id.eq.${ADMIN_ID})`)
        .order('created_at', { ascending: true });
    } else if (!isAdmin) {
      query = supabase
        .from('chat_messages')
        .select('*')
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${ADMIN_ID}),and(sender_id.eq.${ADMIN_ID},receiver_id.eq.${currentUserId})`)
        .order('created_at', { ascending: true });
    } else {
      setIsLoading(false);
      return;
    }

    const { data } = await query;
    setMessages((data as ChatMessage[]) || []);
    setIsLoading(false);

    // Mark received messages as read
    const receiverId = isAdmin ? ADMIN_ID : currentUserId;
    if (data && data.length > 0) {
      const unread = data.filter((m: any) => m.receiver_id === receiverId && !m.is_read);
      if (unread.length > 0) {
        await supabase
          .from('chat_messages')
          .update({ is_read: true })
          .in('id', unread.map((m: any) => m.id));
      }
    }
  }, [currentUserId, isAdmin, selectedUser]);

  useEffect(() => {
    if (isOpen) {
      fetchMessages();
      if (isAdmin) fetchChatUsers();
    }
  }, [isOpen, fetchMessages, fetchChatUsers]);

  useEffect(() => {
    if (targetUserId) {
      setSelectedUser(targetUserId);
      setSelectedUserName(targetUserName || '');
    }
  }, [targetUserId, targetUserName]);

  // Realtime subscription
  useEffect(() => {
    if (!isOpen) return;
    const channel = supabase
      .channel('chat-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
        const msg = payload.new as ChatMessage;
        const relevant = isAdmin
          ? (selectedUser && ((msg.sender_id === selectedUser && msg.receiver_id === ADMIN_ID) || (msg.sender_id === ADMIN_ID && msg.receiver_id === selectedUser)))
          : ((msg.sender_id === currentUserId && msg.receiver_id === ADMIN_ID) || (msg.sender_id === ADMIN_ID && msg.receiver_id === currentUserId));
        
        if (relevant) {
          setMessages(prev => [...prev, msg]);
          // Mark as read if we're the receiver
          const receiverId = isAdmin ? ADMIN_ID : currentUserId;
          if (msg.receiver_id === receiverId) {
            supabase.from('chat_messages').update({ is_read: true }).eq('id', msg.id).then(() => {});
          }
        }
        if (isAdmin) fetchChatUsers();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [isOpen, isAdmin, selectedUser, currentUserId, fetchChatUsers]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    const senderId = isAdmin ? ADMIN_ID : currentUserId;
    const receiverId = isAdmin ? (selectedUser || '') : ADMIN_ID;
    
    if (!receiverId) return;

    await supabase.from('chat_messages').insert({
      sender_id: senderId,
      receiver_id: receiverId,
      message: newMessage.trim(),
    });

    setNewMessage('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const getUnreadCount = (userId: string) => {
    return messages.filter(m => m.sender_id === userId && m.receiver_id === ADMIN_ID && !m.is_read).length;
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 30 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-md h-[85vh] max-h-[650px] bg-white dark:bg-[#12031a] rounded-[24px] shadow-2xl flex flex-col overflow-hidden border border-gold/20 mx-4"
          dir="rtl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-brand text-white p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              {isAdmin && selectedUser && (
                <button onClick={() => { setSelectedUser(null); setSelectedUserName(''); }} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                  <ArrowRight size={16} />
                </button>
              )}
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                <MessageCircle size={18} className="text-gold" />
              </div>
              <div>
                <h3 className="text-sm font-bold">
                  {isAdmin ? (selectedUser ? selectedUserName || 'محادثة العميل' : 'المحادثات') : 'المحادثة الفورية'}
                </h3>
                <p className="text-[10px] text-gold/80">
                  {isAdmin ? (selectedUser ? 'محادثة مباشرة' : 'قائمة محادثات العملاء') : 'تواصل مع فريق الدعم'}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Admin: User List or Chat */}
          {isAdmin && !selectedUser ? (
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {chatUsers.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-center p-8">
                  <div>
                    <MessageCircle size={40} className="text-muted mx-auto mb-3 opacity-30" />
                    <p className="text-sm text-muted">لا توجد محادثات بعد</p>
                  </div>
                </div>
              ) : (
                chatUsers.map(u => (
                  <button
                    key={u.id}
                    onClick={() => { setSelectedUser(u.id); setSelectedUserName(u.full_name || u.phone || 'عميل'); }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 hover:border-gold/30 transition-all text-right"
                  >
                    <div className="w-10 h-10 rounded-full bg-brand text-gold flex items-center justify-center font-bold text-sm shrink-0">
                      {(u.full_name || '؟')[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-brand dark:text-white truncate">{u.full_name || u.phone}</p>
                      <p className="text-[10px] text-muted">{u.phone}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          ) : (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {isLoading ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="w-6 h-6 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-center">
                    <div>
                      <MessageCircle size={40} className="text-muted mx-auto mb-3 opacity-30" />
                      <p className="text-sm text-muted">لا توجد رسائل بعد</p>
                      <p className="text-[10px] text-muted mt-1">ابدأ المحادثة الآن</p>
                    </div>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMine = isAdmin ? msg.sender_id === ADMIN_ID : msg.sender_id === currentUserId;
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isMine ? 'justify-start' : 'justify-end'}`}
                      >
                        <div className={`max-w-[85%] px-3 py-1.5 rounded-xl text-[13px] leading-snug ${
                          isMine 
                            ? 'bg-brand text-white rounded-br-sm' 
                            : 'bg-gray-100 dark:bg-white/10 text-brand dark:text-white rounded-bl-sm'
                        }`}>
                          <p>{msg.message}</p>
                          <p className={`text-[9px] mt-1 ${isMine ? 'text-white/50' : 'text-muted'}`}>
                            {new Date(msg.created_at).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-gray-100 dark:border-white/10 bg-white dark:bg-[#12031a] shrink-0">
                <div className="flex items-center gap-2">
                  <input
                    ref={inputRef}
                    type="text"
                    value={newMessage}
                    onChange={e => setNewMessage(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="اكتب رسالتك..."
                    className="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gold transition-colors dark:text-white"
                  />
                  <button
                    onClick={sendMessage}
                    disabled={!newMessage.trim()}
                    className="w-10 h-10 rounded-xl bg-brand text-gold flex items-center justify-center hover:bg-brand/90 transition-colors disabled:opacity-40 shrink-0"
                  >
                    <Send size={18} />
                  </button>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ChatPage;
