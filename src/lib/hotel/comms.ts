import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { ROSTER } from "@/lib/hotel/catalog";

export const PAY_URL = "https://paystack.shop/pay/p3ski9o6ok";
export const ACCESS_CENTS = 10000;

export type MsgRow = { id: string; author: string; body: string; created_at: string };
export type ThreadView = {
  id: string;
  hostessKey: string;
  hostessName: string;
  messages: MsgRow[];
};
export type DeskThread = {
  id: string;
  hostess_key: string;
  hostess_name: string;
  guest_label: string;
  guest_kind: string;
  contact: string;
  pay_kind: string | null;
  amount_cents: number | null;
  paystack_ref: string | null;
  status: string;
  created_at: string;
};

function flag(value: unknown) {
  return value === true || value === "t" || value === "true" || value === 1;
}

function hostess(key: string) {
  const row = ROSTER.find((h) => h.key === key);
  if (!row) throw new Error("Choose a hostess on the floor");
  return row;
}

function asRecord(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Invalid request");
  }
  return input as Record<string, unknown>;
}

function text(value: unknown, label: string, max: number) {
  if (typeof value !== "string") throw new Error(`${label} is required`);
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max) throw new Error(`${label} is required`);
  return trimmed;
}

function refOk(value: string) {
  return /^[A-Za-z0-9._-]{6,80}$/.test(value);
}

async function cryptoTools() {
  return import("node:crypto");
}

async function db() {
  const { getSql } = await import("@/lib/db");
  return getSql();
}

async function paystackConfirmed(reference: string): Promise<boolean | null> {
  const secret = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!secret) return null;
  const res = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    { headers: { Authorization: `Bearer ${secret}` } },
  );
  if (!res.ok) return false;
  const body = (await res.json()) as { data?: { status?: string } };
  return body.data?.status === "success";
}

async function requireGuest(guestId: string, secret: string) {
  const sql = await db();
  const { createHash } = await cryptoTools();
  const hash = createHash("sha256").update(secret).digest("hex");
  const rows = await sql<{ id: string; kind: string; access: string; label: string }>`
    select id, kind, access, label from guests
    where id = ${guestId} and secret_hash = ${hash}
  `;
  const guest = rows[0];
  if (!guest) throw new Error("This guest token is not valid");
  return { sql, guest };
}

async function openHostessLine(
  sql: Awaited<ReturnType<typeof db>>,
  guestId: string,
  hostessKey: string,
  paymentId: string,
  opening: string,
): Promise<string> {
  const created = await sql<{ id: string }>`
    insert into threads (id, guest_id, hostess_key, payment_id, status)
    values (${crypto.randomUUID()}, ${guestId}, ${hostessKey}, ${paymentId}, ${"open"})
    on conflict (guest_id, hostess_key) do nothing
    returning id
  `;
  if (created[0]) {
    await sql`
      insert into messages (id, thread_id, author, body)
      values (${crypto.randomUUID()}, ${created[0].id}, ${"hostess"}, ${opening})
    `;
    return created[0].id;
  }
  const existing = await sql<{ id: string }>`
    select id from threads where guest_id = ${guestId} and hostess_key = ${hostessKey}
  `;
  if (!existing[0]) throw new Error("The line could not be opened");
  return existing[0].id;
}

async function threadView(sql: Awaited<ReturnType<typeof db>>, threadId: string): Promise<ThreadView> {
  const rows = await sql<{ id: string; hostess_key: string }>`
    select id, hostess_key from threads where id = ${threadId}
  `;
  const thread = rows[0];
  if (!thread) throw new Error("Thread not found");
  const messages = await sql<MsgRow>`
    select id, author, body, created_at::text as created_at
    from messages where thread_id = ${threadId}
    order by created_at asc
  `;
  const face = hostess(thread.hostess_key);
  return { id: thread.id, hostessKey: thread.hostess_key, hostessName: face.name, messages };
}

