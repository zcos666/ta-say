export interface RequestOptions extends RequestInit {
  json?: unknown;
}

export async function request<T>(url: string, options: RequestOptions = {}): Promise<T> {
  const { json, headers, ...rest } = options;
  const response = await fetch(url, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: json ? JSON.stringify(json) : options.body,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}
