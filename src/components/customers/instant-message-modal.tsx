"use client";

import { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  Send,
  Phone,
  User,
  Check,
  CheckCheck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

interface InstantMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  customer: {
    id: string;
    name: string;
    phone: string;
    email?: string;
  };
  onMessageSent: (messageData: {
    message: string;
    type: string;
    urgent: boolean;
  }) => void;
}

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  isFromCustomer: boolean;
  status: "sent" | "delivered" | "read";
  type: "text" | "image" | "file";
}

const QUICK_RESPONSES = [
  "Thanks for your message! We&apos;ll get back to you shortly.",
  "We'd be happy to help you with your cleaning needs.",
  "Let me check our availability and get back to you.",
  "Would you like to schedule a free consultation?",
  "Our standard cleaning service includes all basic cleaning tasks.",
  "We use eco-friendly cleaning products by default.",
  "I&apos;ll have our team contact you within 24 hours.",
  "Thanks for choosing Limpia Cleaning Services!",
];

export function InstantMessageModal({
  isOpen,
  onClose,
  customer,
  onMessageSent,
}: InstantMessageModalProps) {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    // Mock conversation history
    {
      id: "1",
      senderId: customer.id,
      senderName: customer.name,
      content:
        "Hi, I'm interested in your cleaning services. Do you service the downtown area?",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      isFromCustomer: true,
      status: "read",
      type: "text",
    },
    {
      id: "2",
      senderId: "agent1",
      senderName: "Sales Team",
      content:
        "Hello! Yes, we service the entire downtown area. What type of property are you looking to have cleaned?",
      timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
      isFromCustomer: false,
      status: "read",
      type: "text",
    },
    {
      id: "3",
      senderId: customer.id,
      senderName: customer.name,
      content:
        "It's a 2-bedroom apartment, about 1000 sq ft. How much would a weekly cleaning cost?",
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      isFromCustomer: true,
      status: "read",
      type: "text",
    },
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [customerOnline] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    const messageData = {
      id: Date.now().toString(),
      senderId: "agent1", // Current user ID
      senderName: "Sales Team", // Current user name
      content: newMessage,
      timestamp: new Date().toISOString(),
      isFromCustomer: false,
      status: "sent" as const,
      type: "text" as const,
    };

    // Add message to local state
    setMessages((prev) => [...prev, messageData]);
    setNewMessage("");

    try {
      // Log the message
      await onMessageSent({
        message: newMessage,
        type: messageData.type,
        urgent: false, // Default to false for instant messages
      });

      // Simulate message delivery status updates
      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageData.id ? { ...msg, status: "delivered" } : msg,
          ),
        );
      }, 1000);

      setTimeout(() => {
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === messageData.id ? { ...msg, status: "read" } : msg,
          ),
        );
      }, 3000);

      // Simulate customer typing response
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setIsTyping(false);
          // Add mock customer response
          const customerResponse = {
            id: (Date.now() + 1).toString(),
            senderId: customer.id,
            senderName: customer.name,
            content:
              "Thank you! That sounds good. When would be the earliest you could start?",
            timestamp: new Date().toISOString(),
            isFromCustomer: true,
            status: "read" as const,
            type: "text" as const,
          };
          setMessages((prev) => [...prev, customerResponse]);
        }, 2000);
      }, 5000);
    } catch (error: unknown) {
      toast({
        title: "Message Error",
        description:
          error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive",
      });
    }
  };

  const sendQuickResponse = (response: string) => {
    setNewMessage(response);
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <Check className="w-3 h-3" />;
      case "delivered":
        return <CheckCheck className="w-3 h-3" />;
      case "read":
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
        <DialogHeader className="border-b pb-4">
          <DialogTitle className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MessageSquare className="w-5 h-5" />
              <div>
                <span>{customer.name}</span>
                <div className="text-sm font-normal text-gray-600">
                  {customer.phone}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={customerOnline ? "default" : "secondary"}>
                {customerOnline ? "Online" : "Offline"}
              </Badge>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  /* Initiate call */
                }}
              >
                <Phone className="w-4 h-4" />
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isFromCustomer ? "justify-start" : "justify-end"}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.isFromCustomer
                    ? "bg-gray-100 text-gray-800"
                    : "bg-blue-600 text-white"
                }`}
              >
                <div className="text-sm font-medium mb-1">
                  {message.isFromCustomer ? (
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">
                          {customer.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span>{message.senderName}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span>{message.senderName}</span>
                    </div>
                  )}
                </div>
                <div className="text-sm mb-2">{message.content}</div>
                <div className="flex items-center justify-between text-xs opacity-70">
                  <span>{formatTime(message.timestamp)}</span>
                  {!message.isFromCustomer && (
                    <div className="flex items-center gap-1">
                      {getStatusIcon(message.status)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3 max-w-[80%]">
                <div className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-xs">
                      {customer.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm text-gray-600">
                    {customer.name} is typing...
                  </span>
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Responses */}
        <div className="border-t border-b p-3">
          <div className="text-sm font-medium mb-2">Quick Responses:</div>
          <div className="flex flex-wrap gap-2">
            {QUICK_RESPONSES.slice(0, 4).map((response, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={() => sendQuickResponse(response)}
                className="text-xs h-7"
              >
                {response.length > 30
                  ? `${response.substring(0, 30)}...`
                  : response}
              </Button>
            ))}
          </div>
        </div>

        {/* Message Input */}
        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              className="flex-1"
            />
            <Button onClick={sendMessage} disabled={!newMessage.trim()}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Press Enter to send, Shift+Enter for new line
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
