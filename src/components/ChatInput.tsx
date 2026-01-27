import { Send, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, KeyboardEvent } from "react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

const ChatInput = ({ onSend, disabled }: ChatInputProps) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSend(message.trim());
      setMessage("");
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-border bg-card/80 p-4 backdrop-blur-sm">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-end gap-3 rounded-2xl border border-border bg-background p-2 shadow-sm transition-shadow focus-within:shadow-md focus-within:ring-2 focus-within:ring-primary/20">
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="તમારો પ્રશ્ન અહીં લખો..."
            disabled={disabled}
            rows={1}
            className="max-h-32 min-h-[44px] flex-1 resize-none bg-transparent px-3 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none disabled:opacity-50"
            style={{ fontFamily: '"Noto Sans Gujarati", sans-serif' }}
          />
          
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-10 w-10 shrink-0 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground"
              title="Voice input (coming soon)"
            >
              <Mic className="h-5 w-5" />
            </Button>
            
            <Button
              type="button"
              onClick={handleSend}
              disabled={!message.trim() || disabled}
              className="h-10 w-10 shrink-0 rounded-xl gradient-button text-primary-foreground shadow-md transition-all hover:shadow-lg disabled:opacity-50"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Enter દબાવો મોકલવા માટે • Shift+Enter નવી લાઇન માટે
        </p>
      </div>
    </div>
  );
};

export default ChatInput;
