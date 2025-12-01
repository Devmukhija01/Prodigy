import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { Send, Paperclip, Smile, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { motion, AnimatePresence } from "framer-motion";

interface MessageInputProps {
  onSend: (message: string) => void;
  onTyping?: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export function MessageInput({
  onSend,
  onTyping,
  disabled = false,
  placeholder = "Type a message...",
}: MessageInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 150)}px`;
    }
  }, [message]);

  const handleSend = () => {
    if (!message.trim() || disabled) return;
    onSend(message.trim());
    setMessage("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChange = (value: string) => {
    setMessage(value);
    onTyping?.();
  };

  const hasMessage = message.trim().length > 0;

  return (
    <div className="p-4 border-t bg-background">
      <div className="flex items-end gap-2">
        {/* <Button
          size="icon"
          variant="ghost"
          className="flex-shrink-0 mb-0.5"
          data-testid="button-attach"
        >
          <Paperclip className="h-5 w-5" />
        </Button> */}

        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => handleChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className="min-h-[44px] max-h-[150px] resize-none pr-12 py-3 text-sm"
            rows={1}
            data-testid="input-message"
          />
          <Button
            size="icon"
            variant="ghost"
            className="absolute right-2 bottom-1.5"
            data-testid="button-emoji"
          >
            <Smile className="h-5 w-5" />
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {hasMessage ? (
            <motion.div
              key="send"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <Button
                size="icon"
                onClick={handleSend}
                disabled={disabled || !hasMessage}
                className="flex-shrink-0 mb-0.5"
                data-testid="button-send"
              >
                <Send className="h-4 w-4" />
              </Button>
            </motion.div>
          ) 
          : (
            <motion.div
              key="mic"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {/* <Button
                size="icon"
                variant="ghost"
                className="flex-shrink-0 mb-0.5"
                data-testid="button-voice"
              >
                <Mic className="h-5 w-5" />
              </Button> */}
            </motion.div>
          )
          }
        </AnimatePresence>
      </div>
    </div>
  );
}
