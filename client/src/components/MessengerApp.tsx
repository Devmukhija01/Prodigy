// // // MessengerApp.tsx (patched)
// import React, { useState, useEffect, useRef } from "react";
// import { ChatSidebar } from "@/components/messenger/ChatSidebar";
// import { ChatWindow } from "@/components/messenger/ChatWindow";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { apiRequest } from "@/lib/queryClient";
// import { useSocket } from "@/hooks/useSocket";
// import { useAuth } from "@/hooks/useAuth";
// import { Button } from "@/components/ui/button";
// import { Send } from "lucide-react";

// // types (adjust as needed)
// type User = {
//   _id: string;
//   firstName?: string;
//   lastName?: string;
//   avatar?: string;
// };

// type Group = {
//   _id: string;
//   name: string;
//   avatar?: string;
// };

// type Message = {
//   _id?: string;
//   fromUserId: string;
//   toUserId?: string;
//   groupId?: string;
//   content: string;
//   timestamp: string | Date;
//   // optional event-like fields
//   event?: string;
//   friend?: User;
//   // shape may differ from WS; we handle defensively
// };

// export function MessengerApp() {
//   const { user, isAuthenticated, isLoading } = useAuth();
//   const queryClient = useQueryClient();

//   // UI state
//   const [selectedChat, setSelectedChat] = useState<{
//     type: "friend" | "group" | null;
//     data: User | Group | null;
//   }>({ type: null, data: null });
//   const [messageInput, setMessageInput] = useState("");
//   const [chatMessages, setChatMessages] = useState<Message[]>([]);
//   const [showMobileChat, setShowMobileChat] = useState(false);
//   const messagesEndRef = useRef<HTMLDivElement | null>(null);

//   // UseSocket: returns array of messages/events, map of statuses, sendMessage fn
//   const {
//     messages: wsMessages = [],
//     userStatuses = new Map<string, boolean>(),
//     sendMessage: sendWebSocketMessage,
//   } = useSocket(user?._id || "");

//   // ---------- queries (hooks must run in same order every render) ----------
//   const { data: friends = [] } = useQuery({
//     queryKey: ["/api/friend-requests/accepted", user?._id],
//     queryFn: async () => {
//       const res = await apiRequest("GET", `/api/friend-requests/accepted/${user?._id}`);
//       return res.json();
//     },
//     enabled: !!user?._id,
//   });

//   const { data: groups = [] } = useQuery({
//     queryKey: ["/api/groups/accepted", user?._id],
//     queryFn: async () => {
//       const res = await apiRequest("GET", `/api/groups/accepted/${user?._id}`);
//       return res.json();
//     },
//     enabled: !!user?._id,
//   });

//   // messages for the selected chat from server
//   const { data: messagesData = [] } = useQuery({
//     queryKey: ["/api/messages", selectedChat.type, (selectedChat.data as any)?._id],
//     queryFn: async () => {
//       if (!selectedChat.data) return [];
//       if (selectedChat.type === "friend") {
//         const friend = selectedChat.data as User;
//         const res = await apiRequest("GET", `/api/messages/${friend._id}`);
//         return res.json();
//       } else {
//         const group = selectedChat.data as Group;
//         const res = await apiRequest("GET", `/api/messages/group/${group._id}`);
//         return res.json();
//       }
//     },
//     enabled: !!selectedChat.data && !!user?._id,
//   });

//   // ---------- refs to avoid re-processing WS events / message loops ----------
//   const processedWsIdsRef = useRef<Set<string>>(new Set()); // track WS message/event ids (if present)
//   const processedWsIndexRef = useRef<number>(0); // if wsMessages is an append-only array, track index
//   const lastMessagesDataSnapshotRef = useRef<string | null>(null); // fingerprint of last messagesData set to state

//   // ---------- sync server-fetched messages into local state (only when changed) ----------
//   useEffect(() => {
//     try {
//       // create a simple fingerprint for messagesData: length + first/last id (if present)
//       const firstId = (messagesData && messagesData.length > 0 && (messagesData[0] as any)?._id) || "";
//       const lastId = (messagesData && messagesData.length > 0 && (messagesData[messagesData.length - 1] as any)?._id) || "";
//       const fingerprint = `${messagesData.length}:${firstId}:${lastId}`;

//       if (lastMessagesDataSnapshotRef.current !== fingerprint) {
//         // only update when fingerprint changes
//         setChatMessages(messagesData as Message[]);
//         lastMessagesDataSnapshotRef.current = fingerprint;
//       }
//     } catch (e) {
//       // fallback: set directly but keep defensive
//       setChatMessages(messagesData as Message[]);
//       lastMessagesDataSnapshotRef.current = null;
//     }
//   }, [messagesData]);

//   // ---------- helper: add friend to cache and optionally open chat (defensive) ----------
//   const handleAddFriend = (friend: User, openChat = true) => {
//     if (!user?._id || !friend?._id) return;

//     const cacheKey = ["/api/friend-requests/accepted", user._id];
//     const existing: User[] | undefined = queryClient.getQueryData(cacheKey) as any;

