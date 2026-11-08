export interface PageResponse {
  ok: boolean;
  status: number;
  url?: string;
  headers?: { get(name: string): string | null } | Record<string, string>;
  text(): Promise<string>;
}

export type PageFetcher = (url: string, init?: RequestInit) => Promise<PageResponse>;

export interface JsonResponse {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}

export type JsonFetcher = (url: string, init?: RequestInit) => Promise<JsonResponse>;
