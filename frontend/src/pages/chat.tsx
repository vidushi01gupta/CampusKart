import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Search, ArrowLeft, MoreVertical, Phone, CheckCheck, Check, Smile, MessageCircle } from 'lucide-react';
import { Helmet } from '@dr.pogodin/react-helmet';
import { useSession } from '@/lib/auth/auth-client';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────

type ApiMessage = {
  id: number;
  text: string;
  senderId: number;
  status: 'sent' | 'delivered' | 'read';
  createdAt: string;
  senderName: string | null;
  senderAvatar: string | null;
  senderAvatarBg: string | null;
};

type ApiConversation = {
  id: number;
  buyerId: number;
  sellerId: number;
  listingId: number;
  listingTitle: string | null;
  listingPrice: number | null;
  buyerName: string | null;
  buyerAvatar: string | null;
  buyerAvatarBg: string | null;
  lastMessage: string;
  lastMessageTime: string;
  unread: number;
  online: boolean;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}

function formatMsgTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ChatPage() {
  const { user, isPending } = useSession();

  // We use the first seeded user (id=1) as the demo user when not authenticated
  // In production this would always be the logged-in user
  const [dbUserId, setDbUserId] = useState<number | null>(null);

  const [conversations, setConversations] = useState<ApiConversation[]>([]);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [input, setInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingConvos, setLoadingConvos] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Resolve DB user id from auth email
  useEffect(() => {
    if (isPending) return;
    if (user?.email) {
      fetch(`/api/users/by-email?email=${encodeURIComponent(user.email)}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (data?.id) setDbUserId(data.id);
          else setDbUserId(1); // fallback for demo
        })
        .catch(() => setDbUserId(1));
    } else {
      setDbUserId(1); // demo fallback
    }
  }, [user, isPending]);

  // Load conversations
  const loadConversations = useCallback(async (uid: number) => {
    try {
      const res = await fetch(`/api/conversations?userId=${uid}`);
      if (!res.ok) return;
      const data: ApiConversation[] = await res.json();
      setConversations(data);
      if (data.length > 0 && activeId === null) {
        setActiveId(data[0].id);
      }
    } catch {
      // silent
    } finally {
      setLoadingConvos(false);
    }
  }, [activeId]);

  useEffect(() => {
    if (!dbUserId) return;
    loadConversations(dbUserId);
  }, [dbUserId]);

  // Load messages for active conversation
  const loadMessages = useCallback(async (convId: number) => {
    try {
      const res = await fetch(`/api/conversations/${convId}/messages`);
      if (!res.ok) return;
      const data: ApiMessage[] = await res.json();
      setMessages(data);
    } catch {
      // silent
    } finally {
      setLoadingMsgs(false);
    }
  }, []);

  useEffect(() => {
    if (!activeId) return;
    setLoadingMsgs(true);
    loadMessages(activeId);

    // Mark messages as read
    if (dbUserId) {
      fetch(`/api/conversations/${activeId}/read`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: dbUserId }),
      }).then(() => {
        setConversations(prev => prev.map(c => c.id === activeId ? { ...c, unread: 0 } : c));
      }).catch(() => {});
    }
  }, [activeId, dbUserId]);

  // Poll for new messages every 3 seconds
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (!activeId || !dbUserId) return;

    pollRef.current = setInterval(async () => {
      await loadMessages(activeId);
      await loadConversations(dbUserId);
    }, 3000);

    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [activeId, dbUserId, loadMessages, loadConversations]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  const sendMessage = async () => {
    if (!input.trim() || !activeId || !dbUserId || sending) return;
    const text = input.trim();
    setInput('');
    setSending(true);

    // Optimistic update
    const optimistic: ApiMessage = {
      id: Date.now(),
      text,
      senderId: dbUserId,
      status: 'sent',
      createdAt: new Date().toISOString(),
      senderName: user?.name ?? 'You',
      senderAvatar: null,
      senderAvatarBg: null,
    };
    setMessages(prev => [...prev, optimistic]);

    try {
      const res = await fetch(`/api/conversations/${activeId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senderId: dbUserId, text }),
      });
      if (!res.ok) throw new Error('Send failed');
      const saved: ApiMessage = await res.json();
      // Replace optimistic with real
      setMessages(prev => prev.map(m => m.id === optimistic.id ? saved : m));
      // Update conversation list
      setConversations(prev => prev.map(c =>
        c.id === activeId
          ? { ...c, lastMessage: `You: ${text}`, lastMessageTime: new Date().toISOString() }
          : c
      ));
    } catch {
      toast.error('Failed to send message');
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
      setInput(text);
    } finally {
      setSending(false);
    }
  };

  const activeConvo = conversations.find(c => c.id === activeId);
  const filteredConvos = conversations.filter(c =>
    (c.listingTitle ?? '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.buyerName ?? '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isPending || !dbUserId) {
    return (
      <div className="h-[calc(100vh-64px)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Messages — CampusKart</title>
        <meta name="description" content="Your CampusKart messages. Chat with buyers and sellers about listings." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <div className="h-[calc(100vh-64px)] bg-background flex overflow-hidden">

        {/* ── Sidebar ── */}
        <div className={`${activeId ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-80 lg:w-96 border-r border-border flex-shrink-0`}>
          <div className="p-4 border-b border-border">
            <h2 className="text-lg font-bold text-foreground font-heading mb-3">Messages</h2>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-border bg-muted/30 text-sm focus:outline-none focus:border-primary transition-all"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {loadingConvos ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            ) : filteredConvos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
                  <MessageCircle size={22} className="text-muted-foreground" />
                </div>
                <p className="text-sm font-semibold text-foreground mb-1">No conversations yet</p>
                <p className="text-xs text-muted-foreground">Message a seller from any listing page</p>
              </div>
            ) : (
              filteredConvos.map(convo => (
                <motion.button
                  key={convo.id}
                  onClick={() => setActiveId(convo.id)}
                  whileHover={{ backgroundColor: 'hsl(var(--muted)/0.5)' }}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 text-left transition-colors duration-150 ${
                    activeId === convo.id ? 'bg-secondary border-r-2 border-primary' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center text-sm font-bold ${convo.buyerAvatarBg ?? 'bg-indigo-100 text-indigo-700'}`}>
                      {convo.buyerAvatar ?? '?'}
                    </div>
                    {convo.online && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-background" />
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-sm font-bold text-foreground truncate">{convo.buyerName ?? 'Unknown'}</span>
                      <span className="text-[10px] text-muted-foreground flex-shrink-0 ml-2">
                        {formatTime(convo.lastMessageTime)}
                      </span>
                    </div>
                    <p className="text-xs text-primary font-semibold truncate mb-0.5">
                      {convo.listingTitle ?? 'Item'} · ₹{(convo.listingPrice ?? 0).toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{convo.lastMessage}</p>
                  </div>
                  {convo.unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                      {convo.unread}
                    </span>
                  )}
                </motion.button>
              ))
            )}
          </div>
        </div>

        {/* ── Chat area ── */}
        {activeConvo ? (
          <div className={`${activeId ? 'flex' : 'hidden md:flex'} flex-col flex-1 min-w-0`}>

            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-3.5 border-b border-border bg-card/50 backdrop-blur-sm">
              <button onClick={() => setActiveId(null)} className="md:hidden p-1.5 hover:bg-muted rounded-lg transition-colors">
                <ArrowLeft size={18} />
              </button>
              <div className="relative">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${activeConvo.buyerAvatarBg ?? 'bg-indigo-100 text-indigo-700'}`}>
                  {activeConvo.buyerAvatar ?? '?'}
                </div>
                {activeConvo.online && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-green-500 border-2 border-background" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-foreground text-sm">{activeConvo.buyerName ?? 'User'}</p>
                <p className="text-xs text-muted-foreground">
                  {activeConvo.online ? 'Online' : 'Offline'} · {activeConvo.listingTitle ?? 'Item'}
                </p>
              </div>
              <div className="flex items-center gap-1">
                <a
                  href={`/listing/${activeConvo.listingId}`}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-secondary text-primary text-xs font-bold hover:bg-primary hover:text-primary-foreground transition-all duration-150"
                >
                  View Item · ₹{(activeConvo.listingPrice ?? 0).toLocaleString()}
                </a>
                <button className="p-2 hover:bg-muted rounded-xl transition-colors">
                  <Phone size={16} className="text-muted-foreground" />
                </button>
                <button className="p-2 hover:bg-muted rounded-xl transition-colors">
                  <MoreVertical size={16} className="text-muted-foreground" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3">
              {loadingMsgs ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {messages.map((msg, i) => {
                    const isMe = msg.senderId === dbUserId;
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 12, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.22, delay: i < 6 ? i * 0.03 : 0 }}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[72%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                          <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            isMe
                              ? 'bg-primary text-primary-foreground rounded-br-sm'
                              : 'bg-card border border-border text-foreground rounded-bl-sm'
                          }`}>
                            {msg.text}
                          </div>
                          <div className={`flex items-center gap-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                            <span className="text-[10px] text-muted-foreground">{formatMsgTime(msg.createdAt)}</span>
                            {isMe && (
                              msg.status === 'read'
                                ? <CheckCheck size={12} className="text-primary" />
                                : msg.status === 'delivered'
                                ? <CheckCheck size={12} className="text-muted-foreground" />
                                : <Check size={12} className="text-muted-foreground" />
                            )}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-4 py-3 border-t border-border bg-card/50">
              <div className="flex items-center gap-2">
                <button className="p-2.5 hover:bg-muted rounded-xl transition-colors flex-shrink-0">
                  <Smile size={18} className="text-muted-foreground" />
                </button>
                <div className="flex-1 relative">
                  <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                    placeholder="Type a message..."
                    className="w-full px-4 py-3 rounded-2xl border border-border bg-background text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/15 transition-all"
                  />
                </div>
                <motion.button
                  onClick={sendMessage}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  disabled={!input.trim() || sending}
                  className="w-11 h-11 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
                >
                  <Send size={16} />
                </motion.button>
              </div>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center">
            <div className="text-center">
              <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-4">
                <MessageCircle size={28} className="text-muted-foreground" />
              </div>
              <h3 className="text-lg font-bold text-foreground font-heading mb-2">Your Messages</h3>
              <p className="text-muted-foreground text-sm">Select a conversation to start chatting</p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
