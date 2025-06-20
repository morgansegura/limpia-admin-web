export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  opts: { throwOnError?: boolean } = { throwOnError: true },
): Promise<T | null> {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;

  const res = await fetch(`${baseUrl}/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}), // allow custom headers if needed
    },
    credentials: "include", // this sends your secure cookie
    cache: "no-store",
  });

  if (!res.ok) {
    if (opts.throwOnError) {
      throw new Error(`API Error: ${res.status} ${res.statusText}`);
    } else {
      return null;
    }
  }

  try {
    return await res.json();
  } catch (err) {
    if (opts.throwOnError) throw err;
    return null;
  }
}