export const beginAnonymous = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const raw = asRecord(input);
    const contact = typeof raw.contact === "string" ? raw.contact.trim().slice(0, 120) : "";
    return { contact, hostessKey: text(raw.hostessKey, "Hostess", 40) };
  })
  .handler(async ({ data }) => {
    const face = hostess(data.hostessKey);
    const sql = await db();
    const { randomBytes, createHash } = await cryptoTools();
    const guestId = crypto.randomUUID();
    const secret = randomBytes(24).toString("hex");
    const secretHash = createHash("sha256").update(secret).digest("hex");
    const paymentId = crypto.randomUUID();
    await sql`
      insert into guests (id, secret_hash, kind, contact, label, access)
      values (${guestId}, ${secretHash}, ${"anonymous"}, ${data.contact}, ${"Anonymous guest"}, ${"locked"})
    `;
    await sql`
      insert into payments (
        id, guest_id, hostess_key, kind, amount_cents, status, pay_url, description
      ) values (
        ${paymentId}, ${guestId}, ${face.key}, ${"access"}, ${ACCESS_CENTS},
        ${"pending"}, ${PAY_URL}, ${"Executive access, anonymous"}
      )
    `;
    return { guestId, secret, paymentId, payUrl: PAY_URL, amountCents: ACCESS_CENTS };
  });

export const finalizePayment = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const raw = asRecord(input);
    const reference = text(raw.reference, "Paystack reference", 80);
    if (!refOk(reference)) throw new Error("That Paystack reference does not look valid");
    return {
      guestId: text(raw.guestId, "Guest", 80),
      secret: text(raw.secret, "Guest", 80),
      reference,
    };
  })
  .handler(async ({ data }) => {
    const { sql, guest } = await requireGuest(data.guestId, data.secret);
    if (guest.kind !== "anonymous") throw new Error("This payment is for anonymous access");
    const pending = await sql<{ id: string; hostess_key: string; status: string }>`
      select id, hostess_key, status from payments
      where guest_id = ${guest.id} and kind = ${"access"}
      order by created_at desc
      limit 1
    `;
    const payment = pending[0];
    if (!payment?.hostess_key) throw new Error("Start the R100 access payment first");
    if (payment.status === "paid") {
      const existing = await sql<{ id: string }>`
        select id from threads where guest_id = ${guest.id} and hostess_key = ${payment.hostess_key}
      `;
      if (!existing[0]) throw new Error("Payment is recorded but the line is missing");
      return threadView(sql, existing[0].id);
    }
    const taken = await sql<{ id: string }>`
      select id from payments where paystack_ref = ${data.reference}
    `;
    if (taken.length) throw new Error("That reference is already on a payment");
    const confirmed = await paystackConfirmed(data.reference);
    if (confirmed === false) throw new Error("Paystack has not confirmed that reference");
    const face = hostess(payment.hostess_key);
    await sql`
      update payments
      set status = ${"paid"}, paystack_ref = ${data.reference}, paid_at = now()
      where id = ${payment.id}
    `;
    await sql`update guests set access = ${"paid"} where id = ${guest.id}`;
    const threadId = await openHostessLine(
      sql,
      guest.id,
      face.key,
      payment.id,
      `Payment is final. I'm ${face.name}. The house menu is the same with any of us — tell me the evening you want, and the desk will keep the money off this line.`,
    );
    return threadView(sql, threadId);
  });

export const guestThread = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const raw = asRecord(input);
    return {
      guestId: text(raw.guestId, "Guest", 80),
      secret: text(raw.secret, "Guest", 80),
      hostessKey: text(raw.hostessKey, "Hostess", 40),
    };
  })
  .handler(async ({ data }) => {
    const { sql, guest } = await requireGuest(data.guestId, data.secret);
    if (guest.access !== "paid") return null;
    const rows = await sql<{ id: string }>`
      select id from threads where guest_id = ${guest.id} and hostess_key = ${data.hostessKey}
    `;
    if (!rows[0]) return null;
    return threadView(sql, rows[0].id);
  });

