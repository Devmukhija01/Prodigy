import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Users,
  UserPlus,
  Search as SearchIcon,
  Bell,
  Zap,
  Shield,
  Heart,
  X as XIcon,
  UserPlus as UserPlusIcon,
  CheckCircle,
  Check,
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { useSocket } from '@/hooks/useSocket';
import PageHeader from '@/components/PageHeader';
import SectionHeader from '@/components/SectionHeader';
import EmptyState from '@/components/EmptyState';
import SkeletonCard from '@/components/SkeletonCard';
import ErrorState from '@/components/ErrorState';
import FriendRequestCard from '@/components/FriendRequestCard';
import UserSearchResult from '@/components/UserSearchResult';

// -----------------------------
// Types
// -----------------------------
type UserShort = {
  id?: string;
  _id?: string;
  username?: string;
  fullName?: string;
  email?: string;
  registerId?: string;
  firstName?: string;
  lastName?: string;
};

type FriendRequest = {
  id?: string;
  _id?: string;
  fromUser?: UserShort;
  toUser?: UserShort;
  createdAt?: string;
  status?: 'pending' | 'accepted' | 'rejected';
};

// -----------------------------
// Helpers
// -----------------------------
const getCurrentUserId = () => {
  try {
    const raw = localStorage.getItem('userData') ?? localStorage.getItem('userId');
    if (!raw) return null;
    if (raw.trim().startsWith('{') || raw.trim().startsWith('[')) {
      const parsed = JSON.parse(raw);
      return parsed?._id ?? parsed?.id ?? null;
    }
    return raw;
  } catch {
    return localStorage.getItem('userId') ?? null;
  }
};

const CURRENT_USER_ID = getCurrentUserId();

const KEYS = {
  pendingRequests: ['/api/friend-requests/pending'],
  friends: ['/api/friends'],
  userSearch: (q?: string) => ['/api/users/search', q ?? ''],
};

