import { useState, useRef, useEffect } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import ChatMessage from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import TypingIndicator from "@/components/TypingIndicator";
import WelcomeMessage from "@/components/WelcomeMessage";
import { getAIResponse, getSimplifiedResponse, getTranslatedResponse } from "@/lib/gujaratiAI";

interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

const Index = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Register service worker on mount
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(console.error);
    }
  }, []);

  const handleSendMessage = (text: string) => {
    const userMessage: Message = {
      id: Date.now(),
      text,
      isUser: true,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const aiResponse = getAIResponse(text);
      const aiMessage: Message = {
        id: Date.now() + 1,
        text: aiResponse,
        isUser: false,
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleSimplify = (originalText: string) => {
    setIsTyping(true);
    setTimeout(() => {
      const simplified = getSimplifiedResponse(originalText);
      const aiMessage: Message = {
        id: Date.now(),
        text: simplified,
        isUser: false,
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 800);
  };

  const handleTranslate = (originalText: string) => {
    setIsTyping(true);
    setTimeout(() => {
      const translated = getTranslatedResponse(originalText);
      const aiMessage: Message = {
        id: Date.now(),
        text: translated,
        isUser: false,
      };
      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);
    }, 800);
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background font-gujarati">
      <Header onMenuClick={() => setSidebarOpen(true)} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onTopicClick={handleSendMessage}
          onQuestionClick={handleSendMessage}
        />

        {/* Main chat area */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-thin">
            <div className="mx-auto max-w-4xl">
              {messages.length === 0 ? (
                <WelcomeMessage />
              ) : (
                <div className="space-y-6">
                  {messages.map((message, index) => (
                    <ChatMessage
                      key={message.id}
                      message={message.text}
                      isUser={message.isUser}
                      onSimplify={
                        !message.isUser
                          ? undefined
                          : undefined
                      }
                      onTranslate={
                        !message.isUser
                          ? undefined
                          : undefined
                      }
                      {...(!message.isUser && {
                        onSimplify: () => handleSimplify(message.text),
                        onTranslate: () => handleTranslate(message.text),
                      })}
                    />
                  ))}
                  {isTyping && <TypingIndicator />}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
          </div>

          {/* Chat input */}
          <ChatInput onSend={handleSendMessage} disabled={isTyping} />
        </main>
      </div>
    </div>
  );
};

export default Index;
