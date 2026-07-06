"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { LucideSearch, LucideSend, LucidePaperclip, LucideMoreVertical, LucidePhone, LucideVideo, LucideImage, LucideSmile } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getInitials, formatDate } from "@/lib/utils";
import toast from "react-hot-toast";

interface Chat {
  id: string;
  type: "PRIVATE" | "GROUP" | "DEPARTMENT";
  name: string | null;
  participants: string[];
  lastMessage: string | null;
  lastMessageAt: string | null;
  createdAt: string;
  updatedAt: string;
  messages?: Message[];
}

interface Message {
  id: string;
  chatId: string;
  senderId: string;
  sender: {
    fullName: string;
    workerId: string;
    profilePicture: string | null;
  };
  content: string;
  type: "TEXT" | "IMAGE" | "FILE" | "VOICE";
  attachments: string[];
  readBy: string[];
  createdAt: string;
}

export default function WorkerChatsPage() {
  const { data: session } = useSession();
  const [chats, setChats] = useState<Chat[]>([]);
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchChats();
  }, []);

  useEffect(() => {
    if (selectedChat) {
      fetchMessages(selectedChat.id);
    }
  }, [selectedChat]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchChats = async () => {
    try {
      const res = await fetch("/api/chats");
      if (res.ok) {
        const data = await res.json();
        setChats(data.chats || []);
      }
    } catch (error) {
      console.error("Failed to fetch chats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (chatId: string) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/chats/messages?chatId=${chatId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoadingMessages(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat) return;

    const tempMessage: Message = {
      id: `temp-${Date.now()}`,
      chatId: selectedChat.id,
      senderId: session?.user?.workerId || session?.user?.id || "",
      sender: {
        fullName: session?.user?.name || "You",
        workerId: session?.user?.workerId || "",
        profilePicture: null
      },
      content: newMessage,
      type: "TEXT",
      attachments: [],
      readBy: [],
      createdAt: new Date().toISOString()
    };

    setMessages(prev => [...prev, tempMessage]);
    setNewMessage("");

    try {
      const res = await fetch("/api/chats/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chatId: selectedChat.id,
          content: newMessage
        })
      });

      if (!res.ok) {
        throw new Error("Failed to send message");
      }

      const sentMessage = await res.json();
      setMessages(prev => prev.map(m => m.id === tempMessage.id ? sentMessage : m));
    } catch (error) {
      setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
      toast.error("Failed to send message");
    }
  };

  const filteredChats = chats.filter(chat => {
    if (!searchQuery) return true;
    const name = chat.name || chat.participants.join(", ");
    return name.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const getOtherParticipant = (chat: Chat) => {
    const myId = session?.user?.workerId || session?.user?.id;
    const otherIds = chat.participants.filter(p => p !== myId);
    return otherIds[0] || "Unknown";
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] md:h-[calc(100vh-4rem)]">
      {/* Chat List */}
      <div className={`w-full md:w-80 border-r bg-card flex flex-col ${selectedChat ? "hidden md:flex" : "flex"}`}>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold">Chats</h1>
            <Button size="sm" variant="ghost" onClick={() => setShowSearch(!showSearch)}>
              <LucideSearch size={18} />
            </Button>
          </div>
          {showSearch && (
            <Input
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="mb-3"
            />
          )}
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 animate-pulse">
                  <div className="w-12 h-12 rounded-full bg-muted" />
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-24 mb-2" />
                    <div className="h-3 bg-muted rounded w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="p-8 text-center">
              <LucideSearch size={48} className="mx-auto text-muted-foreground mb-4" />
              <h3 className="font-semibold mb-2">No chats found</h3>
              <p className="text-sm text-muted-foreground">Start a conversation with your colleagues</p>
            </div>
          ) : (
            filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={`w-full p-4 flex items-center gap-3 hover:bg-muted/50 transition-colors text-left ${
                  selectedChat?.id === chat.id ? "bg-muted/50" : ""
                }`}
              >
                <Avatar className="h-12 w-12">
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                    {chat.type === "GROUP" ? "G" : getInitials(getOtherParticipant(chat))}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium truncate">
                      {chat.name || getOtherParticipant(chat)}
                    </p>
                    {chat.lastMessageAt && (
                      <span className="text-xs text-muted-foreground">
                        {formatDate(chat.lastMessageAt, "time")}
                      </span>
                    )}
                  </div>
                  {chat.lastMessage && (
                    <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
                  )}
                </div>
                {chat.type === "GROUP" && (
                  <Badge variant="secondary" className="text-xs">Group</Badge>
                )}
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Window */}
      <div className={`flex-1 flex flex-col ${!selectedChat ? "hidden md:flex" : "flex"}`}>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Button
                  variant="ghost"
                  size="sm"
                  className="md:hidden"
                  onClick={() => setSelectedChat(null)}
                >
                  ←
                </Button>
                <Avatar>
                  <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
                    {selectedChat.type === "GROUP" ? "G" : getInitials(getOtherParticipant(selectedChat))}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="font-semibold">
                    {selectedChat.name || getOtherParticipant(selectedChat)}
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    {selectedChat.participants.length} participants
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon">
                  <LucidePhone size={20} />
                </Button>
                <Button variant="ghost" size="icon">
                  <LucideVideo size={20} />
                </Button>
                <Button variant="ghost" size="icon">
                  <LucideMoreVertical size={20} />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingMessages ? (
                <div className="flex justify-center">
                  <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No messages yet. Start the conversation!</p>
                </div>
              ) : (
                messages.map((message) => {
                  const isMe = message.senderId === (session?.user?.workerId || session?.user?.id);
                  return (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                    >
                      <div className={`max-w-[70%] ${isMe ? "order-2" : "order-1"}`}>
                        {!isMe && (
                          <p className="text-xs text-muted-foreground mb-1 ml-1">
                            {message.sender.fullName}
                          </p>
                        )}
                        <div
                          className={`px-4 py-2 rounded-2xl ${
                            isMe
                              ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-br-md"
                              : "bg-muted rounded-bl-md"
                          }`}
                        >
                          <p>{message.content}</p>
                        </div>
                        <p className={`text-[10px] text-muted-foreground mt-1 ${isMe ? "text-right mr-1" : "ml-1"}`}>
                          {formatDate(message.createdAt, "time")}
                        </p>
                      </div>
                    </motion.div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={sendMessage} className="p-4 border-t bg-card">
              <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" size="icon">
                  <LucidePaperclip size={20} />
                </Button>
                <Button type="button" variant="ghost" size="icon">
                  <LucideImage size={20} />
                </Button>
                <Input
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                />
                <Button type="button" variant="ghost" size="icon">
                  <LucideSmile size={20} />
                </Button>
                <Button type="submit" size="icon" disabled={!newMessage.trim()}>
                  <LucideSend size={18} />
                </Button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <LucideSearch size={64} className="mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">Select a chat</h2>
              <p className="text-muted-foreground">Choose a conversation from the list</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}