//     const alreadyExists = !!existing?.find((f) => String(f._id) === String(friend._id));
//     if (!alreadyExists) {
//       queryClient.setQueryData<User[] | undefined>(cacheKey, (old = []) => {
//         // double-check duplicate before appending
//         if (!old.find((f) => String(f._id) === String(friend._id))) {
//           return [...old, friend];
//         }
//         return old;
//       });
//     }

//     if (openChat) {
//       // only open if not already selected
//       const alreadySelected =
//         selectedChat.type === "friend" && (selectedChat.data as User)?._id === friend._id;
//       if (!alreadySelected) {
//         setSelectedChat({ type: "friend", data: friend });
//         setShowMobileChat(true);
//       }
//     }
//   };

//   // ---------- example mutation to accept friend (if used elsewhere) ----------
//   const acceptFriendMutation = useMutation({
//     mutationFn: async (requestId: string) => {
//       const res = await apiRequest("POST", "/api/friend-requests/accept", { requestId });
//       return res.json(); // expect friend object
//     },
//     onSuccess: (friend: User) => {
//       handleAddFriend(friend, true);
//     },
//   });

//   // ---------- process WS events (friend-accepted etc) in a de-duped way ----------
//   useEffect(() => {
//     if (!wsMessages || !user?._id) return;

//     // If wsMessages is append-only array, we can iterate from processedWsIndexRef.current
//     // Otherwise we defensively loop over all and use id-based dedupe.
//     const startIndex = processedWsIndexRef.current || 0;
//     for (let i = startIndex; i < wsMessages.length; i++) {
//       const ev: any = wsMessages[i];
//       // if event has unique id, dedupe by it; else dedupe by JSON string (less ideal)
//       const evId = ev && (ev._id || ev.id || ev.eventId || JSON.stringify(ev));
//       if (evId && processedWsIdsRef.current.has(String(evId))) {
//         // already processed
//         continue;
//       }

//       // mark processed right away to prevent re-entry
//       if (evId) processedWsIdsRef.current.add(String(evId));

//       // friend accepted variants
//       if (ev?.event === "friend-accepted" && ev.friend) {
//         handleAddFriend(ev.friend as User, true);
//       } else if (ev?.type === "friend-request-accepted" && ev.friend) {
//         handleAddFriend(ev.friend as User, true);
//       } else if (ev?.payload?.event === "friend-accepted" && ev.payload?.friend) {
//         handleAddFriend(ev.payload.friend as User, true);
//       }

//       // also support direct message-like WS objects that look like messages
//       if (ev && ev.fromUserId && (ev.toUserId || ev.groupId) && ev.content) {
//         // if this message is for our selected chat, append it below in the "incoming messages" effect
//         // we'll still mark as processed so we don't double-append here
//       }
//       // advance processed index
//       processedWsIndexRef.current = i + 1;
//     }
//   }, [wsMessages, user?._id, queryClient, selectedChat]); // safe deps

//   // ---------- append incoming chat messages relevant to selected chat (de-duplicate) ----------
//   useEffect(() => {
//     if (!selectedChat.data || !user?._id || !wsMessages) return;

//     // gather potential new messages from wsMessages (only those that look like messages)
//     const potentialNew: Message[] = [];
//     for (const ev of wsMessages) {
//       if (!ev) continue;
//       // simple shape-check: must have content and a fromUserId
//       if (ev.content && ev.fromUserId) {
//         // determine if it belongs to current chat
//         if (selectedChat.type === "friend") {
//           const friend = selectedChat.data as User;
//           const belongs =
//             (String(ev.fromUserId) === String(friend._id) && String(ev.toUserId) === String(user._id)) ||
//             (String(ev.fromUserId) === String(user._id) && String(ev.toUserId) === String(friend._id));
//           if (belongs) potentialNew.push(ev as Message);
//         } else {
//           const group = selectedChat.data as Group;
//           if (String(ev.groupId) === String(group._id)) potentialNew.push(ev as Message);
//         }
//       }
//     }

//     if (potentialNew.length === 0) return;

//     // filter out messages already present in chatMessages (by _id if possible)
//     const existingIds = new Set(chatMessages.map((m) => String(m._id || m.content + m.timestamp)));
//     const filtered = potentialNew.filter((m) => !existingIds.has(String(m._id || m.content + m.timestamp)));

//     if (filtered.length > 0) {
//       // append once
//       setChatMessages((prev) => {
//         // also ensure we don't accidentally create a loop by returning same array reference with same items
//         const merged = [...prev, ...filtered];
//         return merged;
//       });
//     }
//   }, [wsMessages, selectedChat, user?._id, chatMessages]);

//   // scroll to bottom when chatMessages actually change
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [chatMessages.length]);

//   // ---------- send message mutation ----------
//   const sendMessageMutation = useMutation({
//     mutationFn: async (content: string) => {
//       if (!user?._id || !selectedChat.data) return null;

