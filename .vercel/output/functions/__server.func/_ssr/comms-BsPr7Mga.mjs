import { a as getServerFnById, i as TSS_SERVER_FUNCTION, r as createServerFn } from "./ssr.mjs";
import { g as ROSTER, x as authMiddleware } from "./catalog-CTbdx2-U.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/comms-BsPr7Mga.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var PAY_URL = "https://paystack.shop/pay/p3ski9o6ok";
var ACCESS_CENTS = 1e4;
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
async function db() {
	const { getSql } = await import("./db-DLlWmm-R.mjs").then((n) => n.t).then((n) => n.t);
	return getSql();
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
var beginAnonymous = createServerFn({ method: "POST" }).validator((input) => {
	const raw = asRecord(input);
	return {
		contact: typeof raw.contact === "string" ? raw.contact.trim().slice(0, 120) : "",
		hostessKey: text(raw.hostessKey, "Hostess", 40)
	};
}).handler(createSsrRpc("94b555d0376a7a6b0680061ca0f4a728b2274fb3e8c4a975e299ad54e346b2a4"));
var finalizePayment = createServerFn({ method: "POST" }).validator((input) => {
	const raw = asRecord(input);
	const reference = text(raw.reference, "Paystack reference", 80);
	if (!refOk(reference)) throw new Error("That Paystack reference does not look valid");
	return {
		guestId: text(raw.guestId, "Guest", 80),
		secret: text(raw.secret, "Guest", 80),
		reference
	};
}).handler(createSsrRpc("a35c45b59355325fb1b91c4a5c60ec62242e4008fe555196053196219e0c542c"));
var guestThread = createServerFn({ method: "POST" }).validator((input) => {
	const raw = asRecord(input);
	return {
		guestId: text(raw.guestId, "Guest", 80),
		secret: text(raw.secret, "Guest", 80),
		hostessKey: text(raw.hostessKey, "Hostess", 40)
	};
}).handler(createSsrRpc("6ed2b81794fb6d5054d0e38ca031ed0d46cecb9c0067b9b751b48c22029f8e43"));
var sendGuestMessage = createServerFn({ method: "POST" }).validator((input) => {
	const raw = asRecord(input);
	return {
		guestId: text(raw.guestId, "Guest", 80),
		secret: text(raw.secret, "Guest", 80),
		threadId: text(raw.threadId, "Thread", 80),
		body: text(raw.body, "Message", 2e3)
	};
}).handler(createSsrRpc("97ba6a6c1373e5039d23125e8331d33243c27566ee4aab4336cdaeda4f159769"));
var accountStatus = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("2646b077204d00388887c7a102ff56136cf5fc913cb619399c74cd6add22366d"));
var issueActivation = createServerFn({ method: "POST" }).middleware([authMiddleware]).handler(createSsrRpc("dbbde87facde4e85721f63b99816c339e8e2d518b161edeb951aa7fdf97f10e1"));
var consumeActivation = createServerFn({ method: "POST" }).validator((input) => {
	return { token: text(asRecord(input).token, "Activation token", 80) };
}).handler(createSsrRpc("07c7caba8d2f2ac9966119bf480b67e57815db4855b265f804284f34a22303ef"));
var openAccountLine = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	return { hostessKey: text(asRecord(input).hostessKey, "Hostess", 40) };
}).handler(createSsrRpc("1bbcf3fa2603c489ac6700e465ec0fe438567a9cbc3a14f4dd35fc622f4adda9"));
var sendAccountMessage = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = asRecord(input);
	return {
		threadId: text(raw.threadId, "Thread", 80),
		body: text(raw.body, "Message", 2e3)
	};
}).handler(createSsrRpc("e96af8b5cbb1aeb0e44688d15fe926d253a388e3306864b5d5312c6864cf60f5"));
var listDeskThreads = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("906995b2035422ee7afa974d9dbdf71bad3524888d5305a755831d00ace77f58"));
var deskMessages = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((id) => text(id, "Thread", 80)).handler(createSsrRpc("2fc8fbbaec8b3c475ebf6dd06e04a9c70e58bdaec58ab57816885601d82ee1cc"));
var replyAsHostess = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = asRecord(input);
	return {
		threadId: text(raw.threadId, "Thread", 80),
		body: text(raw.body, "Message", 2e3)
	};
}).handler(createSsrRpc("b6da1dae91cc0872c85b44853be8c9fd515396c474a3c97509489c1eef50df1f"));
async function openPaidChannel(input) {
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
	await openHostessLine(sql, guestId, face.key, paymentId, `Payment is final (${input.description}). I'm ${face.name}. Write here — the charge is already on Paystack, not in the suite.`);
}
//#endregion
export { createSsrRpc as a, guestThread as c, openAccountLine as d, openPaidChannel as f, sendGuestMessage as h, consumeActivation as i, issueActivation as l, sendAccountMessage as m, accountStatus as n, deskMessages as o, replyAsHostess as p, beginAnonymous as r, finalizePayment as s, ACCESS_CENTS as t, listDeskThreads as u };
