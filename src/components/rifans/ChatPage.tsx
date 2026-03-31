import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Send, ArrowRight, MessageCircle, Paperclip, Image, FileText, Mic, Square, Play, Pause, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '../../contexts/AuthContext';
import { motion, AnimatePresence } from 'motion/react';

interface ChatPageProps {
  isOpen: boolean;
  onClose: () => void;
  targetUserId?: string;
  targetUserName?: string;
}

interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  is_read: boolean;
  created_at: string;
  attachment_url?: string | null;
  attachment_type?: string | null;
}

const ADMIN_ID = 'admin';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

// ---------- Attachment Bubble ----------
const AttachmentBubble: React.FC<{ url: string; type: string; isMine: boolean }> = ({ url, type, isMine }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const fullUrl = url.startsWith('http') ? url : `${SUPABASE_URL}/storage/v1/object/public/uploads/${url}`;

  if (type === 'image') {
    return (
      <a href={fullUrl} target="_blank" rel="noopener noreferrer" className="block">
        <img src={fullUrl} alt="مرفق" className="max-w-[200px] max-h-[200px] rounded-lg object-cover" loading="lazy" />
      </a>
    );
  }

  if (type === 'pdf') {
    const fileName = url.split('/').pop() || 'ملف PDF';
    return (
      <a href={fullUrl} target="_blank" rel="noopener noreferrer"
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${isMine ? 'border-white/20 text-white' : 'border-gray-200 dark:border-white/20 text-brand dark:text-white'}`}>
        <FileText size={20} className="shrink-0" />
        <span className="text-xs truncate max-w-[140px]">{fileName}</span>
        <Download size={14} className="shrink-0 opacity-60" />
      </a>
    );
  }

  if (type === 'voice') {
    const togglePlay = () => {
      if (!audioRef.current) {
        audioRef.current = new Audio(fullUrl);
        audioRef.current.onended = () => setIsPlaying(false);
      }
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    };
    return (
      <button onClick={togglePlay} className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isMine ? 'text-white' : 'text-brand dark:text-white'}`}>
        {isPlaying ? <Pause size={18} /> : <Play size={18} />}
        <span className="text-xs">ملاحظة صوتية</span>
        <span className="flex gap-0.5">
          {[...Array(5)].map((_, i) => <span key={i} className={`w-1 rounded-full ${isMine ? 'bg-white/40' : 'bg-brand/30 dark:bg-white/30'}`} style={{ height: `${8 + Math.random() * 10}px` }} />)}
        </span>
      </button>
    );
  }

  return null;
};

// ---------- Voice Recorder ----------
const VoiceRecorder: React.FC<{ onSend: (blob: Blob) => void; onCancel: () => void }> = ({ onSend, onCancel }) => {
  const [duration, setDuration] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    let stream: MediaStream;
    (async () => {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      recorder.start();
      intervalRef.current = setInterval(() => setDuration(d => d + 1), 1000);
    })();
    return () => {
      clearInterval(intervalRef.current);
      stream?.getTracks().forEach(t => t.stop());
    };
  }, []);

  const stop = () => {
    const recorder = mediaRecorderRef.current;
    if (!recorder) return;
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
      onSend(blob);
    };
    recorder.stop();
    clearInterval(intervalRef.current);
  };

  const fmt = (s: number) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <div className="flex items-center gap-2 w-full">
      <button onClick={onCancel} className="w-8 h-8 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center shrink-0">
        <X size={16} />
      </button>
      <div className="flex-1 flex items-center gap-2 bg-red-50 dark:bg-red-500/10 rounded-xl px-3 py-2">
        <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
        <span className="text-xs text-red-600 dark:text-red-400 font-mono">{fmt(duration)}</span>
        <span className="text-xs text-red-500">جاري التسجيل...</span>
      </div>
      <button onClick={stop} className="w-10 h-10 rounded-xl bg-brand text-gold flex items-center justify-center shrink-0">
        <Send size={18} />
      </button>
    </div>
  );
};