//       if (selectedChat.type === "friend") {
//         const friend = selectedChat.data as User;
//         // send via websocket for real-time
//         sendWebSocketMessage(friend._id, content);
//         // persist via API
//         const res = await apiRequest("POST", "/api/messages", {
//           fromUserId: user._id,
//           toUserId: friend._id,
//           content,
//         });
//         return res.json();
//       } else {
//         const group = selectedChat.data as Group;
//         sendWebSocketMessage(group._id, content, true);
//         const res = await apiRequest("POST", "/api/messages/group", {
//           fromUserId: user._id,
//           groupId: group._id,
//           content,
//         });
//         return res.json();
//       }
//     },
//     onSuccess: (message: any) => {
//       // append the server-confirmed message if not already present
//       if (!message) return;
//       setChatMessages((prev) => {
//         const exists = prev.find((m) => String(m._id) === String(message._id));
//         if (exists) return prev;
//         return [...prev, message];
//       });

//       // optionally invalidate messages query for server canonical data
//       queryClient.invalidateQueries({
//         queryKey: ["/api/messages", selectedChat.type, (selectedChat.data as any)?._id],
//       });
//     },
//   });

//   const handleSendMessage = () => {
//     if (!messageInput.trim() || !selectedChat.data) return;
//     // optimistic local add (optional): create a temp id so dedupe checks work
//     const temp: Message = {
//       _id: `temp-${Date.now()}`,
//       fromUserId: user._id,
//       content: messageInput.trim(),
//       timestamp: new Date(),
//       toUserId: selectedChat.type === "friend" ? (selectedChat.data as User)._id : undefined,
//       groupId: selectedChat.type === "group" ? (selectedChat.data as Group)._id : undefined,
//     };
//     setChatMessages((prev) => [...prev, temp]);
//     // send to server
//     sendMessageMutation.mutate(messageInput.trim());
//     setMessageInput("");
//   };

//   // ---------- helpers ----------
//   const formatTime = (date: string | Date) =>
//     new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

//   const getInitials = (name: string) =>
//     (name || "").split(" ").map((n) => n[0] ?? "").join("").toUpperCase();

//   // derived plain lists (no hooks)
//   const friendsList = friends as User[];
//   const groupsList = groups as Group[];

//   // early returns after hooks
//   if (isLoading) return <div className="text-center p-8">Loading chat...</div>;
//   if (!isAuthenticated || !user?._id) return <div className="text-center p-8">Please log in to use chat.</div>;

//   return (
//     <div className="h-screen flex bg-background overflow-hidden">
//       <div
//         className={`
//           w-full lg:w-72 lg:border-r border-border flex-shrink-0
//           ${showMobileChat ? "hidden lg:flex" : "flex"}
//           flex-col
//           max-h-screen overflow-y-auto
//         `}
//       >
//         <ChatSidebar
//           friends={friendsList}
//           groups={groupsList}
//           selectedChatId={(selectedChat.data as any)?._id}
//           onSelectChat={(id: string, type: "friend" | "group") => {
//             if (type === "friend") {
//               const friend = friendsList.find((f) => f._id === id);
//               if (friend) {
//                 setSelectedChat({ type: "friend", data: friend });
//                 setShowMobileChat(true);
//               }
//             } else {
//               const group = groupsList.find((g) => g._id === id);
//               if (group) {
//                 setSelectedChat({ type: "group", data: group });
//                 setShowMobileChat(true);
//               }
//             }
//           }}
//         />
//       </div>

//       <div
//         className={`
//           flex-1 flex flex-col min-w-0
//           ${showMobileChat ? "flex" : "hidden lg:flex"}
//           max-h-screen overflow-y-auto
//         `}
//       >
//         <ChatWindow
//           chat={selectedChat.data ? { type: selectedChat.type, data: selectedChat.data } : null}
//           messages={chatMessages}
//           currentUserId={user._id}
//           onSendMessage={handleSendMessage}
//           onBack={() => setShowMobileChat(false)}
//           showBackButton={showMobileChat}
//           messagesEndRef={messagesEndRef}
//         />
//       </div>
//     </div>
//   );
// }





// MessengerApp.tsx — cleaned and fixed
// import React, { useState, useEffect, useRef } from "react";
// import { ChatSidebar } from "@/components/messenger/ChatSidebar";
// import { ChatWindow } from "@/components/messenger/ChatWindow";
// import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
// import { apiRequest } from "@/lib/queryClient";
// import { useSocket } from "@/hooks/useSocket";
// import { useAuth } from "@/hooks/useAuth";
// import { Button } from "@/components/ui/button";
// import { Send } from "lucide-react";

// type User = {
//   _id: string;
//   firstName?: string;
//   lastName?: string;
//   avatar?: string;
//   lastMessage?: string;
//   timestamp?: string;
//   unreadCount?: number;
//   isOnline?: boolean;
// };

// type Group = {
//   _id: string;
//   name?: string;
//   avatar?: string;
//   lastMessage?: string;
//   timestamp?: string;
//   unreadCount?: number;
// };

// type Message = {
//   _id?: string;
//   fromUserId?: string;
//   toUserId?: string;
//   groupId?: string;
//   content?: string;
//   timestamp?: string | Date;
//   event?: string;
//   friend?: any;
// };

// export function MessengerApp() {
//   const { user, isAuthenticated, isLoading } = useAuth();
//   const queryClient = useQueryClient();