export const sendGuestMessage = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const raw = asRecord(input);
    return {
      guestId: text(raw.guestId, "Guest", 80),
      secret: text(raw.secret, "Guest", 80),
      threadId: text(raw.threadId, "Thread", 80),
      body: text(raw.body, "Message", 2000),
    };
  })
  .handler(async ({ data }) => {
    const { sql, guest } = await requireGuest(data.guestId, data.secret);
    if (guest.access !== "paid") throw new Error("Access is not open yet");
    const owned = await sql<{ id: string }>`
      select id from threads where id = ${data.threadId} and guest_id = ${guest.id}
    `;
    if (!owned[0]) throw new Error("Thread not found");
    await sql`
      insert into messages (id, thread_id, author, body)
      values (${crypto.randomUUID()}, ${data.threadId}, ${"guest"}, ${data.body})
    `;
    return threadView(sql, data.threadId);
  });

async function accountGate(userId: string) {
  const sql = await db();
  const rows = await sql<{ verified: boolean; gmail: boolean; email: string; name: string }>`
    select u."emailVerified" as verified, u.email, u.name,
      exists(
        select 1 from "account" a
        where a."userId" = u.id and a."providerId" = ${"grok-google"}
      ) as gmail
    from "user" u
    where u.id = ${userId}
  `;
  const row = rows[0];
  if (!row) throw new Error("Account not found");
  return { sql, ready: flag(row.verified) || flag(row.gmail), email: row.email, name: row.name };
}

export const accountStatus = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const gate = await accountGate(context.userId);
    return { ready: gate.ready, email: gate.email };
  });

export const issueActivation = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    const { sql, ready, email } = await accountGate(context.userId);
    if (ready) return { already: true as const, path: "" };
    const { randomBytes, createHash } = await cryptoTools();
    const token = randomBytes(24).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    await sql`
      insert into activations (id, email, token_hash, expires_at)
      values (${crypto.randomUUID()}, ${email}, ${tokenHash}, now() + interval '24 hours')
    `;
    return { already: false as const, path: `/activate?token=${token}` };
  });

export const consumeActivation = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    const raw = asRecord(input);
    return { token: text(raw.token, "Activation token", 80) };
  })
  .handler(async ({ data }) => {
    const sql = await db();
    const { createHash } = await cryptoTools();
    const tokenHash = createHash("sha256").update(data.token).digest("hex");
    const rows = await sql<{ email: string; used_at: string | null; fresh: boolean }>`
      select email, used_at::text as used_at, (expires_at > now()) as fresh
      from activations where token_hash = ${tokenHash}
    `;
    const row = rows[0];
    if (!row) throw new Error("This activation link is not valid");
    if (!row.used_at && !flag(row.fresh)) throw new Error("This activation link has expired");
    if (!row.used_at) {
      await sql`update activations set used_at = now() where token_hash = ${tokenHash}`;
    }
    await sql`update "user" set "emailVerified" = true where email = ${row.email}`;
    return { email: row.email };
  });

export const openAccountLine = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const raw = asRecord(input);
    return { hostessKey: text(raw.hostessKey, "Hostess", 40) };
  })
  .handler(async ({ context, data }) => {
    const gate = await accountGate(context.userId);
    if (!gate.ready) throw new Error("Activate the email account, or sign in with Gmail, first");
    const face = hostess(data.hostessKey);
    const sql = gate.sql;
    const guestId = `acct:${context.userId}`;
    await sql`
      insert into guests (id, secret_hash, kind, user_id, contact, label, access)
      values (
        ${guestId}, ${"account"}, ${"account"}, ${context.userId},
        ${gate.email}, ${gate.name || "Guest"}, ${"paid"}
      )
      on conflict (id) do update set access = ${"paid"}, contact = excluded.contact, label = excluded.label
    `;
    const existing = await sql<{ id: string }>`
      select id from threads where guest_id = ${guestId} and hostess_key = ${face.key}
    `;
    if (existing[0]) return threadView(sql, existing[0].id);
    const paymentId = crypto.randomUUID();
    await sql`
      insert into payments (
        id, guest_id, hostess_key, kind, amount_cents, status, pay_url, description, paid_at
      ) values (
        ${paymentId}, ${guestId}, ${face.key}, ${"account"}, ${0}, ${"paid"},
        ${PAY_URL}, ${"Account access. No anonymous fee."}, now()
      )
    `;
    const threadId = await openHostessLine(
      sql,
      guestId,
      face.key,
      paymentId,
      `Evening. I'm ${face.name}. Tell me what you want once you're in — dinner, the quiet room, or the longer stay.`,
    );
    return threadView(sql, threadId);
  });

