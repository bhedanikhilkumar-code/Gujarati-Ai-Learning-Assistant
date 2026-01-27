import { Languages, Lightbulb, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  onSimplify?: () => void;
  onTranslate?: () => void;
}

const ChatMessage = ({ message, isUser, onSimplify, onTranslate }: ChatMessageProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`flex w-full animate-fade-in ${
        isUser ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`group relative max-w-[85%] md:max-w-[75%] ${
          isUser
            ? "animate-slide-in-right"
            : "animate-slide-in-left"
        }`}
      >
        {/* Avatar */}
        <div
          className={`absolute top-0 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${
            isUser
              ? "-right-2 -top-2 gradient-button text-primary-foreground"
              : "-left-2 -top-2 gradient-accent text-accent-foreground"
          }`}
        >
          {isUser ? "તમે" : "AI"}
        </div>

        {/* Message bubble */}
        <div
          className={`rounded-2xl p-4 pt-5 shadow-md ${
            isUser
              ? "gradient-button text-primary-foreground"
              : "glass-strong text-card-foreground"
          }`}
        >
          <p className="whitespace-pre-wrap leading-relaxed">{message}</p>

          {/* Action buttons for AI messages */}
          {!isUser && (
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-border/30 pt-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={onSimplify}
                className="h-8 gap-1.5 rounded-full bg-secondary/50 text-xs hover:bg-secondary"
              >
                <Lightbulb className="h-3.5 w-3.5" />
                સરળ કરો
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onTranslate}
                className="h-8 gap-1.5 rounded-full bg-secondary/50 text-xs hover:bg-secondary"
              >
                <Languages className="h-3.5 w-3.5" />
                અનુવાદ
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCopy}
                className="h-8 gap-1.5 rounded-full bg-secondary/50 text-xs hover:bg-secondary"
              >
                {copied ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-accent" />
                    કોપી થયું
                  </>
                ) : (
                  <>
                    <Copy className="h-3.5 w-3.5" />
                    કોપી
                  </>
                )}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
