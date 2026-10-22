import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely fetches JSON from an API endpoint and prevents "Unexpected token < in JSON at position 0" errors
 */
export async function safeFetchJson<T = any>(input: RequestInfo | URL, init?: RequestInit): Promise<T | null> {
  try {
    const res = await fetch(input, init);
    const contentType = res.headers.get("content-type") || "";

    if (!contentType.includes("application/json")) {
      return null;
    }

    return await res.json();
  } catch (error) {
    console.warn("safeFetchJson error for:", input, error);
    return null;
  }
}
