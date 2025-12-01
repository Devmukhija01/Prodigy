import { useState } from "react";
import { Plus, ThumbsUp, AlertTriangle, Lightbulb, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { RetroItem } from "@/lib/types";
import { cn } from "@/lib/utils";

interface RetrospectiveBoardProps {
  items: RetroItem[];
  onAddItem?: (type: RetroItem["type"], content: string) => void;
  onDeleteItem?: (id: string) => void;
}

const columnConfig = {
  went_well: {
    title: "What went well",
    icon: ThumbsUp,
    bgColor: "bg-green-50 dark:bg-green-950/30",
    iconColor: "text-green-600",
    borderColor: "border-green-200 dark:border-green-800",
  },
  improve: {
    title: "What to improve",
    icon: AlertTriangle,
    bgColor: "bg-amber-50 dark:bg-amber-950/30",
    iconColor: "text-amber-600",
    borderColor: "border-amber-200 dark:border-amber-800",
  },
  action: {
    title: "Action items",
    icon: Lightbulb,
    bgColor: "bg-blue-50 dark:bg-blue-950/30",
    iconColor: "text-blue-600",
    borderColor: "border-blue-200 dark:border-blue-800",
  },
};

function RetroColumn({
  type,
  items,
  onAddItem,
  onDeleteItem,
}: {
  type: RetroItem["type"];
  items: RetroItem[];
  onAddItem?: (content: string) => void;
  onDeleteItem?: (id: string) => void;
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState("");
  const config = columnConfig[type];
  const Icon = config.icon;

  const handleAdd = () => {
    if (newContent.trim()) {
      onAddItem?.(newContent.trim());
      setNewContent("");
      setIsAdding(false);
    }
  };

  return (
    <div className={cn("rounded-lg flex flex-col min-w-[280px]", config.bgColor)} data-testid={`retro-column-${type}`}>
      <div className={cn("p-3 border-b", config.borderColor)}>
        <div className="flex items-center gap-2">
          <Icon className={cn("h-4 w-4", config.iconColor)} />
          <h3 className="font-semibold text-sm">{config.title}</h3>
          <span className="text-xs text-muted-foreground bg-background/50 px-1.5 py-0.5 rounded-full ml-auto">
            {items.length}
          </span>
        </div>
      </div>

      <ScrollArea className="flex-1 p-2">
        <div className="space-y-2">
          {items.map((item) => (
            <Card 
              key={item.id} 
              className="group relative"
              data-testid={`retro-item-${item.id}`}
            >
              <CardContent className="p-3 pr-8">
                <p className="text-sm">{item.content}</p>
              </CardContent>
              {onDeleteItem && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => onDeleteItem(item.id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </Card>
          ))}

          {isAdding ? (
            <Card>
              <CardContent className="p-2">
                <Input
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="Type your item..."
                  className="mb-2"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleAdd();
                    if (e.key === "Escape") setIsAdding(false);
                  }}
                  data-testid={`input-retro-${type}`}
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={handleAdd}>Add</Button>
                  <Button size="sm" variant="ghost" onClick={() => setIsAdding(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-muted-foreground"
              onClick={() => setIsAdding(true)}
              data-testid={`button-add-retro-${type}`}
            >
              <Plus className="h-4 w-4" />
              Add item
            </Button>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

export function RetrospectiveBoard({ items, onAddItem, onDeleteItem }: RetrospectiveBoardProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-testid="retro-board">
      {(["went_well", "improve", "action"] as const).map((type) => (
        <RetroColumn
          key={type}
          type={type}
          items={items.filter((item) => item.type === type)}
          onAddItem={(content) => onAddItem?.(type, content)}
          onDeleteItem={onDeleteItem}
        />
      ))}
    </div>
  );
}
