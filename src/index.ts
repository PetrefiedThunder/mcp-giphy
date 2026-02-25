#!/usr/bin/env node
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const BASE = "https://api.giphy.com/v1";
const RATE_LIMIT_MS = 200;
let last = 0;

function getKey(): string {
  const k = process.env.GIPHY_API_KEY;
  if (!k) throw new Error("GIPHY_API_KEY required. Free at https://developers.giphy.com/");
  return k;
}

async function giphyFetch(path: string, params: URLSearchParams): Promise<any> {
  const now = Date.now(); if (now - last < RATE_LIMIT_MS) await new Promise((r) => setTimeout(r, RATE_LIMIT_MS - (now - last)));
  last = Date.now();
  params.set("api_key", getKey());
  const res = await fetch(`${BASE}${path}?${params}`);
  if (!res.ok) throw new Error(`Giphy ${res.status}`);
  return res.json();
}

function mapGif(g: any) {
  return { id: g.id, title: g.title, url: g.url, embedUrl: g.embed_url,
    original: g.images?.original?.url, preview: g.images?.preview_gif?.url,
    fixedWidth: g.images?.fixed_width?.url, rating: g.rating };
}

const server = new McpServer({ name: "mcp-giphy", version: "1.0.0" });

server.tool("search", "Search for GIFs.", {
  query: z.string(), limit: z.number().min(1).max(50).default(10),
  rating: z.enum(["g", "pg", "pg-13", "r"]).default("g"),
}, async ({ query, limit, rating }) => {
  const d = await giphyFetch("/gifs/search", new URLSearchParams({ q: query, limit: String(limit), rating }));
  return { content: [{ type: "text" as const, text: JSON.stringify(d.data?.map(mapGif), null, 2) }] };
});

server.tool("trending", "Get trending GIFs.", {
  limit: z.number().min(1).max(50).default(10),
}, async ({ limit }) => {
  const d = await giphyFetch("/gifs/trending", new URLSearchParams({ limit: String(limit) }));
  return { content: [{ type: "text" as const, text: JSON.stringify(d.data?.map(mapGif), null, 2) }] };
});

server.tool("random", "Get a random GIF.", {
  tag: z.string().optional().describe("Filter by tag"),
}, async ({ tag }) => {
  const p = new URLSearchParams();
  if (tag) p.set("tag", tag);
  const d = await giphyFetch("/gifs/random", p);
  return { content: [{ type: "text" as const, text: JSON.stringify(mapGif(d.data), null, 2) }] };
});

server.tool("search_stickers", "Search for stickers.", {
  query: z.string(), limit: z.number().min(1).max(50).default(10),
}, async ({ query, limit }) => {
  const d = await giphyFetch("/stickers/search", new URLSearchParams({ q: query, limit: String(limit) }));
  return { content: [{ type: "text" as const, text: JSON.stringify(d.data?.map(mapGif), null, 2) }] };
});

server.tool("translate", "Translate a phrase to a single GIF (Giphy's WeirdnessEngine).", {
  phrase: z.string(), weirdness: z.number().min(0).max(10).default(5),
}, async ({ phrase, weirdness }) => {
  const d = await giphyFetch("/gifs/translate", new URLSearchParams({ s: phrase, weirdness: String(weirdness) }));
  return { content: [{ type: "text" as const, text: JSON.stringify(mapGif(d.data), null, 2) }] };
});

async function main() { const t = new StdioServerTransport(); await server.connect(t); }
main().catch((e) => { console.error("Fatal:", e); process.exit(1); });