//   const [selectedChat, setSelectedChat] = useState<{
//     type: "friend" | "group" | null;
//     data: User | Group | null;
//   }>({ type: null, data: null });
//   const [messageInput, setMessageInput] = useState("");
//   const [chatMessages, setChatMessages] = useState<Message[]>([]);
//   const [showMobileChat, setShowMobileChat] = useState(false);
//   const messagesEndRef = useRef<HTMLDivElement | null>(null);

//   // socket provides incremental messages/events
//   const {
//     messages: wsMessages = [],
//     userStatuses = new Map<string, boolean>(),
//     sendMessage: sendWebSocketMessage,
//   } = useSocket(user?._id || "");

//   // ---------- queries ----------
//   const { data: friends = [] } = useQuery({
//     queryKey: ["/api/friend-requests/accepted", user?._id],
//     queryFn: async () => {
//       const res = await apiRequest("GET", `/api/friend-requests/accepted/${user?._id}`);
//       return res.json();
//     },
//     enabled: !!user?._id,
//   });

//   // ---------- robust groups query: try multiple endpoints and normalize result ----------
//   const { data: groups = [], status: groupsStatus } = useQuery({
//     queryKey: ["/api/groups/accepted", user?._id, "robust"],
//     queryFn: async () => {
//       if (!user?._id) return [];

//       const userId = user._id;
//       // candidate endpoints to try in order
//       const candidates = [
//         `/api/groups/accepted/${userId}`, // original
//         `/api/groups/user/${userId}`,
//         `/api/users/${userId}/groups`,
//         `/api/groups/member-of/${userId}`,
//         `/api/groups/mine/${userId}`,
//       ];

//       const errors: any[] = [];

//       // helper wrapper that uses your apiRequest function and returns parsed JSON
//       const tryFetch = async (url: string) => {
//         try {
//           const res = await apiRequest("GET", url);
//           if (res && typeof (res as any).json === "function") {
//             const json = await (res as Response).json();
//             return { ok: true, json };
//           }
//           return { ok: true, json: res };
//         } catch (err) {
//           return { ok: false, err };
//         }
//       };

//       for (const url of candidates) {
//         const r = await tryFetch(url);
//         if (!r.ok) {
//           errors.push({ url, error: String(r.err) });
//           continue;
//         }

//         const json = r.json;
//         // Accept either an array or an object with `.data` array
//         if (Array.isArray(json)) {
//           console.info(`[groups] loaded from ${url}`);
//           return json;
//         }
//         if (json && Array.isArray(json.data)) {
//           console.info(`[groups] loaded from ${url} (data wrapper)`);
//           return json.data;
//         }

//         // Not expected shape
//         errors.push({ url, reason: "unexpected-shape", payload: json });
//       }

//       console.error("[groups] none of the candidate endpoints returned a groups array:", errors);
//       return []; // graceful fallback
//     },
//     enabled: !!user?._id,
//     staleTime: 30_000,
//   });

//   // quick debug logs (can remove later)
//   useEffect(() => {
//     console.debug("DEBUG friends:", friends);
//   }, [friends]);
//   useEffect(() => {
//     console.debug("DEBUG groups:", groups, "status:", groupsStatus);
//     if (groupsStatus !== "idle" && groupsStatus !== "loading" && Array.isArray(groups) && groups.length === 0) {
//       console.warn("Groups list is empty — check backend endpoint or the candidate endpoints tried. See console for details.");
//     }
//   }, [groups, groupsStatus]);

//   // ---------- normalize lists for UI (ensure _id exists and names are present) ----------
//   const friendsList = (friends || []).map((f: any) => ({
//     _id: f._id ?? f.id,
//     firstName: f.firstName ?? f.first_name ?? (typeof f.name === "string" ? f.name.split(" ")[0] : ""),
//     lastName: f.lastName ?? f.last_name ?? (typeof f.name === "string" ? f.name.split(" ").slice(1).join(" ") : ""),
//     avatar: f.avatar ?? f.picture,
//     lastMessage: f.lastMessage ?? f.last_message,
//     timestamp: f.timestamp,
//     unreadCount: f.unreadCount ?? f.unread_count,
//     isOnline: f.isOnline ?? f.online,
//   }));

//   const groupsList = (groups || []).map((g: any) => ({
//     _id: g._id ?? g.id,
//     name: g.name ?? g.title ?? g.groupName ?? "",
//     avatar: g.avatar ?? g.picture,
//     lastMessage: g.lastMessage ?? g.last_message,
//     timestamp: g.timestamp,
//     unreadCount: g.unreadCount ?? g.unread_count,
//   }));

//   const { data: messagesData = [] } = useQuery({
//     queryKey: ["/api/messages", selectedChat.type, (selectedChat.data as any)?._id],
//     queryFn: async () => {
//       if (!selectedChat.data) return [];
//       if (selectedChat.type === "friend") {
//         const friend = selectedChat.data as User;
//         const res = await apiRequest("GET", `/api/messages/${friend._id}`);
//         return res.json();
//       } else {
//         const group = selectedChat.data as Group;
//         const res = await apiRequest("GET", `/api/messages/group/${group._id}`);
//         return res.json();
//       }
//     },
//     enabled: !!selectedChat.data && !!user?._id,
//   });

