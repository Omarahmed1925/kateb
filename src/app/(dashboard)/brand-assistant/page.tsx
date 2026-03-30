'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  ChevronDown,
  Plus,
  Send,
  Image as ImageIcon,
  MessageSquare,
  Trash2,
  Upload,
  Sparkles,
  Eye,
  X,
  Loader2,
  Camera,
  Clapperboard,
  Share2,
  Film,
  Copy,
  Check,
} from 'lucide-react';
import type { BrandDialect, BrandAnalysis } from '@/types';

/* ─── Dialect config ──────────────────────────────────────── */
const DIALECTS: Record<BrandDialect, { label: string; ar: string; flag: string }> = {
  EGYPTIAN: { label: 'Egyptian', ar: 'مصري', flag: '🇪🇬' },
  EMIRATI: { label: 'Emirati', ar: 'إماراتي', flag: '🇦🇪' },
  SAUDI: { label: 'Saudi', ar: 'سعودي', flag: '🇸🇦' },
  KUWAITI: { label: 'Kuwaiti', ar: 'كويتي', flag: '🇰🇼' },
};

/* ─── Content type config ─────────────────────────────────── */
type ContentType = 'INSTAGRAM_POST' | 'INSTAGRAM_STORY' | 'FACEBOOK_POST' | 'FACEBOOK_STORY';

const CONTENT_TYPES: Record<ContentType, { label: string; icon: React.ReactNode }> = {
  INSTAGRAM_POST: { label: 'Instagram Post', icon: <Camera className="w-4 h-4" /> },
  INSTAGRAM_STORY: { label: 'Instagram Story', icon: <Clapperboard className="w-4 h-4" /> },
  FACEBOOK_POST: { label: 'Facebook Post', icon: <Share2 className="w-4 h-4" /> },
  FACEBOOK_STORY: { label: 'Facebook Story', icon: <Film className="w-4 h-4" /> },
};

/* ─── Local interfaces ────────────────────────────────────── */
interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  image?: string;
  timestamp: Date;
}

interface Chat {
  id: string;
  title: string;
  messages: ChatMessage[];
  dialect: BrandDialect;
  contentType: ContentType;
  brandAnalysis: BrandAnalysis | null;
  createdAt: Date;
}

