'use client';

import { useState, useRef } from 'react';
import { useAuth } from '@/lib/firebase/auth-context';
import { Button } from '@/components/ui/button';
import { 
  ChevronDown, 
  Plus, 
  Send, 
  Image as ImageIcon,
  MessageSquare,
  Trash2 
} from 'lucide-react';

type Dialect = 'EGYPTIAN' | 'KUWAITI' | 'UAE' | 'SAUDI';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  image?: string;
  timestamp: Date;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  dialect: Dialect;
  createdAt: Date;
}

const DIALECTS = {
  EGYPTIAN: 'Egyptian Arabic',
  KUWAITI: 'Kuwaiti Arabic',
  UAE: 'UAE Arabic',
  SAUDI: 'Saudi Arabic',
};

export default function GeneratePage() {
  const { user } = useAuth();
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [message, setMessage] = useState('');
  const [dialect, setDialect] = useState<Dialect>('EGYPTIAN');
  const [showDialectMenu, setShowDialectMenu] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentChat = chats.find(c => c.id === activeChat);

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      dialect,
      createdAt: new Date(),
    };
    setChats([newChat, ...chats]);
    setActiveChat(newChat.id);
    setMessage('');
    setSelectedImage(null);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() && !selectedImage) return;

    let chatId = activeChat;
    if (!chatId) {
      createNewChat();
      chatId = Date.now().toString();
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      image: selectedImage || undefined,
      timestamp: new Date(),
    };

    setChats(prev => prev.map(chat => 
      chat.id === chatId 
        ? { 
            ...chat, 
            messages: [...chat.messages, userMessage],
            title: chat.messages.length === 0 ? message.slice(0, 30) : chat.title
          }
        : chat
    ));

    setMessage('');
    setSelectedImage(null);
    setIsGenerating(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Generated content in ${DIALECTS[dialect]}:\n\n${message}`,
        timestamp: new Date(),
      };

      setChats(prev => prev.map(chat => 
        chat.id === chatId 
          ? { ...chat, messages: [...chat.messages, aiMessage] }
          : chat
      ));
      setIsGenerating(false);
    }, 1500);
  };

  const deleteChat = (chatId: string) => {
    setChats(prev => prev.filter(c => c.id !== chatId));
    if (activeChat === chatId) {
      setActiveChat(null);
    }
  };

  return (
    <div className="h-screen flex bg-background">
      {/* Sidebar - Chat History */}
      <div className="w-64 border-r border-border/50 flex flex-col bg-muted/30">
        <div className="p-4 border-b border-border/50">
          <Button 
            onClick={createNewChat}
            className="w-full btn-modern-primary rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Chat
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-2">
          {chats.map(chat => (
            <button
              key={chat.id}
              onClick={() => setActiveChat(chat.id)}
              className={`w-full text-left p-3 rounded-lg mb-2 transition-colors group relative ${
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
                    {chat.messages.length} messages
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteChat(chat.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </button>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="h-16 border-b border-border/50 flex items-center justify-between px-6 bg-background/80 backdrop-blur-xl">
          <h1 className="text-xl font-bold">Generate Content</h1>
          <div className="text-sm text-muted-foreground">
            {user?.displayName || user?.email}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6">
          {!currentChat || currentChat.messages.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">Start Creating Content</h2>
                <p className="text-muted-foreground">
                  Choose your dialect and start chatting with AI to generate amazing Arabic content
                </p>
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto space-y-4">
              {currentChat.messages.map(msg => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-2xl p-4 ${
                      msg.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    {msg.image && (
                      <img 
                        src={msg.image} 
                        alt="Uploaded" 
                        className="rounded-lg mb-2 max-w-full"
                      />
                    )}
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                    <p className={`text-xs mt-2 ${
                      msg.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}>
                      {msg.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {isGenerating && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-2xl p-4">
                    <div className="flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce" />
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-100" />
                      <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-200" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="border-t border-border/50 p-4 bg-background">
          <div className="max-w-3xl mx-auto">
            {selectedImage && (
              <div className="mb-3 relative inline-block">
                <img 
                  src={selectedImage} 
                  alt="Selected" 
                  className="h-20 rounded-lg"
                />
                <button
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                >
                  ×
                </button>
              </div>
            )}
            
            <div className="flex items-end gap-2">
              {/* Dialect Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowDialectMenu(!showDialectMenu)}
                  className="h-12 px-4 rounded-xl border border-border bg-background hover:bg-muted transition-colors flex items-center gap-2"
                >
                  <span className="text-sm font-medium">{DIALECTS[dialect]}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
                
                {showDialectMenu && (
                  <div className="absolute bottom-full mb-2 left-0 w-48 bg-background border border-border rounded-xl shadow-lg overflow-hidden">
                    {Object.entries(DIALECTS).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => {
                          setDialect(key as Dialect);
                          setShowDialectMenu(false);
                        }}
                        className={`w-full text-left px-4 py-3 hover:bg-muted transition-colors ${
                          dialect === key ? 'bg-primary/10 text-primary' : ''
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Image Upload */}
              <div className="relative">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="h-12 w-12 rounded-xl border border-border bg-background hover:bg-muted transition-colors flex items-center justify-center"
                >
                  <ImageIcon className="w-5 h-5" />
                </button>
              </div>

              {/* Message Input */}
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type your message..."
                className="flex-1 h-12 px-4 py-3 rounded-xl border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
                rows={1}
              />

              {/* Send Button */}
              <Button
                onClick={handleSendMessage}
                disabled={(!message.trim() && !selectedImage) || isGenerating}
                className="h-12 w-12 rounded-xl btn-modern-primary p-0"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
