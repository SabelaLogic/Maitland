import { r as createServerFn } from "./ssr.mjs";
import { g as ROSTER, x as authMiddleware } from "./catalog-CTbdx2-U.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/comms-BxUyeEu4.js
var PAY_URL = "https://paystack.shop/pay/p3ski9o6ok";
var ACCESS_CENTS = 1e4;
function flag(value) {
	return value === true || value === "t" || value === "true" || value === 1;
}
function hostess(key) {
	const row = ROSTER.find((h) => h.key === key);
	if (!row) throw new Error("Choose a hostess on the floor");
	return row;
}
function asRecord(input) {
	if (!input || typeof input !== "object" || Array.isArray(input)) throw new Error("Invalid request");
	return input;
}
function text(value, label, max) {
	if (typeof value !== "string") throw new Error(`${label} is required`);
	const trimmed = value.trim();
	if (!trimmed || trimmed.length > max) throw new Error(`${label} is required`);
	return trimmed;
}
function refOk(value) {
	return /^[A-Za-z0-9._-]{6,80}$/.test(value);
}
async function cryptoTools() {
	return import("node:crypto");
}
async function db() {
	const { getSql } = await import("./db-DLlWmm-R.mjs").then((n) => n.t).then((n) => n.t);
	return getSql();
}
async function paystackConfirmed(reference) {
	const secret = process.env.PAYSTACK_SECRET_KEY?.trim();
	if (!secret) return null;
	const res = await fetch(`https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`, { headers: { Authorization: `Bearer ${secret}` } });
	if (!res.ok) return false;
	return (await res.json()).data?.status === "success";
}
async function requireGuest(guestId, secret) {
	const sql = await db();
	const { createHash } = await cryptoTools();
	const guest = (await sql`
    select id, kind, access, label from guests
    where id = ${guestId} and secret_hash = ${createHash("sha256").update(secret).digest("hex")}
  `)[0];
	if (!guest) throw new Error("This guest token is not valid");
	return {
		sql,
		guest
	};
}
async function openHostessLine(sql, guestId, hostessKey, paymentId, opening) {
	const created = await sql`
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
	const existing = await sql`
    select id from threads where guest_id = ${guestId} and hostess_key = ${hostessKey}
  `;
	if (!existing[0]) throw new Error("The line could not be opened");
	return existing[0].id;
}
async function threadView(sql, threadId) {
	const thread = (await sql`
    select id, hostess_key from threads where id = ${threadId}
  `)[0];
	if (!thread) throw new Error("Thread not found");
	const messages = await sql`
    select id, author, body, created_at::text as created_at
    from messages where thread_id = ${threadId}
    order by created_at asc
  `;
	const face = hostess(thread.hostess_key);
	return {
		id: thread.id,
		hostessKey: thread.hostess_key,
		hostessName: face.name,
		messages
	};
}
var beginAnonymous_createServerFn_handler = createServerRpc({
	id: "94b555d0376a7a6b0680061ca0f4a728b2274fb3e8c4a975e299ad54e346b2a4",
	name: "beginAnonymous",
	filename: "src/lib/hotel/comms.ts"
}, (opts) => beginAnonymous.__executeServer(opts));
var beginAnonymous = createServerFn({ method: "POST" }).validator((input) => {
	const raw = asRecord(input);
	return {
		contact: typeof raw.contact === "string" ? raw.contact.trim().slice(0, 120) : "",
		hostessKey: text(raw.hostessKey, "Hostess", 40)
	};
}).handler(beginAnonymous_createServerFn_handler, async ({ data }) => {
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
	return {
		guestId,
		secret,
		paymentId,
		payUrl: PAY_URL,
		amountCents: ACCESS_CENTS
	};
});
var finalizePayment_createServerFn_handler = createServerRpc({
	id: "a35c45b59355325fb1b91c4a5c60ec62242e4008fe555196053196219e0c542c",
	name: "finalizePayment",
	filename: "src/lib/hotel/comms.ts"
}, (opts) => finalizePayment.__executeServer(opts));
var finalizePayment = createServerFn({ method: "POST" }).validator((input) => {
	const raw = asRecord(input);
	const reference = text(raw.reference, "Paystack reference", 80);
	if (!refOk(reference)) throw new Error("That Paystack reference does not look valid");
	return {
		guestId: text(raw.guestId, "Guest", 80),
		secret: text(raw.secret, "Guest", 80),
		reference
	};
}).handler(finalizePayment_createServerFn_handler, async ({ data }) => {
	const { sql, guest } = await requireGuest(data.guestId, data.secret);
	if (guest.kind !== "anonymous") throw new Error("This payment is for anonymous access");
	const payment = (await sql`
      select id, hostess_key, status from payments
      where guest_id = ${guest.id} and kind = ${"access"}
      order by created_at desc
      limit 1
    `)[0];
	if (!payment?.hostess_key) throw new Error("Start the R100 access payment first");
	if (payment.status === "paid") {
		const existing = await sql`
        select id from threads where guest_id = ${guest.id} and hostess_key = ${payment.hostess_key}
      `;
		if (!existing[0]) throw new Error("Payment is recorded but the line is missing");
		return threadView(sql, existing[0].id);
	}
	if ((await sql`
      select id from payments where paystack_ref = ${data.reference}
    `).length) throw new Error("That reference is already on a payment");
	if (await paystackConfirmed(data.reference) === false) throw new Error("Paystack has not confirmed that reference");
	const face = hostess(payment.hostess_key);
	await sql`
      update payments
      set status = ${"paid"}, paystack_ref = ${data.reference}, paid_at = now()
      where id = ${payment.id}
    `;
	await sql`update guests set access = ${"paid"} where id = ${guest.id}`;
	return threadView(sql, await openHostessLine(sql, guest.id, face.key, payment.id, `Payment is final. I'm ${face.name}. The house menu is the same with any of us — tell me the evening you want, and the desk will keep the money off this line.`));
});
var guestThread_createServerFn_handler = createServerRpc({
	id: "6ed2b81794fb6d5054d0e38ca031ed0d46cecb9c0067b9b751b48c22029f8e43",
	name: "guestThread",
	filename: "src/lib/hotel/comms.ts"
}, (opts) => guestThread.__executeServer(opts));
var guestThread = createServerFn({ method: "POST" }).validator((input) => {
	const raw = asRecord(input);
	return {
		guestId: text(raw.guestId, "Guest", 80),
		secret: text(raw.secret, "Guest", 80),
		hostessKey: text(raw.hostessKey, "Hostess", 40)
	};
}).handler(guestThread_createServerFn_handler, async ({ data }) => {
	const { sql, guest } = await requireGuest(data.guestId, data.secret);
	if (guest.access !== "paid") return null;
	const rows = await sql`
      select id from threads where guest_id = ${guest.id} and hostess_key = ${data.hostessKey}
    `;
	if (!rows[0]) return null;
	return threadView(sql, rows[0].id);
});
var sendGuestMessage_createServerFn_handler = createServerRpc({
	id: "97ba6a6c1373e5039d23125e8331d33243c27566ee4aab4336cdaeda4f159769",
	name: "sendGuestMessage",
	filename: "src/lib/hotel/comms.ts"
}, (opts) => sendGuestMessage.__executeServer(opts));
var sendGuestMessage = createServerFn({ method: "POST" }).validator((input) => {
	const raw = asRecord(input);
	return {
		guestId: text(raw.guestId, "Guest", 80),
		secret: text(raw.secret, "Guest", 80),
		threadId: text(raw.threadId, "Thread", 80),
		body: text(raw.body, "Message", 2e3)
	};
}).handler(sendGuestMessage_createServerFn_handler, async ({ data }) => {
	const { sql, guest } = await requireGuest(data.guestId, data.secret);
	if (guest.access !== "paid") throw new Error("Access is not open yet");
	if (!(await sql`
      select id from threads where id = ${data.threadId} and guest_id = ${guest.id}
    `)[0]) throw new Error("Thread not found");
	await sql`
      insert into messages (id, thread_id, author, body)
      values (${crypto.randomUUID()}, ${data.threadId}, ${"guest"}, ${data.body})
    `;
	return threadView(sql, data.threadId);
});
async function accountGate(userId) {
	const sql = await db();
	const row = (await sql`
    select u."emailVerified" as verified, u.email, u.name,
      exists(
        select 1 from "account" a
        where a."userId" = u.id and a."providerId" = ${"grok-google"}
      ) as gmail
    from "user" u
    where u.id = ${userId}
  `)[0];
	if (!row) throw new Error("Account not found");
	return {
		sql,
		ready: flag(row.verified) || flag(row.gmail),
		email: row.email,
		name: row.name
	};
}
var accountStatus_createServerFn_handler = createServerRpc({
	id: "2646b077204d00388887c7a102ff56136cf5fc913cb619399c74cd6add22366d",
	name: "accountStatus",
	filename: "src/lib/hotel/comms.ts"
}, (opts) => accountStatus.__executeServer(opts));
var accountStatus = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(accountStatus_createServerFn_handler, async ({ context }) => {
	const gate = await accountGate(context.userId);
	return {
		ready: gate.ready,
		email: gate.email
	};
});
var issueActivation_createServerFn_handler = createServerRpc({
	id: "dbbde87facde4e85721f63b99816c339e8e2d518b161edeb951aa7fdf97f10e1",
	name: "issueActivation",
	filename: "src/lib/hotel/comms.ts"
}, (opts) => issueActivation.__executeServer(opts));
var issueActivation = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(issueActivation_createServerFn_handler, async ({ context }) => {
	const { sql, ready, email } = await accountGate(context.userId);
	if (ready) return {
		already: true,
		path: ""
	};
	const { randomBytes, createHash } = await cryptoTools();
	const token = randomBytes(24).toString("hex");
	const tokenHash = createHash("sha256").update(token).digest("hex");
	await sql`
      insert into activations (id, email, token_hash, expires_at)
      values (${crypto.randomUUID()}, ${email}, ${tokenHash}, now() + interval '24 hours')
    `;
	return {
		already: false,
		path: `/activate?token=${token}`
	};
});
var consumeActivation_createServerFn_handler = createServerRpc({
	id: "07c7caba8d2f2ac9966119bf480b67e57815db4855b265f804284f34a22303ef",
	name: "consumeActivation",
	filename: "src/lib/hotel/comms.ts"
}, (opts) => consumeActivation.__executeServer(opts));
var consumeActivation = createServerFn({ method: "POST" }).validator((input) => {
	return { token: text(asRecord(input).token, "Activation token", 80) };
}).handler(consumeActivation_createServerFn_handler, async ({ data }) => {
	const sql = await db();
	const { createHash } = await cryptoTools();
	const tokenHash = createHash("sha256").update(data.token).digest("hex");
	const row = (await sql`
      select email, used_at::text as used_at, (expires_at > now()) as fresh
      from activations where token_hash = ${tokenHash}
    `)[0];
	if (!row) throw new Error("This activation link is not valid");
	if (!row.used_at && !flag(row.fresh)) throw new Error("This activation link has expired");
	if (!row.used_at) await sql`update activations set used_at = now() where token_hash = ${tokenHash}`;
	await sql`update "user" set "emailVerified" = true where email = ${row.email}`;
	return { email: row.email };
});
var openAccountLine_createServerFn_handler = createServerRpc({
	id: "1bbcf3fa2603c489ac6700e465ec0fe438567a9cbc3a14f4dd35fc622f4adda9",
	name: "openAccountLine",
	filename: "src/lib/hotel/comms.ts"
}, (opts) => openAccountLine.__executeServer(opts));
var openAccountLine = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	return { hostessKey: text(asRecord(input).hostessKey, "Hostess", 40) };
}).handler(openAccountLine_createServerFn_handler, async ({ context, data }) => {
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
	const existing = await sql`
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
	return threadView(sql, await openHostessLine(sql, guestId, face.key, paymentId, `Evening. I'm ${face.name}. Tell me what you want once you're in — dinner, the quiet room, or the longer stay.`));
});
var sendAccountMessage_createServerFn_handler = createServerRpc({
	id: "e96af8b5cbb1aeb0e44688d15fe926d253a388e3306864b5d5312c6864cf60f5",
	name: "sendAccountMessage",
	filename: "src/lib/hotel/comms.ts"
}, (opts) => sendAccountMessage.__executeServer(opts));
var sendAccountMessage = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = asRecord(input);
	return {
		threadId: text(raw.threadId, "Thread", 80),
		body: text(raw.body, "Message", 2e3)
	};
}).handler(sendAccountMessage_createServerFn_handler, async ({ context, data }) => {
	const sql = await db();
	const guestId = `acct:${context.userId}`;
	if (!(await sql`
      select id from threads where id = ${data.threadId} and guest_id = ${guestId}
    `)[0]) throw new Error("Thread not found");
	await sql`
      insert into messages (id, thread_id, author, body)
      values (${crypto.randomUUID()}, ${data.threadId}, ${"guest"}, ${data.body})
    `;
	return threadView(sql, data.threadId);
});
var listDeskThreads_createServerFn_handler = createServerRpc({
	id: "906995b2035422ee7afa974d9dbdf71bad3524888d5305a755831d00ace77f58",
	name: "listDeskThreads",
	filename: "src/lib/hotel/comms.ts"
}, (opts) => listDeskThreads.__executeServer(opts));
var listDeskThreads = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(listDeskThreads_createServerFn_handler, async () => {
	return (await (await db())`
      select t.id, t.hostess_key, t.status, t.created_at::text as created_at,
        g.label as guest_label, g.kind as guest_kind, g.contact,
        p.kind as pay_kind, p.amount_cents, p.paystack_ref
      from threads t
      join guests g on g.id = t.guest_id
      left join payments p on p.id = t.payment_id
      order by t.created_at desc
    `).map((row) => ({
		...row,
		amount_cents: row.amount_cents == null ? null : Number(row.amount_cents),
		hostess_name: ROSTER.find((h) => h.key === row.hostess_key)?.name ?? row.hostess_key
	}));
});
var deskMessages_createServerFn_handler = createServerRpc({
	id: "2fc8fbbaec8b3c475ebf6dd06e04a9c70e58bdaec58ab57816885601d82ee1cc",
	name: "deskMessages",
	filename: "src/lib/hotel/comms.ts"
}, (opts) => deskMessages.__executeServer(opts));
var deskMessages = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((id) => text(id, "Thread", 80)).handler(deskMessages_createServerFn_handler, async ({ data }) => {
	return threadView(await db(), data);
});
var replyAsHostess_createServerFn_handler = createServerRpc({
	id: "b6da1dae91cc0872c85b44853be8c9fd515396c474a3c97509489c1eef50df1f",
	name: "replyAsHostess",
	filename: "src/lib/hotel/comms.ts"
}, (opts) => replyAsHostess.__executeServer(opts));
var replyAsHostess = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = asRecord(input);
	return {
		threadId: text(raw.threadId, "Thread", 80),
		body: text(raw.body, "Message", 2e3)
	};
}).handler(replyAsHostess_createServerFn_handler, async ({ data }) => {
	const sql = await db();
	return threadView(sql, await openReply(sql, data.threadId, data.body));
});
async function openReply(sql, threadId, body) {
	if (!(await sql`select id from threads where id = ${threadId}`)[0]) throw new Error("Thread not found");
	await sql`
    insert into messages (id, thread_id, author, body)
    values (${crypto.randomUUID()}, ${threadId}, ${"hostess"}, ${body})
  `;
	return threadId;
}
//#endregion
export { accountStatus_createServerFn_handler, beginAnonymous_createServerFn_handler, consumeActivation_createServerFn_handler, deskMessages_createServerFn_handler, finalizePayment_createServerFn_handler, guestThread_createServerFn_handler, issueActivation_createServerFn_handler, listDeskThreads_createServerFn_handler, openAccountLine_createServerFn_handler, replyAsHostess_createServerFn_handler, sendAccountMessage_createServerFn_handler, sendGuestMessage_createServerFn_handler };
