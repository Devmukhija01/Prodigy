interface DateSeparatorProps {
  date: Date | string;
}

export function DateSeparator({ date }: DateSeparatorProps) {
  const formatDate = (d: Date | string) => {
    const dateObj = new Date(d);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (dateObj.toDateString() === today.toDateString()) {
      return "Today";
    }
    if (dateObj.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }
    return dateObj.toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="flex items-center justify-center my-6" data-testid="date-separator">
      <div className="px-3 py-1 rounded-full bg-muted text-xs font-medium text-muted-foreground">
        {formatDate(date)}
      </div>
    </div>
  );
}