//   // ---------- dedupe refs for WS processing ----------
//   const processedWsIdsRef = useRef<Set<string>>(new Set());
//   const processedWsIndexRef = useRef<number>(0);

//   // ---------- sync server messages -> local state (guarded by fingerprint) ----------
//   const lastMessagesDataFingerprintRef = useRef<string | null>(null);
//   useEffect(() => {
//     try {
//       const len = (messagesData && messagesData.length) || 0;
//       const firstId = len > 0 ? String((messagesData[0] as any)?._id || "") : "";
//       const lastId = len > 0 ? String((messagesData[len - 1] as any)?._id || "") : "";
//       const fingerprint = `${len}:${firstId}:${lastId}`;

//       if (lastMessagesDataFingerprintRef.current !== fingerprint) {
//         lastMessagesDataFingerprintRef.current = fingerprint;
//         setChatMessages(messagesData as Message[]);
//       }
//     } catch (err) {
//       lastMessagesDataFingerprintRef.current = `fallback:${Date.now()}`;
//       setChatMessages(messagesData as Message[]);
//     }
//   }, [messagesData]);

//   // ---------- process wsMessages once each (dedupe) and append relevant messages ----------
//   useEffect(() => {
//     if (!wsMessages || wsMessages.length === 0) return;
//     if (!selectedChat.data || !user?._id) return;

//     const startIndex = processedWsIndexRef.current || 0;
//     const newItems: Message[] = [];

//     for (let i = startIndex; i < wsMessages.length; i++) {
//       const ev: any = wsMessages[i];
//       if (!ev) {
//         processedWsIndexRef.current = i + 1;
//         continue;
//       }

//       const evId =
//         ev._id ||
//         ev.id ||
//         ev.eventId ||
//         JSON.stringify({
//           from: ev.fromUserId,
//           to: ev.toUserId,
//           g: ev.groupId,
//           c: ev.content,
//           t: ev.timestamp,
//         });

//       if (processedWsIdsRef.current.has(String(evId))) {
//         processedWsIndexRef.current = i + 1;
//         continue;
//       }

//       processedWsIdsRef.current.add(String(evId));

//       if (ev.event === "friend-accepted" || ev.type === "friend-request-accepted" || ev.event === "friendAccepted") {
//         processedWsIndexRef.current = i + 1;
//         continue;
//       }

//       const looksLikeMessage = ev.content && (ev.fromUserId || ev.groupId || ev.toUserId);
//       if (!looksLikeMessage) {
//         processedWsIndexRef.current = i + 1;
//         continue;
//       }

//       const belongsToSelected =
//         selectedChat.type === "friend"
//           ? ((String(ev.fromUserId) === String((selectedChat.data as User)._id) && String(ev.toUserId) === String(user._id)) ||
//               (String(ev.fromUserId) === String(user._id) && String(ev.toUserId) === String((selectedChat.data as User)._id)))
//           : String(ev.groupId) === String((selectedChat.data as Group)._id);

//       if (belongsToSelected) newItems.push(ev as Message);

//       processedWsIndexRef.current = i + 1;
//     }

//     if (newItems.length === 0) return;

//     setChatMessages((prev) => {
//       const existing = new Set(prev.map((m) => String(m._id || (m.content || "") + String(m.timestamp || ""))));
//       const toAdd = newItems.filter((m) => !existing.has(String(m._id || (m.content || "") + String(m.timestamp || ""))));
//       if (toAdd.length === 0) return prev;
//       return [...prev, ...toAdd];
//     });
//   }, [wsMessages, selectedChat, user?._id]);

//   // ---------- send message (optimistic) and persist ----------
//   const sendMessageMutation = useMutation({
//     mutationFn: async (payload: { content: string }) => {
//       if (!user?._id || !selectedChat.data) return null;
//       const content = payload.content;
//       if (selectedChat.type === "friend") {
//         const friend = selectedChat.data as User;
//         sendWebSocketMessage(friend._id, content);
//         const res = await apiRequest("POST", "/api/messages", {
//           fromUserId: user._id,
//           toUserId: friend._id,
//           content,
//         });
//         return res.json();
//       } else {
//         const group = selectedChat.data as Group;
//         sendWebSocketMessage(group._id, content, true);
//         const res = await apiRequest("POST", "/api/messages/group", {
//           fromUserId: user._id,
//           groupId: group._id,
//           content,
//         });
//         return res.json();
//       }
//     },
//     onSuccess: (message: any) => {
//       if (!message) return;
//       setChatMessages((prev) => {
//         const exists = prev.find((m) => m._id && message._id && String(m._id) === String(message._id));
//         if (exists) return prev;
//         return [...prev, message];
//       });
//       queryClient.invalidateQueries({
//         queryKey: ["/api/messages", selectedChat.type, (selectedChat.data as any)?._id],
//       });
//     },
//   });

//   const handleSendMessage = (overrideText?: string) => {
//     const text = (overrideText ?? messageInput).trim();
//     if (!text || !selectedChat.data) return;