export const sendAccountMessage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const raw = asRecord(input);
    return {
      threadId: text(raw.threadId, "Thread", 80),
      body: text(raw.body, "Message", 2000),
    };
  })
  .handler(async ({ context, data }) => {
    const sql = await db();
    const guestId = `acct:${context.userId}`;
    const owned = await sql<{ id: string }>`
      select id from threads where id = ${data.threadId} and guest_id = ${guestId}
    `;
    if (!owned[0]) throw new Error("Thread not found");
    await sql`
      insert into messages (id, thread_id, author, body)
      values (${crypto.randomUUID()}, ${data.threadId}, ${"guest"}, ${data.body})
    `;
    return threadView(sql, data.threadId);
  });

export const listDeskThreads = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async () => {
    const sql = await db();
    const rows = await sql<Omit<DeskThread, "hostess_name">>`
      select t.id, t.hostess_key, t.status, t.created_at::text as created_at,
        g.label as guest_label, g.kind as guest_kind, g.contact,
        p.kind as pay_kind, p.amount_cents, p.paystack_ref
      from threads t
      join guests g on g.id = t.guest_id
      left join payments p on p.id = t.payment_id
      order by t.created_at desc
    `;
    return rows.map((row) => ({
      ...row,
      amount_cents: row.amount_cents == null ? null : Number(row.amount_cents),
      hostess_name: ROSTER.find((h) => h.key === row.hostess_key)?.name ?? row.hostess_key,
    }));
  });

export const deskMessages = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((id: unknown) => text(id, "Thread", 80))
  .handler(async ({ data }) => {
    const sql = await db();
    return threadView(sql, data);
  });

export const replyAsHostess = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const raw = asRecord(input);
    return {
      threadId: text(raw.threadId, "Thread", 80),
      body: text(raw.body, "Message", 2000),
    };
  })
  .handler(async ({ data }) => {
    const sql = await db();
    const threadId = await openReply(sql, data.threadId, data.body);
    return threadView(sql, threadId);
  });

export async function openPaidChannel(input: {
  hostessKey: string;
  label: string;
  reference: string;
  amountCents: number;
  description: string;
}) {
  const face = hostess(input.hostessKey);
  const sql = await db();
  const guestId = crypto.randomUUID();
  const paymentId = crypto.randomUUID();
  await sql`
    insert into guests (id, secret_hash, kind, contact, label, access)
    values (${guestId}, ${"folio"}, ${"folio"}, ${""}, ${input.label}, ${"paid"})
  `;
  await sql`
    insert into payments (
      id, guest_id, hostess_key, kind, amount_cents, status, paystack_ref, pay_url, description, paid_at
    ) values (
      ${paymentId}, ${guestId}, ${face.key}, ${"session"}, ${input.amountCents}, ${"paid"},
      ${input.reference}, ${PAY_URL}, ${input.description}, now()
    )
  `;
  await openHostessLine(
    sql,
    guestId,
    face.key,
    paymentId,
    `Payment is final (${input.description}). I'm ${face.name}. Write here — the charge is already on Paystack, not in the suite.`,
  );
}

async function openReply(sql: Awaited<ReturnType<typeof db>>, threadId: string, body: string) {
  const rows = await sql<{ id: string }>`select id from threads where id = ${threadId}`;
  if (!rows[0]) throw new Error("Thread not found");
  await sql`
    insert into messages (id, thread_id, author, body)
    values (${crypto.randomUUID()}, ${threadId}, ${"hostess"}, ${body})
  `;
  return threadId;
}
