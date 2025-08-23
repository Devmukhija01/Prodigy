// client/src/lib/apiRequest.ts
export async function apiRequest<T>(
    url: string,
    options: RequestInit = {}
  ): Promise<T> {
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      credentials: "include", // so cookies/session work
      ...options,
    });
  
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || "API request failed");
    }
  
    return res.json();
  }
  