// ---------- Main ChatPage ----------
const ChatPage: React.FC<ChatPageProps> = ({ isOpen, onClose, targetUserId, targetUserName }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [chatUsers, setChatUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(targetUserId || null);
  const [selectedUserName, setSelectedUserName] = useState(targetUserName || '');
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const isAdmin = user?.role === 'admin';
  const currentUserId = user?.id?.toString() || '';

  // Upload file to storage
  const uploadFile = useCallback(async (file: Blob, ext: string): Promise<string | null> => {
    const fileName = `chat/${Date.now()}-${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from('uploads').upload(fileName, file);
    if (error) { console.error('Upload error:', error); return null; }
    return fileName;
  }, []);

  // Send message with optional attachment
  const sendWithAttachment = useCallback(async (message: string, attachmentUrl?: string, attachmentType?: string) => {
    const senderId = isAdmin ? ADMIN_ID : currentUserId;
    const receiverId = isAdmin ? (selectedUser || '') : ADMIN_ID;
    if (!receiverId) return;

    const payload: any = { sender_id: senderId, receiver_id: receiverId, message };
    if (attachmentUrl) { payload.attachment_url = attachmentUrl; payload.attachment_type = attachmentType; }
    await supabase.from('chat_messages').insert(payload);
  }, [isAdmin, currentUserId, selectedUser]);

  // Handle file pick (image or pdf)
  const handleFilePick = useCallback(async (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'pdf') => {
    const file = e.target.files?.[0];
    if (!file) return;
    setShowAttachMenu(false);
    setIsUploading(true);
    const ext = type === 'image' ? (file.name.split('.').pop() || 'jpg') : 'pdf';
    const url = await uploadFile(file, ext);
    if (url) await sendWithAttachment(type === 'image' ? '📷 صورة' : '📄 ملف PDF', url, type);
    setIsUploading(false);
    e.target.value = '';
  }, [uploadFile, sendWithAttachment]);

  // Handle voice recording done
  const handleVoiceSend = useCallback(async (blob: Blob) => {
    setIsRecording(false);
    setIsUploading(true);
    const url = await uploadFile(blob, 'webm');
    if (url) await sendWithAttachment('🎤 ملاحظة صوتية', url, 'voice');
    setIsUploading(false);
  }, [uploadFile, sendWithAttachment]);

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
        const { data: usersData } = await supabase.from('app_users').select('id, full_name, phone').in('id', Array.from(userIds));
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
      query = supabase.from('chat_messages').select('*')
        .or(`and(sender_id.eq.${ADMIN_ID},receiver_id.eq.${selectedUser}),and(sender_id.eq.${selectedUser},receiver_id.eq.${ADMIN_ID})`)
        .order('created_at', { ascending: true });
    } else if (!isAdmin) {
      query = supabase.from('chat_messages').select('*')
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${ADMIN_ID}),and(sender_id.eq.${ADMIN_ID},receiver_id.eq.${currentUserId})`)
        .order('created_at', { ascending: true });
    } else { setIsLoading(false); return; }

    const { data } = await query;
    setMessages((data as ChatMessage[]) || []);
    setIsLoading(false);

    const receiverId = isAdmin ? ADMIN_ID : currentUserId;
    if (data && data.length > 0) {
      const unread = data.filter((m: any) => m.receiver_id === receiverId && !m.is_read);
      if (unread.length > 0) {
        await supabase.from('chat_messages').update({ is_read: true }).in('id', unread.map((m: any) => m.id));
      }
    }
  }, [currentUserId, isAdmin, selectedUser]);

  useEffect(() => { if (isOpen) { fetchMessages(); if (isAdmin) fetchChatUsers(); } }, [isOpen, fetchMessages, fetchChatUsers]);
  useEffect(() => { if (targetUserId) { setSelectedUser(targetUserId); setSelectedUserName(targetUserName || ''); } }, [targetUserId, targetUserName]);

  // Realtime
  useEffect(() => {
    if (!isOpen) return;
    const channel = supabase.channel('chat-realtime')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
        const msg = payload.new as ChatMessage;
        const relevant = isAdmin
          ? (selectedUser && ((msg.sender_id === selectedUser && msg.receiver_id === ADMIN_ID) || (msg.sender_id === ADMIN_ID && msg.receiver_id === selectedUser)))
          : ((msg.sender_id === currentUserId && msg.receiver_id === ADMIN_ID) || (msg.sender_id === ADMIN_ID && msg.receiver_id === currentUserId));
        if (relevant) {
          setMessages(prev => [...prev, msg]);
          const receiverId = isAdmin ? ADMIN_ID : currentUserId;
          if (msg.receiver_id === receiverId) supabase.from('chat_messages').update({ is_read: true }).eq('id', msg.id).then(() => {});
        }
        if (isAdmin) fetchChatUsers();
      }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [isOpen, isAdmin, selectedUser, currentUserId, fetchChatUsers]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    await sendWithAttachment(newMessage.trim());
    setNewMessage('');
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 30 }} animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 30 }} transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-md h-[85vh] max-h-[650px] bg-white dark:bg-[#12031a] rounded-[24px] shadow-2xl flex flex-col overflow-hidden border border-gold/20 mx-4"
          dir="rtl" onClick={e => e.stopPropagation()}>

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
                  <button key={u.id}
                    onClick={() => { setSelectedUser(u.id); setSelectedUserName(u.full_name || u.phone || 'عميل'); }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 hover:border-gold/30 transition-all text-right">
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
                      <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isMine ? 'justify-start' : 'justify-end'}`}>
                        <div className={`max-w-[85%] px-3 py-1.5 rounded-xl text-[13px] leading-snug ${
                          isMine ? 'bg-brand text-white rounded-br-sm' : 'bg-gray-100 dark:bg-white/10 text-brand dark:text-white rounded-bl-sm'
                        }`}>
                          {msg.attachment_url && msg.attachment_type && (
                            <div className="mb-1">
                              <AttachmentBubble url={msg.attachment_url} type={msg.attachment_type} isMine={isMine} />
                            </div>
                          )}
                          {(!msg.attachment_url || msg.message !== '📷 صورة' && msg.message !== '📄 ملف PDF' && msg.message !== '🎤 ملاحظة صوتية') && (
                            <p>{msg.message}</p>
                          )}
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
                {/* Upload progress */}
                {isUploading && (
                  <div className="flex items-center gap-2 mb-2 px-2">
                    <div className="w-4 h-4 border-2 border-gold border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs text-muted">جاري رفع المرفق...</span>
                  </div>
                )}

                {isRecording ? (
                  <VoiceRecorder onSend={handleVoiceSend} onCancel={() => setIsRecording(false)} />
                ) : (
                  <div className="flex items-center gap-2">
                    {/* Attach button */}
                    <div className="relative">
                      <button onClick={() => setShowAttachMenu(v => !v)}
                        className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-white/10 transition-colors shrink-0">
                        <Paperclip size={18} className="text-muted" />
                      </button>
                      <AnimatePresence>
                        {showAttachMenu && (
                          <motion.div initial={{ opacity: 0, y: 8, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8, scale: 0.95 }}
                            className="absolute bottom-12 right-0 bg-white dark:bg-[#1a0a2e] rounded-xl shadow-lg border border-gray-100 dark:border-white/10 p-1.5 flex flex-col gap-1 min-w-[140px] z-10">
                            <button onClick={() => imageInputRef.current?.click()}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 text-sm text-brand dark:text-white transition-colors">
                              <Image size={16} className="text-green-500" />
                              <span>صورة</span>
                            </button>
                            <button onClick={() => fileInputRef.current?.click()}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 text-sm text-brand dark:text-white transition-colors">
                              <FileText size={16} className="text-blue-500" />
                              <span>ملف PDF</span>
                            </button>
                            <button onClick={() => { setShowAttachMenu(false); setIsRecording(true); }}
                              className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-white/5 text-sm text-brand dark:text-white transition-colors">
                              <Mic size={16} className="text-red-500" />
                              <span>ملاحظة صوتية</span>
                            </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    <input ref={inputRef} type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyDown={handleKeyDown}
                      placeholder="اكتب رسالتك..."
                      className="flex-1 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-gold transition-colors dark:text-white" />

                    <button onClick={sendMessage} disabled={!newMessage.trim()}
                      className="w-10 h-10 rounded-xl bg-brand text-gold flex items-center justify-center hover:bg-brand/90 transition-colors disabled:opacity-40 shrink-0">
                      <Send size={18} />
                    </button>
                  </div>
                )}

                {/* Hidden file inputs */}
                <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleFilePick(e, 'image')} />
                <input ref={fileInputRef} type="file" accept=".pdf" className="hidden" onChange={e => handleFilePick(e, 'pdf')} />
              </div>
            </>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ChatPage;