//     const temp: Message = {
//       _id: `temp-${Date.now()}`,
//       fromUserId: user._id,
//       content: text,
//       timestamp: new Date().toISOString(),
//       toUserId: selectedChat.type === "friend" ? (selectedChat.data as User)._id : undefined,
//       groupId: selectedChat.type === "group" ? (selectedChat.data as Group)._id : undefined,
//     };

//     setChatMessages((prev) => [...prev, temp]);
//     setMessageInput("");
//     sendMessageMutation.mutate({ content: text });
//   };

//   // scroll to bottom when chatMessages length changes
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//   }, [chatMessages.length]);

//   // ---------- selection handler passed to Sidebar ----------
//   const handleSidebarSelect = (id: string, type: "friend" | "group") => {
//     if (type === "friend") {
//       const friend = friendsList.find((f) => String(f._id) === String(id));
//       if (!friend) {
//         console.warn("Selected friend not found:", id);
//         return;
//       }
//       setSelectedChat({ type: "friend", data: friend });
//       setShowMobileChat(true);
//       processedWsIndexRef.current = 0;
//     } else {
//       const group = groupsList.find((g) => String(g._id) === String(id));
//       if (!group) {
//         console.warn("Selected group not found:", id);
//         return;
//       }
//       setSelectedChat({ type: "group", data: group });
//       setShowMobileChat(true);
//       processedWsIndexRef.current = 0;
//     }
//   };

//   if (isLoading) return <div className="text-center p-8">Loading chat...</div>;
//   if (!isAuthenticated || !user?._id) return <div className="text-center p-8">Please log in to use chat.</div>;

//   return (
//     <div className="h-screen flex bg-background overflow-hidden">
//       <div
//         className={`
//           w-full lg:w-72 lg:border-r border-border flex-shrink-0
//           ${showMobileChat ? "hidden lg:flex" : "flex"}
//           flex-col
//           max-h-screen overflow-y-auto
//         `}
//       >
//         <ChatSidebar
//           friends={friendsList}
//           groups={groupsList}
//           selectedChatId={(selectedChat.data as any)?._id}
//           onSelectChat={handleSidebarSelect}
//         />
//       </div>

//       <div
//         className={`
//           flex-1 flex flex-col min-w-0
//           ${showMobileChat ? "flex" : "hidden lg:flex"}
//           max-h-screen overflow-y-auto
//         `}
//       >
//         <ChatWindow
//           chat={selectedChat.data ? { type: selectedChat.type, data: selectedChat.data } : null}
//           messages={chatMessages}
//           currentUserId={user._id}
//           onSendMessage={(c?: string) => handleSendMessage(c)}
//           onBack={() => setShowMobileChat(false)}
//           showBackButton={showMobileChat}
//           messagesEndRef={messagesEndRef}
//         />
//       </div>
//     </div>
//   );
// }




// src/components/messenger/MessengerApp.tsx
import React, { useEffect, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ChatSidebar } from "@/components/messenger/ChatSidebar";
import ChatWindow from "@/components/messenger/ChatWindow";
import { apiRequest } from "@/lib/queryClient";
import { useSocket } from "@/hooks/useSocket";
import { useAuth } from "@/hooks/useAuth";

type User = {
  _id: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  lastMessage?: string;
  timestamp?: string;
  unreadCount?: number;
  isOnline?: boolean;
  // backend shape variations may include id / name / picture etc.
  [k: string]: any;
};

type Group = {
  _id: string;
  name?: string;
  avatar?: string;
  lastMessage?: string;
  timestamp?: string;
  unreadCount?: number;
  [k: string]: any;
};

type Message = {
  _id?: string;
  fromUserId?: string;
  toUserId?: string;
  groupId?: string;
  content?: string;
  timestamp?: string | Date;
  event?: string;
  friend?: any;
  [k: string]: any;
};

