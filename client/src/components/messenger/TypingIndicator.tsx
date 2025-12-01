import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";

interface TypingIndicatorProps {
  name?: string;
  avatar?: string;
}

export function TypingIndicator({ name, avatar }: TypingIndicatorProps) {
  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-end gap-2 mt-3"
      data-testid="typing-indicator"
    >
      <Avatar className="h-8 w-8 flex-shrink-0">
        {avatar && <AvatarImage src={avatar} alt={name || ""} />}
        <AvatarFallback className="bg-muted text-muted-foreground text-xs">
          {getInitials(name || "?")}
        </AvatarFallback>
      </Avatar>

      <div className="bg-muted rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex items-center gap-1">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-muted-foreground/60"
              animate={{
                y: [0, -4, 0],
              }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
      </div>

      {name && (
        <span className="text-xs text-muted-foreground ml-1">{name} is typing...</span>
      )}
    </motion.div>
  );
}
