import type { Config } from "@netlify/functions";
import { getUser } from "@netlify/identity";
import { db } from "../../db/index.js";
import { siteContent } from "../../db/schema.js";

const CONTENT_ID = "main";
const MAX_BYTES = 100_000;

export default async (req: Request) => {
  if (req.method === "GET") {
    const [row] = await db.select().from(siteContent).limit(1);
    return Response.json(
      { content: row?.data ?? null, updatedAt: row?.updatedAt ?? null },
      { headers: { "Cache-Control": "no-store" } }
    );
  }

  if (req.method === "PUT") {
    const origin = req.headers.get("origin");
    if (!origin || origin !== new URL(req.url).origin) {
      return Response.json({ error: "Origen no permitido" }, { status: 403 });
    }

    const user = await getUser();
    if (!user) {
      return Response.json({ error: "Tenés que iniciar sesión" }, { status: 401 });
    }
    if (!user.roles?.includes("admin")) {
      return Response.json({ error: "Tu cuenta no tiene permisos de administrador" }, { status: 403 });
    }

    const raw = await req.text();
    if (raw.length > MAX_BYTES) {
      return Response.json({ error: "El contenido es demasiado grande" }, { status: 413 });
    }

    let content: unknown;
    try {
      content = JSON.parse(raw)?.content;
    } catch {
      return Response.json({ error: "JSON inválido" }, { status: 400 });
    }
    if (!content || typeof content !== "object" || Array.isArray(content)) {
      return Response.json({ error: "Contenido inválido" }, { status: 400 });
    }

    const now = new Date();
    await db
      .insert(siteContent)
      .values({ id: CONTENT_ID, data: content, updatedAt: now })
      .onConflictDoUpdate({ target: siteContent.id, set: { data: content, updatedAt: now } });

    return Response.json({ ok: true, updatedAt: now });
  }

  return new Response("Method not allowed", { status: 405 });
};

export const config: Config = {
  path: "/api/content",
};