export function MessengerApp() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();

  // Selected chat kept as resolved object { type, data }
  const [selectedChat, setSelectedChat] = useState<{
    type: "friend" | "group" | null;
    data: User | Group | null;
  }>({ type: null, data: null });

  const [messageInput, setMessageInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Socket provides incremental messages/events + userStatuses + sendMessage
  const {
    messages: wsMessages = [],
    userStatuses = new Map<string, boolean>(),
    sendMessage: sendWebSocketMessage,
  } = useSocket(user?._id || "");

  // ---------- API queries ----------
  const { data: rawFriends = [] } = useQuery({
    queryKey: ["/api/friend-requests/accepted", user?._id],
    queryFn: async () => {
      const res = await apiRequest("GET", `/api/friend-requests/accepted/${user?._id}`);
      return res.json();
    },
    enabled: !!user?._id,
  });

  // robust groups query: attempt multiple candidate endpoints (graceful fallback)
  const { data: rawGroups = [] } = useQuery({
    queryKey: ["/api/groups/accepted", user?._id, "robust"],
    queryFn: async () => {
      if (!user?._id) return [];
      const userId = user._id;
      const candidates = [
        `/api/groups/accepted/${userId}`,
        `/api/groups/user/${userId}`,
        `/api/users/${userId}/groups`,
        `/api/groups/member-of/${userId}`,
        `/api/groups/mine/${userId}`,
      ];

      const tryFetch = async (url: string) => {
        try {
          const res = await apiRequest("GET", url);
          // apiRequest may return a Response or parsed JSON — handle both
          if (res && typeof (res as any).json === "function") {
            return await (res as Response).json();
          }
          return res;
        } catch (err) {
          return null;
        }
      };

      for (const url of candidates) {
        const json = await tryFetch(url);
        if (!json) continue;
        if (Array.isArray(json)) return json;
        if (json && Array.isArray((json as any).data)) return (json as any).data;
      }
      return [];
    },
    enabled: !!user?._id,
    staleTime: 30_000,
  });

  // ---------- normalize lists for UI ----------
  const friendsList: User[] = (rawFriends || []).map((f: any) => ({
    _id: f._id ?? f.id,
    firstName: f.firstName ?? f.first_name ?? (typeof f.name === "string" ? f.name.split(" ")[0] : ""),
    lastName: f.lastName ?? f.last_name ?? (typeof f.name === "string" ? f.name.split(" ").slice(1).join(" ") : ""),
    avatar: f.avatar ?? f.picture,
    lastMessage: f.lastMessage ?? f.last_message,
    timestamp: f.timestamp,
    unreadCount: f.unreadCount ?? f.unread_count,
    isOnline: f.isOnline ?? f.online,
    ...f,
  }));

  const groupsList: Group[] = (rawGroups || []).map((g: any) => ({
    _id: g._id ?? g.id,
    name: g.name ?? g.title ?? g.groupName ?? "",
    avatar: g.avatar ?? g.picture,
    lastMessage: g.lastMessage ?? g.last_message,
    timestamp: g.timestamp,
    unreadCount: g.unreadCount ?? g.unread_count,
    ...g,
  }));

  // ---------- messages for selected chat ----------
  const { data: messagesData = [] } = useQuery({
    queryKey: ["/api/messages", selectedChat.type, (selectedChat.data as any)?._id],
    queryFn: async () => {
      if (!selectedChat.data) return [];
      if (selectedChat.type === "friend") {
        const friend = selectedChat.data as User;
        const res = await apiRequest("GET", `/api/messages/${friend._id}`);
        return res.json();
      } else {
        const group = selectedChat.data as Group;
        const res = await apiRequest("GET", `/api/messages/group/${group._id}`);
        return res.json();
      }
    },
    enabled: !!selectedChat.data && !!user?._id,
  });

  // ---------- refs for dedupe ----------
  const processedWsIdsRef = useRef<Set<string>>(new Set());
  const processedWsIndexRef = useRef<number>(0);

  // ---------- sync server messages into local state (fingerprint guarded) ----------
  const lastMessagesDataFingerprintRef = useRef<string | null>(null);
  useEffect(() => {
    try {
      const len = (messagesData && messagesData.length) || 0;
      const firstId = len > 0 ? String((messagesData[0] as any)?._id || "") : "";
      const lastId = len > 0 ? String((messagesData[len - 1] as any)?._id || "") : "";
      const fingerprint = `${len}:${firstId}:${lastId}`;

      if (lastMessagesDataFingerprintRef.current !== fingerprint) {
        lastMessagesDataFingerprintRef.current = fingerprint;
        setChatMessages(messagesData as Message[]);
      }
    } catch (err) {
      lastMessagesDataFingerprintRef.current = `fallback:${Date.now()}`;
      setChatMessages(messagesData as Message[]);
    }
  }, [messagesData]);

  // ---------- process wsMessages once each (dedupe) and append relevant messages ----------
  useEffect(() => {
    if (!wsMessages || wsMessages.length === 0) return;
    if (!selectedChat.data || !user?._id) return;

    const startIndex = processedWsIndexRef.current || 0;
    const newItems: Message[] = [];

    for (let i = startIndex; i < wsMessages.length; i++) {
      const ev: any = wsMessages[i];
      if (!ev) {
        processedWsIndexRef.current = i + 1;
        continue;
      }

      const evId =
        ev._id ||
        ev.id ||
        ev.eventId ||
        JSON.stringify({
          from: ev.fromUserId,
          to: ev.toUserId,
          g: ev.groupId,
          c: ev.content,
          t: ev.timestamp,
        });

      if (processedWsIdsRef.current.has(String(evId))) {
        processedWsIndexRef.current = i + 1;
        continue;
      }

      processedWsIdsRef.current.add(String(evId));

      // ignore friend-accepted style events here (they are handled elsewhere)
      if (ev.event === "friend-accepted" || ev.type === "friend-request-accepted" || ev.event === "friendAccepted") {
        processedWsIndexRef.current = i + 1;
        continue;
      }

      const looksLikeMessage = ev.content && (ev.fromUserId || ev.groupId || ev.toUserId);
      if (!looksLikeMessage) {
        processedWsIndexRef.current = i + 1;
        continue;
      }

      const belongsToSelected =
        selectedChat.type === "friend"
          ? ((String(ev.fromUserId) === String((selectedChat.data as User)._id) && String(ev.toUserId) === String(user._id)) ||
              (String(ev.fromUserId) === String(user._id) && String(ev.toUserId) === String((selectedChat.data as User)._id)))
          : String(ev.groupId) === String((selectedChat.data as Group)._id);

      if (belongsToSelected) newItems.push(ev as Message);

      processedWsIndexRef.current = i + 1;
    }

    if (newItems.length === 0) return;

    setChatMessages((prev) => {
      const existing = new Set(prev.map((m) => String(m._id || (m.content || "") + String(m.timestamp || ""))));
      const toAdd = newItems.filter((m) => !existing.has(String(m._id || (m.content || "") + String(m.timestamp || ""))));
      if (toAdd.length === 0) return prev;
      return [...prev, ...toAdd];
    });
  }, [wsMessages, selectedChat, user?._id]);

  // ---------- send message (optimistic) ----------
  const sendMessageMutation = useMutation({
    mutationFn: async (payload: { content: string }) => {
      if (!user?._id || !selectedChat.data) return null;
      const content = payload.content;
      if (selectedChat.type === "friend") {
        const friend = selectedChat.data as User;
        // real-time
        sendWebSocketMessage(friend._id, content);
        // persist
        const res = await apiRequest("POST", "/api/messages", {
          fromUserId: user._id,
          toUserId: friend._id,
          content,
        });
        return res.json();
      } else {
        const group = selectedChat.data as Group;
        sendWebSocketMessage(group._id, content, true);
        const res = await apiRequest("POST", "/api/messages/group", {
          fromUserId: user._id,
          groupId: group._id,
          content,
        });
        return res.json();
      }
    },
    onSuccess: (message: any) => {
      if (!message) return;
      setChatMessages((prev) => {
        const exists = prev.find((m) => m._id && message._id && String(m._id) === String(message._id));
        if (exists) return prev;
        return [...prev, message];
      });
      queryClient.invalidateQueries({
        queryKey: ["/api/messages", selectedChat.type, (selectedChat.data as any)?._id],
      });
    },
  });

  const handleSendMessage = (overrideText?: string) => {
    const text = (overrideText ?? messageInput).trim();
    if (!text || !selectedChat.data || !user?._id) return;

    const temp: Message = {
      _id: `temp-${Date.now()}`,
      fromUserId: user._id,
      content: text,
      timestamp: new Date().toISOString(),
      toUserId: selectedChat.type === "friend" ? (selectedChat.data as User)._id : undefined,
      groupId: selectedChat.type === "group" ? (selectedChat.data as Group)._id : undefined,
    };

    setChatMessages((prev) => [...prev, temp]);
    setMessageInput("");
    sendMessageMutation.mutate({ content: text });
  };

  // scroll to bottom when messages array length changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages.length]);

  // ---------- sidebar selection handler ----------
  const handleSidebarSelect = (id: string, type: "friend" | "group") => {
    if (type === "friend") {
      const friend = friendsList.find((f) => String(f._id) === String(id));
      if (!friend) {
        console.warn("Selected friend not found:", id);
        return;
      }
      setSelectedChat({ type: "friend", data: friend });
      setShowMobileChat(true);
      // reset ws processing to include subsequent messages for newly selected chat
      processedWsIndexRef.current = 0;
    } else {
      const group = groupsList.find((g) => String(g._id) === String(id));
      if (!group) {
        console.warn("Selected group not found:", id);
        return;
      }
      setSelectedChat({ type: "group", data: group });
      setShowMobileChat(true);
      processedWsIndexRef.current = 0;
    }
  };

  // ---------- helpers ----------
  const formatTime = (date?: string | Date) => {
    if (!date) return "";
    try {
      return new Date(date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const getInitials = (name = "") =>
    (name || "").split(" ").map((n: string) => (n ? n[0] : "")).join("").toUpperCase();

  // early returns
  if (isLoading) return <div className="text-center p-8">Loading chat...</div>;
  if (!isAuthenticated || !user?._id) return <div className="text-center p-8">Please log in to use chat.</div>;

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Sidebar */}
      <div
        className={`
          w-full lg:w-72 lg:border-r border-border flex-shrink-0
          ${showMobileChat ? "hidden lg:flex" : "flex"}
          flex-col
          max-h-screen overflow-y-auto
        `}
      >
        <ChatSidebar
          friends={friendsList}
          groups={groupsList}
          selectedChatId={(selectedChat.data as any)?._id}
          onSelectChat={handleSidebarSelect}
        />
      </div>

      {/* Chat Window */}
      <div
        className={`
          flex-1 flex flex-col min-w-0
          ${showMobileChat ? "flex" : "hidden lg:flex"}
          max-h-screen overflow-y-auto
        `}
      >
        <ChatWindow
          chat={selectedChat.data ? { type: selectedChat.type as "friend" | "group", data: selectedChat.data } : null}
          messages={chatMessages}
          currentUserId={user._id}
          onSendMessage={(c?: string) => handleSendMessage(c)}
          onBack={() => setShowMobileChat(false)}
          showBackButton={showMobileChat}
          messagesEndRef={messagesEndRef}
        />
      </div>
    </div>
  );
}

export default MessengerApp;
