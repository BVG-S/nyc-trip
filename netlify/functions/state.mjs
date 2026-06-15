// netlify/functions/state.mjs
// Shared itinerary state for all phones, stored in Netlify Blobs (free, built in).
// GET  -> returns the current shared { plan, done, ts }
// POST -> saves the shared state sent by any device
// No setup or keys needed; Netlify provides the Blobs store automatically.

import { getStore } from "@netlify/blobs";

export default async (req) => {
  const store = getStore("trip");

  if (req.method === "GET") {
    let data = null;
    try { data = await store.get("shared", { type: "json" }); } catch (e) {}
    return new Response(JSON.stringify(data || {}), {
      headers: { "content-type": "application/json", "cache-control": "no-store" },
    });
  }

  if (req.method === "POST") {
    try {
      const body = await req.json();
      await store.setJSON("shared", body);
      return new Response(JSON.stringify({ ok: true }), {
        headers: { "content-type": "application/json" },
      });
    } catch (e) {
      return new Response(JSON.stringify({ ok: false, error: String(e) }), { status: 500 });
    }
  }

  return new Response("Method not allowed", { status: 405 });
};
