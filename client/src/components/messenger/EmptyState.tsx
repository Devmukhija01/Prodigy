import { MessageCircle } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export function EmptyState({
  title = "Select a conversation",
  description = "Choose a chat from the sidebar to start messaging",
}: EmptyStateProps) {
  return (
    <div 
      className="flex-1 flex flex-col items-center justify-center p-8 text-center"
      data-testid="empty-state"
    >
      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
        <MessageCircle className="h-10 w-10 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-semibold text-foreground mb-2">{title}</h2>
      <p className="text-sm text-muted-foreground max-w-sm">{description}</p>
    </div>
  );
}