/* ─── Component ───────────────────────────────────────────── */
export default function BrandAssistantPage() {
  /* ── State ────────────────── */
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [dialect, setDialect] = useState<BrandDialect>('EGYPTIAN');
  const [contentType, setContentType] = useState<ContentType>('INSTAGRAM_POST');
  const [showDialectMenu, setShowDialectMenu] = useState(false);
  const [showContentTypeMenu, setShowContentTypeMenu] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedImageMime, setSelectedImageMime] = useState<string>('image/jpeg');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [brandAnalysis, setBrandAnalysis] = useState<BrandAnalysis | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  const currentChat = chats.find((c) => c.id === activeChat);

  /* ── Auto-scroll ──────────── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentChat?.messages, streamingText]);

  /* ── Chat management ──────── */
  const createNewChat = useCallback(() => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New Brand Chat',
      messages: [],
      dialect,
      contentType,
      brandAnalysis: null,
      createdAt: new Date(),
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChat(newChat.id);
    setMessage('');
    setSelectedImage(null);
    setBrandAnalysis(null);
    setShowAnalysis(false);
    return newChat.id;
  }, [dialect]);

  const deleteChat = (chatId: string) => {
    setChats((prev) => prev.filter((c) => c.id !== chatId));
    if (activeChat === chatId) {
      setActiveChat(null);
      setBrandAnalysis(null);
    }
  };

  /* ── Image handling ───────── */
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    const mime = file.type as string;
    setSelectedImageMime(mime);

    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      setSelectedImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processImageFile(file);
  };

  /* ── Drag & drop ──────────── */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processImageFile(file);
  }, []);

  /* ── Analyze image ────────── */
  const analyzeImage = async (base64Data: string, mimeType: string) => {
    setIsAnalyzing(true);
    try {
      // Strip data URL prefix to get raw base64
      const rawBase64 = base64Data.includes(',')
        ? base64Data.split(',')[1]
        : base64Data;

      const res = await fetch('/api/brand-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'analyze',
          imageBase64: rawBase64,
          mimeType,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        setBrandAnalysis(data.data);
        setShowAnalysis(true);

        // Store in chat
        setChats((prev) =>
          prev.map((chat) =>
            chat.id === activeChat ? { ...chat, brandAnalysis: data.data } : chat
          )
        );

        return data.data as BrandAnalysis;
      }
    } catch (error) {
      console.error('Image analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
    return null;
  };

  /* ── Send message (streaming) ── */
  const handleSendMessage = async (overrideMessage?: string) => {
    const msgText = overrideMessage ?? message;
    if ((!msgText.trim() && !selectedImage) || isGenerating) return;

    let chatId = activeChat;
    if (!chatId) {
      chatId = createNewChat();
    }

    // If image is newly uploaded, analyze it first
    let currentBrandContext = brandAnalysis;
    if (selectedImage && !brandAnalysis) {
      currentBrandContext = await analyzeImage(selectedImage, selectedImageMime);
    }

    // Create user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: msgText || `Generate ${CONTENT_TYPES[contentType].label} content for this brand`,
      image: selectedImage || undefined,
      timestamp: new Date(),
    };

    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId
          ? {
              ...chat,
              messages: [...chat.messages, userMsg],
              title:
                chat.messages.length === 0
                  ? (msgText || 'Brand Analysis').slice(0, 30)
                  : chat.title,
            }
          : chat
      )
    );

    const currentMessages = [
      ...(currentChat?.messages || []),
      userMsg,
    ];

    setMessage('');
    setSelectedImage(null);
    setIsGenerating(true);
    setStreamingText('');

    try {
      // Build messages for API — map to the format the API expects
      const apiMessages = currentMessages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const rawBase64 =
        userMsg.image && userMsg.image.includes(',')
          ? userMsg.image.split(',')[1]
          : undefined;

      const res = await fetch('/api/brand-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'chat',
          contentType,
          messages: apiMessages,
          dialect,
          brandContext: currentBrandContext
            ? JSON.stringify(currentBrandContext)
            : undefined,
          imageBase64: rawBase64,
          imageMimeType: rawBase64 ? selectedImageMime : undefined,
        }),
      });

      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }

      // Read SSE stream
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') continue;
              try {
                const parsed = JSON.parse(data);
                if (parsed.text) {
                  fullText += parsed.text;
                  setStreamingText(fullText);
                }
                if (parsed.error) {
                  console.error('Stream error:', parsed.error);
                }
              } catch {
                // skip unparseable lines
              }
            }
          }
        }
      }

      // Add completed assistant message
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: fullText,
        timestamp: new Date(),
      };

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? { ...chat, messages: [...chat.messages, aiMsg] }
            : chat
        )
      );
    } catch (error) {
      console.error('Chat error:', error);

      // Add error message
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: `⚠️ Error: ${error instanceof Error ? error.message : 'Failed to get response'}. Please try again.`,
        timestamp: new Date(),
      };

      setChats((prev) =>
        prev.map((chat) =>
          chat.id === chatId
            ? { ...chat, messages: [...chat.messages, errorMsg] }
            : chat
        )
      );
    } finally {
      setIsGenerating(false);
      setStreamingText('');
    }
  };

  /* ── Render ─────────────────── */
  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* ── Sidebar: Chat History ── */}
      <div className="w-72 border-r border-border/50 flex flex-col bg-muted/30">
        <div className="p-4 border-b border-border/50">
          <h1 className="text-lg font-bold mb-3 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Brand Assistant
          </h1>
          <Button onClick={() => createNewChat()} className="w-full btn-modern-primary rounded-xl">
            <Plus className="w-4 h-4 mr-2" />
            New Brand Chat
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {chats.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground px-4 py-8">
              No chats yet. Upload a brand image to start!
            </div>
          ) : (
            chats.map((chat) => (
              <div
                key={chat.id}
                role="button"
                tabIndex={0}
                onClick={() => {
                  setActiveChat(chat.id);
                  setContentType(chat.contentType);
                  setBrandAnalysis(chat.brandAnalysis);
                  if (chat.brandAnalysis) setShowAnalysis(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setActiveChat(chat.id);
                    setContentType(chat.contentType);
                    setBrandAnalysis(chat.brandAnalysis);
                    if (chat.brandAnalysis) setShowAnalysis(true);
                  }
                }}
                className={`w-full text-left p-3 rounded-lg mb-2 transition-colors group relative cursor-pointer ${
                  activeChat === chat.id
                    ? 'bg-primary/10 text-primary'
                    : 'hover:bg-muted'
                }`}
              >
                <div className="flex items-start gap-2">
                  <MessageSquare className="w-4 h-4 mt-1 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{chat.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {DIALECTS[chat.dialect].flag} {DIALECTS[chat.dialect].ar} ·{' '}
                      {chat.messages.length} messages
                    </p>
                  </div>
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteChat(chat.id);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation();
                        deleteChat(chat.id);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Messages */}
        <div
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-6"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {/* Drag overlay */}
          {isDragOver && (
            <div className="fixed inset-0 bg-primary/10 backdrop-blur-sm z-50 flex items-center justify-center pointer-events-none">
              <div className="bg-background border-2 border-dashed border-primary rounded-2xl p-12 text-center">
                <Upload className="w-12 h-12 text-primary mx-auto mb-4" />
                <p className="text-lg font-semibold">Drop your brand image here</p>
                <p className="text-sm text-muted-foreground mt-1">
                  JPG, PNG, WebP or GIF
                </p>
              </div>
            </div>
          )}

          {!currentChat || currentChat.messages.length === 0 ? (
            /* ── Empty state ── */
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-lg">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mx-auto mb-6">
                  <Sparkles className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-3xl font-bold mb-3">
                  Visual Brand Assistant
                </h2>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  Upload a product or brand image, and I&apos;ll analyze it and
                  generate marketing content in your chosen Arabic dialect.
                </p>

                {/* Quick dialect selector */}
                <div className="flex flex-wrap gap-3 justify-center mb-8">
                  {(Object.entries(DIALECTS) as [BrandDialect, typeof DIALECTS.EGYPTIAN][]).map(
                    ([key, val]) => (
                      <button
                        key={key}
                        onClick={() => setDialect(key)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          dialect === key
                            ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/25 scale-105'
                            : 'bg-muted hover:bg-muted/80'
                        }`}
                      >
                        {val.flag} {val.label} ({val.ar})
                      </button>
                    )
                  )}
                </div>

                {/* Upload area */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-border rounded-2xl p-8 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group"
                >
                  <Upload className="w-8 h-8 text-muted-foreground group-hover:text-primary mx-auto mb-3 transition-colors" />
                  <p className="text-sm font-medium">
                    Click to upload or drag & drop
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG, WebP or GIF
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* ── Messages list ── */
            <div className="max-w-4xl mx-auto space-y-4">
              {currentChat.messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 relative group/msg ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {msg.image && (
                      <img
                        src={msg.image}
                        alt="Uploaded brand"
                        className="rounded-lg mb-3 max-w-full max-h-64 object-contain"
                      />
                    )}
                    <p className="whitespace-pre-wrap" dir="auto">
                      {msg.content}
                    </p>
                    <div className={`flex items-center justify-between mt-2`}>
                      <p
                        className={`text-xs ${
                          msg.role === 'user'
                            ? 'text-primary-foreground/70'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {msg.timestamp.toLocaleTimeString()}
                      </p>
                      {msg.role === 'model' && (
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(msg.content);
                            setCopiedId(msg.id);
                            setTimeout(() => setCopiedId(null), 2000);
                          }}
                          className="opacity-0 group-hover/msg:opacity-100 transition-all ml-3 px-2 py-1 rounded-lg hover:bg-background/50 text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-xs"
                          title="Copy caption"
                        >
                          {copiedId === msg.id ? (
                            <><Check className="w-3.5 h-3.5 text-green-500" /> Copied!</>
                          ) : (
                            <><Copy className="w-3.5 h-3.5" /> Copy</>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {/* Streaming message */}
              {isGenerating && streamingText && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] rounded-2xl p-4 bg-muted">
                    <p className="whitespace-pre-wrap" dir="auto">
                      {streamingText}
                      <span className="inline-block w-2 h-5 bg-primary/60 animate-pulse ml-0.5" />
                    </p>
                  </div>
                </div>
              )}

              {/* Loading dots */}
              {isGenerating && !streamingText && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl p-4">
                    <div className="flex gap-2">
                      {isAnalyzing ? (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Analyzing image...
                        </div>
                      ) : (
                        <>
                          <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                          <div
                            className="w-2 h-2 rounded-full bg-primary animate-bounce"
                            style={{ animationDelay: '0.1s' }}
                          />
                          <div
                            className="w-2 h-2 rounded-full bg-primary animate-bounce"
                            style={{ animationDelay: '0.2s' }}
                          />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Follow-up question chips */}
              {!isGenerating && brandAnalysis && currentChat.messages.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {/* Quick "more" actions */}
                  {currentChat.messages.some((m) => m.role === 'model') && (
                    <>
                      <button
                        onClick={() => handleSendMessage('اديني ١٥ كابشن بفايبات مختلفة')}
                        className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
                      >
                        🎨 ١٥ كابشن بفايبات مختلفة
                      </button>
                      <button
                        onClick={() => handleSendMessage('اديني ١٠ كمان بفايبات جديدة')}
                        className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
                      >
                        🔄 ١٠ كمان
                      </button>
                      <button
                        onClick={() => handleSendMessage('نفس الكابشن بس بفايب فاني')}
                        className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
                      >
                        😂 فايب فاني
                      </button>
                      <button
                        onClick={() => handleSendMessage('كابشن ستوري قصير وجذاب')}
                        className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
                      >
                        📱 ستوري قصير
                      </button>
                    </>
                  )}

                  {/* Brand-specific suggested questions from analysis */}
                  {brandAnalysis.suggestedQuestions &&
                    !currentChat.messages.some((m) => m.role === 'model') &&
                    brandAnalysis.suggestedQuestions.slice(0, 4).map((q, i) => (
                      <button
                        key={i}
                        onClick={() => handleSendMessage(q)}
                        className="px-3 py-1.5 rounded-full bg-muted text-foreground text-xs font-medium hover:bg-muted/80 transition-colors"
                      >
                        💡 {q}
                      </button>
                    ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* ── Input Area ── */}
        <div className="border-t border-border/50 p-4 bg-background">
          {/* Image preview */}
          {selectedImage && (
            <div className="mb-3 px-4 relative inline-block">
              <img
                src={selectedImage}
                alt="Selected"
                className="h-20 rounded-lg border border-border"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center shadow-sm"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Brand analysis summary badge */}
          {brandAnalysis && (
            <div className="mb-3 px-4">
              <button
                onClick={() => setShowAnalysis(!showAnalysis)}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium hover:bg-primary/15 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                {brandAnalysis.brandName} · {brandAnalysis.productCategory}
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${showAnalysis ? 'rotate-180' : ''}`}
                />
              </button>

              {showAnalysis && (
                <div className="mt-2 p-4 rounded-xl bg-muted/50 border border-border text-sm space-y-2">
                  <div>
                    <span className="font-semibold">Brand:</span>{' '}
                    {brandAnalysis.brandName}
                  </div>
                  <div>
                    <span className="font-semibold">Category:</span>{' '}
                    {brandAnalysis.productCategory}
                  </div>
                  <div>
                    <span className="font-semibold">Audience:</span>{' '}
                    {brandAnalysis.targetAudience}
                  </div>
                  <div>
                    <span className="font-semibold">Personality:</span>{' '}
                    {brandAnalysis.brandPersonality}
                  </div>
                  <div>
                    <span className="font-semibold">Marketing Angles:</span>
                    <ul className="list-disc list-inside mt-1 space-y-0.5">
                      {brandAnalysis.marketingAngles.map((angle, i) => (
                        <li key={i}>{angle}</li>
                      ))}
                    </ul>
                  </div>
                  {brandAnalysis.keyColors.length > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Colors:</span>
                      <div className="flex gap-1">
                        {brandAnalysis.keyColors.map((color, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-full bg-muted text-xs"
                          >
                            {color}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Input bar */}
          <div className="flex items-center gap-3 px-4 py-2 rounded-2xl border border-border bg-background hover:border-primary/50 transition-colors mx-4">
            {/* Dialect selector */}
            <div className="relative">
              <button
                onClick={() => setShowDialectMenu(!showDialectMenu)}
                className="h-10 px-3 rounded-lg hover:bg-muted transition-colors flex items-center gap-2"
              >
                <span className="text-base">{DIALECTS[dialect].flag}</span>
                <span className="text-sm font-medium whitespace-nowrap">
                  {DIALECTS[dialect].ar}
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {showDialectMenu && (
                <div className="absolute bottom-full mb-2 left-0 w-52 bg-background border border-border rounded-xl shadow-lg overflow-hidden z-10">
                  {(Object.entries(DIALECTS) as [BrandDialect, typeof DIALECTS.EGYPTIAN][]).map(
                    ([key, val]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setDialect(key);
                          setShowDialectMenu(false);
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-muted transition-colors flex items-center gap-3 ${
                          dialect === key ? 'bg-primary/10 text-primary' : ''
                        }`}
                      >
                        <span className="text-base">{val.flag}</span>
                        <span>
                          {val.label} ({val.ar})
                        </span>
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-border" />

            {/* Content type selector */}
            <div className="relative">
              <button
                onClick={() => setShowContentTypeMenu(!showContentTypeMenu)}
                className="h-10 px-3 rounded-lg hover:bg-muted transition-colors flex items-center gap-2"
              >
                {CONTENT_TYPES[contentType].icon}
                <span className="text-sm font-medium whitespace-nowrap">
                  {CONTENT_TYPES[contentType].label}
                </span>
                <ChevronDown className="w-4 h-4" />
              </button>

              {showContentTypeMenu && (
                <div className="absolute bottom-full mb-2 left-0 w-52 bg-background border border-border rounded-xl shadow-lg overflow-hidden z-10">
                  {(Object.entries(CONTENT_TYPES) as [ContentType, typeof CONTENT_TYPES.INSTAGRAM_POST][]).map(
                    ([key, val]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setContentType(key);
                          setShowContentTypeMenu(false);
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-muted transition-colors flex items-center gap-3 ${
                          contentType === key ? 'bg-primary/10 text-primary' : ''
                        }`}
                      >
                        {val.icon}
                        <span>{val.label}</span>
                      </button>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-border" />

            {/* Image upload */}
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleImageSelect}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="h-10 w-10 rounded-lg hover:bg-muted transition-colors flex items-center justify-center"
                title="Upload brand image"
              >
                <ImageIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Divider */}
            <div className="h-6 w-px bg-border" />

            {/* Message input */}
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Describe what content you want..."
              className="flex-1 h-10 px-2 bg-transparent focus:outline-none text-sm"
              dir="auto"
            />

            {/* Send button */}
            <Button
              onClick={() => handleSendMessage()}
              disabled={(!message.trim() && !selectedImage) || isGenerating}
              className="h-10 w-10 rounded-lg btn-modern-primary p-0 flex-shrink-0"
            >
              {isGenerating ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
