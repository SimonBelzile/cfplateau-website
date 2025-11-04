// src/pages/api/lead.ts
import type { APIContext } from "astro";

export async function POST(ctx: APIContext) {
  try {
    const contentType = ctx.request.headers.get("content-type") || "";
    let data: Record<string, any> = {};

    if (contentType.includes("application/json")) {
      data = await ctx.request.json();
    } else if (contentType.includes("application/x-www-form-urlencoded") || contentType.includes("multipart/form-data")) {
      const form = await ctx.request.formData();
      form.forEach((v, k) => (data[k] = v));
    } else {
      return new Response(JSON.stringify({ ok: false, error: "Unsupported content-type" }), { status: 415 });
    }

    // anti-spam (honeypot)
    if (data.website) {
      return new Response(JSON.stringify({ ok: true }), { status: 200 });
    }

    // TODO: branchement réel (Resend, Mailgun, Notion, Airtable, etc.)
    // Pour l’instant on log + 200
    console.log("LEAD:", {
      prenom: data.prenom,
      nom: data.nom,
      email: data.email,
      telephone: data.telephone,
      objectif: data.objectif,
      source: "landing-modal",
      ts: new Date().toISOString(),
    });

    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (err: any) {
    console.error("LEAD ERROR:", err);
    return new Response(JSON.stringify({ ok: false, error: "Server error" }), { status: 500 });
  }
}
