import { QueryClient, QueryFunction } from "@tanstack/react-query";

function getCookie(name: string): string | undefined {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return undefined;
}

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export const BASE_URL = "https://prodigy-59mg.onrender.com";

export const apiRequest = async (
  method: string,
  url: string,
  body?: any,
  headers: any = {}
) => {
  const token = getCookie("token"); // or however you're storing your token

  const response = await fetch(`${BASE_URL}${url}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include", // if needed for cookies
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "API request failed");
  }

  return response;
};


type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey.join("/") as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
// ✅ Get accepted friends (for chats)
export const getAcceptedFriends = async (userId: string) => {
  const response = await fetch(`https://prodigy-59mg.onrender.com/api/friend-requests/accepted/${userId}`);
  if (!response.ok) throw new Error("Failed to fetch accepted friends");
  return response.json();
};