const initials = (name?: string) =>
  (name || '')
    .split(' ')
    .filter(Boolean)
    .map(s => s[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();

// -----------------------------
// Component
// -----------------------------
export default function FriendsManagement() {
  const toast = useToast().toast ?? useToast(); // support both shapes
  const queryClient = useQueryClient();
  const { friendRequests: socketRequests = [], setFriendRequests } = useSocket(CURRENT_USER_ID);
  const [isBellOpen, setIsBellOpen] = useState(false);

  // --- Search state (debounced)
  const [searchTerm, setSearchTerm] = useState('');
  const [debounced, setDebounced] = useState('');
  const [searchSubmitted, setSearchSubmitted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(searchTerm.trim()), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // --- Pending requests via react-query
  const {
    data: pendingData,
    isLoading: isPendingLoading,
    isError: isPendingError,
    error: pendingError,
  } = useQuery<FriendRequest[]>({
    queryKey: KEYS.pendingRequests,
    queryFn: async () => {
      const res = await apiRequest('GET', '/api/friend-requests/pending/');
      if (res.status === 304) {
        return queryClient.getQueryData<FriendRequest[]>(KEYS.pendingRequests) ?? [];
      }
      const parsed = await res.json().catch(() => null);
      if (Array.isArray(parsed)) return parsed;
      if (parsed && Array.isArray(parsed.data)) return parsed.data;
      return [];
    },
    staleTime: 0,
    refetchOnWindowFocus: true,
    retry: false,
    enabled: !!CURRENT_USER_ID,
  });

  // local merged list (server + socket)
  const [localRequests, setLocalRequests] = useState<FriendRequest[]>([]);
  useEffect(() => {
    const arr = Array.isArray(pendingData) ? pendingData : [];
    const normalized = arr.map(r => ({ ...r, _id: r._id ?? r.id }));
    setLocalRequests(normalized);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(pendingData)]);

  useEffect(() => {
    if (!Array.isArray(socketRequests) || socketRequests.length === 0) return;
    setLocalRequests(prev => {
      const existing = new Set(prev.map(r => r._id ?? r.id));
      const normalized = socketRequests.map((r: any) => ({ ...r, _id: r._id ?? r.id }));
      const newOnes = normalized.filter((r: any) => !existing.has(r._id ?? r.id));
      return [...newOnes, ...prev];
    });
  }, [JSON.stringify(socketRequests)]);

  // derived count
  const pendingCount = localRequests.length;

  // keyboard escape for modal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsBellOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // --- Accept / Reject mutation (optimistic)
  const requestMut = useMutation({
    mutationFn: async ({ requestId, status }: { requestId: string; status: 'accepted' | 'rejected' }) => {
      const res = await apiRequest('PATCH', `/api/friend-requests/${requestId}`, { status });
      try {
        return await res.json();
      } catch {
        return null;
      }
    },
    onMutate: async ({ requestId }) => {
      await queryClient.cancelQueries({ queryKey: KEYS.pendingRequests });
      const previous = queryClient.getQueryData<any[]>(KEYS.pendingRequests);
      queryClient.setQueryData(KEYS.pendingRequests, (old: any[] = []) =>
        old.filter?.((r: any) => (r._id ?? r.id) !== requestId) ?? old
      );
      setLocalRequests(prev => prev.filter(r => (r._id ?? r.id) !== requestId));
      return { previous };
    },
    onError: (err: any, _vars, context: any) => {
      if (context?.previous) queryClient.setQueryData(KEYS.pendingRequests, context.previous);
      toast({
        title: 'Error',
        description: err?.message ?? 'Failed to update request',
        variant: 'destructive',
      });
    },
    onSuccess: (_data, { status }) => {
      toast({ title: 'Success', description: `Friend request ${status}` });
      queryClient.invalidateQueries({ queryKey: KEYS.pendingRequests });
      queryClient.invalidateQueries({ queryKey: KEYS.friends });
      // remove from socket list too if provided
      setFriendRequests?.((prev: any[]) => prev.filter(r => (r._id ?? r.id) !== ((_data as any)?._id ?? (_data as any)?.id)));
    },
  });

  const handleAccept = (requestId: string) => requestMut.mutate({ requestId, status: 'accepted' });
  const handleReject = (requestId: string) => requestMut.mutate({ requestId, status: 'rejected' });

  // --- Search (uses apiRequest) and send request mutation
  const { data: searchedUser, isFetching: isSearchingUser, error: searchApiError } = useQuery({
    queryKey: KEYS.userSearch(debounced || undefined),
    enabled: !!debounced && searchSubmitted,
    queryFn: async () => {
      const res = await apiRequest('GET', `/api/user/search?q=${encodeURIComponent(debounced)}`);
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || 'Search failed');
      }
      return await res.json().catch(() => null);
    },
    retry: 0,
    staleTime: 30_000,
  });

  const sendReqMut = useMutation({
    mutationFn: async (toUserId: string) => {
      if (!CURRENT_USER_ID) throw new Error('Invalid session. Please login again.');
      const res = await apiRequest('POST', '/api/friend-requests', { toUserId });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Failed to send request');
      }
      return await res.json().catch(() => null);
    },
    onMutate: async () => {
      toast({ title: 'Sending', description: 'Sending friend request…' });
    },
    onError: (err: any) => {
      toast({ title: 'Error', description: err?.message ?? 'Failed to send request', variant: 'destructive' });
    },
    onSuccess: () => {
      toast({ title: 'Success', description: 'Friend request sent' });
      queryClient.invalidateQueries({ queryKey: KEYS.pendingRequests });
    },
  });

  const handleSearchSubmit = useCallback(() => {
    if (!searchTerm.trim()) return;
    setSearchSubmitted(true);
    setDebounced(searchTerm.trim());
  }, [searchTerm]);

  // small UX helpers: display user result via shared component if present
  const renderSearchResult = () => {
    if (searchApiError) {
      return (
        <Card className="glass-effect shadow-xl">
          <CardContent className="p-6 text-center">
            <p className="text-red-600 dark:text-red-400">
              {String((searchApiError as any).message || 'Error searching for user')}
            </p>
          </CardContent>
        </Card>
      );
    }

    if (searchedUser) {
      // if you have a shared UserSearchResult, prefer it; else render inline
      return (
        <UserSearchResult
          user={searchedUser}
          onSendRequest={(id: string) => sendReqMut.mutate(id)}
        />
      );
    }

    if (!searchSubmitted && !isSearchingUser) {
      return (
        <Card className="border-dashed border-2 bg-card/50">
          <EmptyState
            icon={SearchIcon}
            title="Start discovering"
            description="Enter a username above to find people and send connection requests"
            variant="compact"
          />
        </Card>
      );
    }

    return null;
  };

  const requestsList = localRequests;

  // -----------------------------
  // Render
  // -----------------------------
  return (
    <div>
      <div className="w-full max-w-5xl mx-auto px-4 lg:px-8 py-10 lg:py-16 space-y-12">
        <PageHeader
          title="Connections"
          description="Discover and connect with people who share your interests."
          showBadge
          badgeText="Your Network"
        />

        <section aria-labelledby="search-section" className="space-y-5">
          {/* ---------- Header + Professional Bell (replace your current header block) ---------- */}
<div className="flex items-center justify-between gap-4">
  {/* Left: Section header (Find People) */}
  <div className="flex-1 min-w-0">
    <SectionHeader
      title="Find People"
      description="Search by username to discover and connect"
      id="search-section"
      icon={SearchIcon}
    />
  </div>

  {/* Right: Professional Bell button */}
  <div className="flex items-center ml-4">
    <button
      type="button"
      onClick={() => setIsBellOpen(true)}
      title={pendingCount > 0 ? `${pendingCount} pending request${pendingCount === 1 ? '' : 's'}` : 'No pending requests'}
      aria-label={`Pending requests: ${pendingCount}`}
      className={`
        relative inline-flex items-center justify-center
        w-11 h-11 rounded-full
        bg-white/80 dark:bg-gray-800/80
        border border-gray-200 dark:border-gray-700
        shadow-sm
        hover:shadow-md
        transition-shadow duration-150
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
        focus:ring-offset-white dark:focus:ring-offset-gray-800
      `}
    >
      {/* Bell icon (slightly bolder stroke for professional look) */}
      <Bell className="w-5 h-5 text-gray-700 dark:text-gray-200" />

      {/* Unread badge (small red dot) */}
      {pendingCount > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 inline-flex h-3 w-3 items-center justify-center"
          aria-hidden="true"
        >
          <span className="relative inline-flex h-3 w-3 rounded-full bg-red-600" />
          {/* optional subtle ping */}
          <span className="absolute inline-flex h-full w-full rounded-full bg-red-600 opacity-75 animate-ping" />
        </span>
      )}
    </button>
  </div>
</div>
{/* ---------- end header + bell ---------- */}


          {/* Search input */}
          <Card className="glass-effect shadow-xl">
            <CardContent className="p-6">
              <div className="flex space-x-2">
                <div className="relative flex-1">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    type="text"
                    placeholder="Enter User ID (e.g., user123)"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setSearchSubmitted(false);
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                    className="pl-10"
                    aria-label="Search users by register ID"
                  />
                </div>
                <Button
                  onClick={handleSearchSubmit}
                  disabled={!searchTerm.trim() || isSearchingUser}
                  className="bg-gradient-to-r from-primary to-secondary hover:shadow-lg"
                >
                  {isSearchingUser ? 'Searching…' : 'Search'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Search results / states */}
          {renderSearchResult()}
        </section>

        {/* Bell modal */}
        {isBellOpen && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="pending-dialog-title"
            className="fixed inset-0 z-50 flex items-start justify-center p-4"
          >
            <div
              className="fixed inset-0 bg-black/40"
              onClick={() => setIsBellOpen(false)}
              aria-hidden="true"
            />

            <div className="relative z-50 w-full max-w-lg mx-auto mt-20">
              <Card className="shadow-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h3 id="pending-dialog-title" className="text-lg font-semibold">
                        Pending Requests
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {pendingCount} request{pendingCount !== 1 ? 's' : ''}
                      </p>
                    </div>

                    <button
                      onClick={() => setIsBellOpen(false)}
                      aria-label="Close pending requests"
                      className="p-2 rounded hover:bg-muted/20"
                    >
                      <XIcon className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-3 max-h-72 overflow-auto">
                    {isPendingLoading ? (
                      <>
                        <SkeletonCard variant="request" />
                        <SkeletonCard variant="request" />
                      </>
                    ) : requestsList.length === 0 ? (
                      <Card className="bg-card/50 border-dashed border-2">
                        <CardContent className="p-4 text-center">
                          <p className="text-sm text-muted-foreground">No pending requests</p>
                        </CardContent>
                      </Card>
                    ) : (
                      requestsList.map((req) => {
                        const id = (req._id ?? req.id) as string;
                        const from = req.fromUser ?? {};
                        const displayName =
                          (from.firstName && from.lastName) ? `${from.firstName} ${from.lastName}` : from.fullName ?? from.username ?? from.registerId ?? 'Unknown';
                        const avatarInitials = initials(displayName);

                        return (
                          <div key={id} className="flex items-center justify-between gap-3 p-2 rounded hover:bg-muted/5">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10 bg-gradient-to-br from-primary to-secondary">
                                <AvatarFallback className="text-white font-bold">{avatarInitials}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{from.registerId ?? from.username ?? displayName}</div>
                                <div className="text-xs text-muted-foreground">{from.email ?? ''}</div>
                                <div className="text-xs text-muted-foreground">
                                  {req.createdAt ? new Date(req.createdAt).toLocaleString() : ''}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                onClick={() => {
                                  // keep modal open for multi-action UX; close only on explicit close
                                  handleAccept(id);
                                }}
                                size="sm"
                                className="bg-gradient-to-r from-accent to-green-500"
                              >
                                <Check size={14} className="mr-1" />
                                Accept
                              </Button>

                              <Button
                                onClick={() => {
                                  handleReject(id);
                                }}
                                size="sm"
                                variant="destructive"
                              >
                                Reject
                              </Button>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Optional full pending section (kept commented for compact UX) */}
        {/* You can uncomment this if you want the full grid below the search */}
        {/*
        <section aria-labelledby="pending-section" className="space-y-5">
          <SectionHeader
            title="Pending Requests"
            description="People waiting to connect with you"
            count={requestsList.length}
            id="pending-section"
            icon={Bell}
          />
          {isPendingLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SkeletonCard variant="request" />
              <SkeletonCard variant="request" />
            </div>
          ) : requestsList.length === 0 ? (
            <Card className="border-dashed border-2 bg-card/50">
              <EmptyState
                icon={Users}
                title="All caught up!"
                description="You don't have any pending requests."
                variant="compact"
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requestsList.map((req) => (
                <FriendRequestCard key={req._id ?? req.id} request={req as any} onAccept={handleAccept} onReject={handleReject} />
              ))}
            </div>
          )}
        </section>
        */}

        <section aria-labelledby="features-section" className="space-y-5">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <UserPlusIcon className="w-4 h-4" />
            <span className="text-xs font-medium tracking-wide uppercase">Why Connect</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Zap, title: 'Instant Connect', description: 'Send requests in one click', gradient: 'from-amber-500 to-orange-500' },
              { icon: Shield, title: 'Privacy First', description: 'You control who connects', gradient: 'from-emerald-500 to-teal-500' },
              { icon: Heart, title: 'Build Network', description: 'Grow your community', gradient: 'from-pink-500 to-rose-500' },
            ].map((feature) => (
              <Card key={feature.title} className="hover-elevate transition-all duration-300 group bg-card/80">
                <CardContent className="p-5">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div
                      className={`
                        w-12 h-12 rounded-xl 
                        bg-gradient-to-br ${feature.gradient} 
                        flex items-center justify-center
                        group-hover:scale-110 transition-transform duration-300
                      `}
                    >
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
