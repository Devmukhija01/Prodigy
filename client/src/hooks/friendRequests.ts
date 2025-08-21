import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { BASE_URL } from "../lib/queryClient";

// Fetch all pending requests
export function usePendingRequests() {
  return useQuery(["pendingRequests"], async () => {
    const res = await fetch(`${BASE_URL}/api/friend-requests/pending`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to fetch pending requests");
    return res.json();
  });
}

// Accept or reject a request
export function useUpdateFriendRequest() {
  const queryClient = useQueryClient();

  return useMutation(
    async ({ requestId, status }: { requestId: string; status: "accepted" | "rejected" }) => {
      const res = await fetch(`${BASE_URL}/api/friend-requests/${requestId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update request");
      return res.json();
    },
    {
      onSuccess: () => {
        // ✅ Refresh lists after accepting/rejecting
        queryClient.invalidateQueries(["pendingRequests"]);
        queryClient.invalidateQueries(["friends"]); // so chats also update
      },
    }
  );
}
