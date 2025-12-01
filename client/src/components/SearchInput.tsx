import { useState, useCallback } from 'react';
import { Search, Loader2, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchInputProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  isSearching?: boolean;
}

export default function SearchInput({ 
  placeholder = "Search users by ID...", 
  onSearch, 
  isSearching = false 
}: SearchInputProps) {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = useCallback(() => {
    const trimmed = query.trim();
    if (trimmed) {
      onSearch(trimmed);
    }
  }, [query, onSearch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <Card 
      className={`
        transition-all duration-300 
        ${isFocused ? 'ring-2 ring-primary/20 border-primary/30' : ''}
      `}
      data-testid="card-search"
    >
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <div className={`
              absolute left-3 top-1/2 -translate-y-1/2 
              transition-colors duration-200
              ${isFocused ? 'text-primary' : 'text-muted-foreground'}
            `}>
              <Search className="w-5 h-5" aria-hidden="true" />
            </div>
            <Input
              type="text"
              placeholder={placeholder}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              className="pl-11 h-12 text-base"
              aria-label="Search users"
              data-testid="input-search"
            />
          </div>
          <Button
            onClick={handleSubmit}
            disabled={!query.trim() || isSearching}
            className="h-12 px-6 gradient-primary border-0 text-white font-medium"
            data-testid="button-search"
          >
            {isSearching ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                <span>Searching</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                <span>Find User</span>
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
