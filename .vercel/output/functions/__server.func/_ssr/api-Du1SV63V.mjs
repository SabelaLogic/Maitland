import { r as createServerFn } from "./ssr.mjs";
import { C as moodById, E as serviceBySlug, S as durationByCode, a as DURATIONS, b as WINDOWS, c as GATE_ACTIONS, d as MENU, f as MOODS, g as ROSTER, h as PLAYLISTS, l as GATE_SOURCES, m as PHASES, n as BAR, o as ELECTIVES, p as PERSONAS, r as CONDUCT, s as EXTENSION_CENTS, t as AROMAS, u as GRATUITY, x as authMiddleware, y as SUITES } from "./catalog-CTbdx2-U.mjs";
import { f as openPaidChannel } from "./comms-BsPr7Mga.mjs";
import { t as createServerRpc } from "./createServerRpc-CcvdN_gc.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/api-Du1SV63V.js
async function db() {
	const { getSql } = await import("./db-DLlWmm-R.mjs").then((n) => n.t).then((n) => n.t);
	return getSql();
}
function asRecord(input) {
	if (!input || typeof input !== "object") throw new Error("Invalid request");
	return input;
}
function str(value, label, max) {
	if (typeof value !== "string") throw new Error(`${label} is required`);
	const trimmed = value.trim();
	if (!trimmed || trimmed.length > max) throw new Error(`${label} is required`);
	return trimmed;
}
function payRef(value) {
	const reference = str(value, "Paystack reference", 80);
	if (!/^[A-Za-z0-9._-]{6,80}$/.test(reference)) throw new Error("Paystack reference is not valid");
	return reference;
}
function opt(value, max) {
	if (typeof value !== "string") return "";
	return value.trim().slice(0, max);
}
function oneOf(value, allowed, label) {
	if (typeof value !== "string" || !allowed.includes(value)) throw new Error(`Choose a valid ${label}`);
	return value;
}
async function syncRoster(sql, userId) {
	for (const host of ROSTER) await sql`
      insert into hostesses (
        id, user_id, name, vibe, bio, languages, hours, specialties, status
      ) values (
        ${`${userId}:${host.key}`}, ${userId}, ${host.name}, ${host.vibe}, ${host.bio},
        ${host.languages}, ${host.hours}, ${host.specialties}, ${"active"}
      )
      on conflict (id) do update set
        name = excluded.name,
        vibe = excluded.vibe,
        bio = excluded.bio,
        languages = excluded.languages,
        hours = excluded.hours,
        specialties = excluded.specialties
    `;
}
async function ensureSeed(sql, userId) {
	if ((await sql`
    select user_id from hotel_seed where user_id = ${userId}
  `).length) return;
	for (const host of ROSTER) await sql`
      insert into hostesses (
        id, user_id, name, vibe, bio, languages, hours, specialties, status
      ) values (
        ${`${userId}:${host.key}`}, ${userId}, ${host.name}, ${host.vibe}, ${host.bio},
        ${host.languages}, ${host.hours}, ${host.specialties}, ${"active"}
      )
      on conflict (id) do nothing
    `;
	const liveId = `${userId}:sample-cedar`;
	await sql`
    insert into reservations (
      id, user_id, guest_name, suite, hostess_id, services, duration_code,
      persona, mood, boundary_note, window_label, nda_accepted, phase, status, folio_account
    ) values (
      ${liveId}, ${userId}, ${"Adler"}, ${"The Cedar Suite"}, ${`${userId}:thandi`},
      ${"in-suite-reception,suite-ambience,mixology,intellectual-company,gatekeeping"},
      ${"evening"}, ${"conversationalist"}, ${"amber"},
      ${"No photography. Keep the corridor clear. Prefers low music."},
      ${"Tonight"}, ${true}, ${"ambient"}, ${"live"}, ${"room"}
    )
    on conflict (id) do nothing
  `;
	await sql`
    insert into environments (
      reservation_id, user_id, lighting, climate_tenths, playlist,
      blackout, white_noise, aromatherapy, hydrotherapy
    ) values (
      ${liveId}, ${userId}, ${32}, ${220}, ${"evening-strings"},
      ${false}, ${false}, ${"cedar"}, ${false}
    )
    on conflict (reservation_id) do nothing
  `;
	await sql`
    insert into folio_lines (id, user_id, reservation_id, kind, description, cents, settled_via)
    values (
      ${`${liveId}:fee`}, ${userId}, ${liveId}, ${"session"},
      ${"Evening hosting · Thandi"}, ${64e4}, ${"room"}
    )
    on conflict (id) do nothing
  `;
	await sql`
    insert into bar_tickets (id, user_id, reservation_id, item, notes, cents, status)
    values (
      ${`${liveId}:bar`}, ${userId}, ${liveId}, ${"House negroni"}, ${""}, ${22e3}, ${"served"}
    )
    on conflict (id) do nothing
  `;
	await sql`
    insert into folio_lines (id, user_id, reservation_id, kind, description, cents, settled_via)
    values (
      ${`${liveId}:bar`}, ${userId}, ${liveId}, ${"beverage"}, ${"House negroni"}, ${22e3}, ${"room"}
    )
    on conflict (id) do nothing
  `;
	await sql`
    insert into gate_events (id, user_id, reservation_id, source, action)
    values (
      ${`${liveId}:gate`}, ${userId}, ${liveId}, ${"Housekeeping"}, ${"silenced"}
    )
    on conflict (id) do nothing
  `;
	for (const item of CONDUCT) await sql`
      insert into conduct_checks (reservation_id, user_id, code, adhered)
      values (${liveId}, ${userId}, ${item.code}, ${true})
      on conflict (reservation_id, code) do nothing
    `;
	await sql`
    insert into desk_notes (id, user_id, reservation_id, author, body)
    values (
      ${`${liveId}:note`}, ${userId}, ${liveId}, ${"desk"},
      ${"Opened on the private entrance. Folio is on the room. Persona is relaxed conversation. No money talk in the suite."}
    )
    on conflict (id) do nothing
  `;
	const nextId = `${userId}:sample-river`;
	await sql`
    insert into reservations (
      id, user_id, guest_name, suite, hostess_id, services, duration_code,
      persona, mood, boundary_note, window_label, nda_accepted, phase, status, folio_account
    ) values (
      ${nextId}, ${userId}, ${"Venter"}, ${"River Wing 12"}, ${`${userId}:naledi`},
      ${"private-dining,intellectual-company,in-suite-reception"},
      ${"evening"}, ${"gala"}, ${"gallery"},
      ${"Shellfish allergy. Courses only, no tray left in the room."},
      ${"Tomorrow evening"}, ${true}, ${"reception"}, ${"confirmed"}, ${"corporate"}
    )
    on conflict (id) do nothing
  `;
	await sql`
    insert into environments (
      reservation_id, user_id, lighting, climate_tenths, playlist,
      blackout, white_noise, aromatherapy, hydrotherapy
    ) values (
      ${nextId}, ${userId}, ${62}, ${200}, ${"low-piano"},
      ${false}, ${false}, ${"none"}, ${false}
    )
    on conflict (reservation_id) do nothing
  `;
	await sql`
    insert into folio_lines (id, user_id, reservation_id, kind, description, cents, settled_via)
    values (
      ${`${nextId}:fee`}, ${userId}, ${nextId}, ${"session"},
      ${"Evening hosting · Naledi"}, ${64e4}, ${"corporate"}
    )
    on conflict (id) do nothing
  `;
	await sql`
    insert into folio_lines (id, user_id, reservation_id, kind, description, cents, settled_via)
    values (
      ${`${nextId}:dine`}, ${userId}, ${nextId}, ${"dining"},
      ${"Kitchen coordination · three courses"}, ${22e4}, ${"corporate"}
    )
    on conflict (id) do nothing
  `;
	for (const course of MENU) await sql`
      insert into courses (id, user_id, reservation_id, course_no, dish, status)
      values (
        ${`${nextId}:c${course.course}`}, ${userId}, ${nextId},
        ${course.course}, ${course.dish}, ${"kitchen"}
      )
      on conflict (id) do nothing
    `;
	for (const item of CONDUCT) await sql`
      insert into conduct_checks (reservation_id, user_id, code, adhered)
      values (${nextId}, ${userId}, ${item.code}, ${true})
      on conflict (reservation_id, code) do nothing
    `;
	await sql`
    insert into hotel_seed (user_id) values (${userId})
    on conflict (user_id) do nothing
  `;
}
async function listReservations(sql, userId) {
	return sql`
    select r.id, r.guest_name, r.suite, r.hostess_id, h.name as hostess_name,
      r.services, r.duration_code, r.persona, r.mood, r.boundary_note,
      r.window_label, r.nda_accepted, r.phase, r.status, r.folio_account,
      r.created_at::text as created_at,
      coalesce((
        select sum(f.cents) from folio_lines f
        where f.user_id = r.user_id and f.reservation_id = r.id
      ), 0)::int as folio_cents
    from reservations r
    join hostesses h on h.id = r.hostess_id and h.user_id = r.user_id
    where r.user_id = ${userId}
    order by case r.status when 'live' then 0 when 'confirmed' then 1 else 2 end,
      r.created_at desc
  `;
}
async function loadBundle(sql, userId, id) {
	const reservation = (await sql`
    select r.id, r.guest_name, r.suite, r.hostess_id, h.name as hostess_name,
      r.services, r.duration_code, r.persona, r.mood, r.boundary_note,
      r.window_label, r.nda_accepted, r.phase, r.status, r.folio_account,
      r.created_at::text as created_at,
      coalesce((
        select sum(f.cents) from folio_lines f
        where f.user_id = r.user_id and f.reservation_id = r.id
      ), 0)::int as folio_cents
    from reservations r
    join hostesses h on h.id = r.hostess_id and h.user_id = r.user_id
    where r.user_id = ${userId} and r.id = ${id}
  `)[0];
	if (!reservation) throw new Error("Reservation not found");
	const [environmentRows, bar, courses, folio, gates, conduct, notes] = await Promise.all([
		sql`
      select reservation_id, lighting, climate_tenths, playlist, blackout,
        white_noise, aromatherapy, hydrotherapy
      from environments
      where user_id = ${userId} and reservation_id = ${id}
    `,
		sql`
      select id, item, notes, cents, status, created_at::text as created_at
      from bar_tickets
      where user_id = ${userId} and reservation_id = ${id}
      order by created_at
    `,
		sql`
      select id, course_no, dish, status
      from courses
      where user_id = ${userId} and reservation_id = ${id}
      order by course_no
    `,
		sql`
      select id, kind, description, cents, settled_via, paystack_ref, created_at::text as created_at
      from folio_lines
      where user_id = ${userId} and reservation_id = ${id}
      order by created_at
    `,
		sql`
      select id, source, action, created_at::text as created_at
      from gate_events
      where user_id = ${userId} and reservation_id = ${id}
      order by created_at
    `,
		sql`
      select code, adhered from conduct_checks
      where user_id = ${userId} and reservation_id = ${id}
      order by code
    `,
		sql`
      select id, author, body, created_at::text as created_at
      from desk_notes
      where user_id = ${userId} and reservation_id = ${id}
      order by created_at
    `
	]);
	const environment = environmentRows[0];
	if (!environment) throw new Error("Suite environment missing");
	return {
		reservation,
		environment,
		bar,
		courses,
		folio,
		gates,
		conduct,
		notes
	};
}
async function ownLive(sql, userId, id) {
	const row = (await sql`
    select id, phase, status, folio_account, hostess_id
    from reservations
    where user_id = ${userId} and id = ${id}
  `)[0];
	if (!row) throw new Error("Reservation not found");
	return row;
}
var loadDesk_createServerFn_handler = createServerRpc({
	id: "43fd69c9abe2a41295b8d895be8e024f74bacf774cf27e080abfea8f1af9e5c3",
	name: "loadDesk",
	filename: "src/lib/hotel/api.ts"
}, (opts) => loadDesk.__executeServer(opts));
var loadDesk = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(loadDesk_createServerFn_handler, async ({ context }) => {
	const sql = await db();
	await ensureSeed(sql, context.userId);
	await syncRoster(sql, context.userId);
	const [hostesses, applications, reservations] = await Promise.all([
		sql`
        select id, name, vibe, bio, languages, hours, specialties, status
        from hostesses where user_id = ${context.userId}
        order by name
      `,
		sql`
        select id, name, languages, hours, message, status, created_at::text as created_at
        from applications where user_id = ${context.userId}
        order by created_at desc
      `,
		listReservations(sql, context.userId)
	]);
	return {
		hostesses,
		applications,
		reservations
	};
});
var getReservation_createServerFn_handler = createServerRpc({
	id: "0d211ed0c13fa9149028687d5c832f929a615ff14104170cee87c51de91b4c97",
	name: "getReservation",
	filename: "src/lib/hotel/api.ts"
}, (opts) => getReservation.__executeServer(opts));
var getReservation = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((id) => str(id, "Reservation", 80)).handler(getReservation_createServerFn_handler, async ({ context, data }) => {
	return loadBundle(await db(), context.userId, data);
});
function parseBooking(input) {
	const raw = asRecord(input);
	const guestName = str(raw.guestName, "Guest alias", 60);
	const suite = oneOf(raw.suite, SUITES, "suite");
	const hostessId = str(raw.hostessId, "Hostess", 120);
	if (!Array.isArray(raw.services) || raw.services.length === 0) throw new Error("Choose at least one service");
	const services = raw.services.map((slug) => {
		if (typeof slug !== "string" || !ELECTIVES.some((s) => s.slug === slug)) throw new Error("Unknown service");
		return slug;
	});
	const duration = oneOf(raw.duration, DURATIONS.map((d) => d.code), "duration");
	const persona = oneOf(raw.persona, PERSONAS.map((p) => p.id), "persona");
	const mood = oneOf(raw.mood, MOODS.map((m) => m.id), "mood");
	const windowLabel = oneOf(raw.windowLabel, WINDOWS, "window");
	const account = oneOf(raw.account, ["room", "corporate"], "account");
	if (raw.nda !== true) throw new Error("The non-disclosure must be accepted");
	return {
		guestName,
		suite,
		hostessId,
		services: [...new Set(services)],
		duration,
		persona,
		mood,
		boundary: opt(raw.boundary, 500),
		windowLabel,
		account,
		nda: true,
		paystackRef: payRef(raw.paystackRef)
	};
}
var createReservation_createServerFn_handler = createServerRpc({
	id: "9d744c983f99f4632b0bfa32e8324e8cbb866f7eb2865cc0fb3e08ffef37c1f5",
	name: "createReservation",
	filename: "src/lib/hotel/api.ts"
}, (opts) => createReservation.__executeServer(opts));
var createReservation = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(parseBooking).handler(createReservation_createServerFn_handler, async ({ context, data }) => {
	const sql = await db();
	const userId = context.userId;
	const host = (await sql`
      select id, name from hostesses
      where user_id = ${userId} and id = ${data.hostessId} and status = 'active'
    `)[0];
	if (!host) throw new Error("Choose an active hostess");
	const duration = durationByCode(data.duration);
	const mood = moodById(data.mood);
	if (!duration || !mood) throw new Error("Incomplete booking");
	const id = crypto.randomUUID();
	await sql`
      insert into reservations (
        id, user_id, guest_name, suite, hostess_id, services, duration_code,
        persona, mood, boundary_note, window_label, nda_accepted, phase, status, folio_account
      ) values (
        ${id}, ${userId}, ${data.guestName}, ${data.suite}, ${host.id},
        ${data.services.join(",")}, ${data.duration}, ${data.persona}, ${data.mood},
        ${data.boundary}, ${data.windowLabel}, ${true}, ${"reception"}, ${"confirmed"}, ${data.account}
      )
    `;
	await sql`
      insert into environments (
        reservation_id, user_id, lighting, climate_tenths, playlist,
        blackout, white_noise, aromatherapy, hydrotherapy
      ) values (
        ${id}, ${userId}, ${mood.lighting}, ${mood.climateTenths}, ${mood.playlist},
        ${mood.blackout}, ${mood.whiteNoise}, ${mood.aromatherapy}, ${mood.hydrotherapy}
      )
    `;
	const supplementCents = data.services.reduce((sum, slug) => sum + (serviceBySlug(slug)?.supplementCents ?? 0), 0);
	await sql`
      insert into folio_lines (id, user_id, reservation_id, kind, description, cents, settled_via, paystack_ref)
      values (
        ${crypto.randomUUID()}, ${userId}, ${id}, ${"session"},
        ${`${duration.label} · ${host.name}`}, ${duration.cents}, ${data.account}, ${data.paystackRef}
      )
    `;
	for (const slug of data.services) {
		const service = serviceBySlug(slug);
		if (!service || service.supplementCents <= 0) continue;
		await sql`
        insert into folio_lines (id, user_id, reservation_id, kind, description, cents, settled_via, paystack_ref)
        values (
          ${crypto.randomUUID()}, ${userId}, ${id}, ${"supplement"},
          ${service.name}, ${service.supplementCents}, ${data.account}, ${data.paystackRef}
        )
      `;
	}
	if (data.services.includes("private-dining")) for (const course of MENU) await sql`
          insert into courses (id, user_id, reservation_id, course_no, dish, status)
          values (${crypto.randomUUID()}, ${userId}, ${id}, ${course.course}, ${course.dish}, ${"kitchen"})
        `;
	for (const item of CONDUCT) await sql`
        insert into conduct_checks (reservation_id, user_id, code, adhered)
        values (${id}, ${userId}, ${item.code}, ${true})
      `;
	await sql`
      insert into desk_notes (id, user_id, reservation_id, author, body)
      values (
        ${crypto.randomUUID()}, ${userId}, ${id}, ${"desk"},
        ${"Charged on Paystack. The reference is on the folio. It is not discussed in the suite."}
      )
    `;
	const hostessKey = host.id.startsWith(`${userId}:`) ? host.id.slice(userId.length + 1) : "";
	if (hostessKey) await openPaidChannel({
		hostessKey,
		label: data.guestName,
		reference: data.paystackRef,
		amountCents: duration.cents + supplementCents,
		description: `${duration.label} · ${host.name}`
	});
	return loadBundle(sql, userId, id);
});
function parseId(input) {
	return { id: str(asRecord(input).id, "Reservation", 80) };
}
var advancePhase_createServerFn_handler = createServerRpc({
	id: "5e2835ddeef5ecc42f0c76f586e6aac53c9e17ed6fd6333bb2388c0908ea4058",
	name: "advancePhase",
	filename: "src/lib/hotel/api.ts"
}, (opts) => advancePhase.__executeServer(opts));
var advancePhase = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(parseId).handler(advancePhase_createServerFn_handler, async ({ context, data }) => {
	const sql = await db();
	const row = await ownLive(sql, context.userId, data.id);
	if (row.status === "cancelled" || row.phase === "closed") throw new Error("This block is already closed");
	const index = PHASES.findIndex((p) => p.id === row.phase);
	const next = PHASES[index + 1];
	if (!next) throw new Error("This block is already closed");
	const status = next.id === "closed" ? "closed" : "live";
	await sql`
      update reservations set phase = ${next.id}, status = ${status}
      where user_id = ${context.userId} and id = ${data.id}
    `;
	await sql`
      insert into desk_notes (id, user_id, reservation_id, author, body)
      values (
        ${crypto.randomUUID()}, ${context.userId}, ${data.id}, ${"desk"},
        ${`Phase moved to ${next.label}.`}
      )
    `;
	return loadBundle(sql, context.userId, data.id);
});
function parseEnvironment(input) {
	const raw = asRecord(input);
	const id = str(raw.id, "Reservation", 80);
	const lighting = Number(raw.lighting);
	const climateTenths = Number(raw.climateTenths);
	if (!Number.isInteger(lighting) || lighting < 0 || lighting > 100) throw new Error("Lighting must be between 0 and 100");
	if (!Number.isInteger(climateTenths) || climateTenths < 160 || climateTenths > 280) throw new Error("Climate is out of range");
	return {
		id,
		lighting,
		climateTenths,
		playlist: oneOf(raw.playlist, PLAYLISTS.map((p) => p.id), "playlist"),
		blackout: raw.blackout === true,
		whiteNoise: raw.whiteNoise === true,
		aromatherapy: oneOf(raw.aromatherapy, AROMAS.map((a) => a.id), "aroma"),
		hydrotherapy: raw.hydrotherapy === true
	};
}
var saveEnvironment_createServerFn_handler = createServerRpc({
	id: "bcd7a16aea7571196ac156e6fe123d3c451c8c8c41e15d6e6bac55c6e46a7f6c",
	name: "saveEnvironment",
	filename: "src/lib/hotel/api.ts"
}, (opts) => saveEnvironment.__executeServer(opts));
var saveEnvironment = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(parseEnvironment).handler(saveEnvironment_createServerFn_handler, async ({ context, data }) => {
	const sql = await db();
	await ownLive(sql, context.userId, data.id);
	if (!(await sql`
      update environments set
        lighting = ${data.lighting},
        climate_tenths = ${data.climateTenths},
        playlist = ${data.playlist},
        blackout = ${data.blackout},
        white_noise = ${data.whiteNoise},
        aromatherapy = ${data.aromatherapy},
        hydrotherapy = ${data.hydrotherapy}
      where user_id = ${context.userId} and reservation_id = ${data.id}
      returning reservation_id
    `).length) throw new Error("Suite environment missing");
	return loadBundle(sql, context.userId, data.id);
});
function parseBar(input) {
	const raw = asRecord(input);
	const id = str(raw.id, "Reservation", 80);
	const itemId = oneOf(raw.itemId, BAR.map((b) => b.id), "pour");
	const item = BAR.find((b) => b.id === itemId);
	if (!item) throw new Error("Unknown pour");
	return {
		id,
		item: item.name,
		cents: item.cents,
		notes: opt(raw.notes, 140),
		paystackRef: item.cents > 0 ? payRef(raw.paystackRef) : ""
	};
}
var orderPour_createServerFn_handler = createServerRpc({
	id: "b32c81df8a22f3f8ce2088a74b2ffaec02c54131dd49a578e1202354f4478375",
	name: "orderPour",
	filename: "src/lib/hotel/api.ts"
}, (opts) => orderPour.__executeServer(opts));
var orderPour = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(parseBar).handler(orderPour_createServerFn_handler, async ({ context, data }) => {
	const sql = await db();
	const row = await ownLive(sql, context.userId, data.id);
	if (row.status === "closed" || row.status === "cancelled") throw new Error("The bar is closed for this block");
	await sql`
      insert into bar_tickets (id, user_id, reservation_id, item, notes, cents, status)
      values (${crypto.randomUUID()}, ${context.userId}, ${data.id}, ${data.item}, ${data.notes}, ${data.cents}, ${"queued"})
    `;
	await sql`
      insert into folio_lines (id, user_id, reservation_id, kind, description, cents, settled_via, paystack_ref)
      values (
        ${crypto.randomUUID()}, ${context.userId}, ${data.id}, ${"beverage"},
        ${data.item}, ${data.cents}, ${row.folio_account}, ${data.paystackRef}
      )
    `;
	return loadBundle(sql, context.userId, data.id);
});
var servePour_createServerFn_handler = createServerRpc({
	id: "a4312d881bf4f71d39d91c5bce640b2b3d0e10038941291eb2282f69bf1e2f81",
	name: "servePour",
	filename: "src/lib/hotel/api.ts"
}, (opts) => servePour.__executeServer(opts));
var servePour = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = asRecord(input);
	return {
		id: str(raw.id, "Reservation", 80),
		ticketId: str(raw.ticketId, "Ticket", 80)
	};
}).handler(servePour_createServerFn_handler, async ({ context, data }) => {
	const sql = await db();
	await ownLive(sql, context.userId, data.id);
	await sql`
      update bar_tickets set status = 'served'
      where user_id = ${context.userId} and reservation_id = ${data.id} and id = ${data.ticketId}
    `;
	return loadBundle(sql, context.userId, data.id);
});
var COURSE_NEXT = {
	kitchen: "plating",
	plating: "served"
};
var advanceCourse_createServerFn_handler = createServerRpc({
	id: "bf1cf229ba9663a61c8fe39c000a92d79b8987f1c62e59bd3817f52afd89f4cc",
	name: "advanceCourse",
	filename: "src/lib/hotel/api.ts"
}, (opts) => advanceCourse.__executeServer(opts));
var advanceCourse = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = asRecord(input);
	return {
		id: str(raw.id, "Reservation", 80),
		courseId: str(raw.courseId, "Course", 80)
	};
}).handler(advanceCourse_createServerFn_handler, async ({ context, data }) => {
	const sql = await db();
	await ownLive(sql, context.userId, data.id);
	const course = (await sql`
      select id, status from courses
      where user_id = ${context.userId} and reservation_id = ${data.id} and id = ${data.courseId}
    `)[0];
	if (!course) throw new Error("Course not found");
	const next = COURSE_NEXT[course.status];
	if (!next) return loadBundle(sql, context.userId, data.id);
	await sql`
      update courses set status = ${next}
      where user_id = ${context.userId} and id = ${course.id}
    `;
	return loadBundle(sql, context.userId, data.id);
});
var postExtension_createServerFn_handler = createServerRpc({
	id: "eb6415660450bf7054f765f6de6ea8f0aa45b2b7e62a2850152c957346ffb992",
	name: "postExtension",
	filename: "src/lib/hotel/api.ts"
}, (opts) => postExtension.__executeServer(opts));
var postExtension = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = asRecord(input);
	return {
		id: str(raw.id, "Reservation", 80),
		paystackRef: payRef(raw.paystackRef)
	};
}).handler(postExtension_createServerFn_handler, async ({ context, data }) => {
	const sql = await db();
	const row = await ownLive(sql, context.userId, data.id);
	if (row.status === "closed" || row.status === "cancelled") throw new Error("Cannot extend a closed block");
	await sql`
      insert into folio_lines (id, user_id, reservation_id, kind, description, cents, settled_via, paystack_ref)
      values (
        ${crypto.randomUUID()}, ${context.userId}, ${data.id}, ${"extension"},
        ${"Extended hour"}, ${EXTENSION_CENTS}, ${row.folio_account}, ${data.paystackRef}
      )
    `;
	await sql`
      insert into desk_notes (id, user_id, reservation_id, author, body)
      values (
        ${crypto.randomUUID()}, ${context.userId}, ${data.id}, ${"desk"},
        ${"An hour was added on the folio. It was not discussed as a price in the suite."}
      )
    `;
	return loadBundle(sql, context.userId, data.id);
});
var postGratuity_createServerFn_handler = createServerRpc({
	id: "2db119ad245155320da3d9e09b283c79f8f736be61a3fadb0aad581726c17369",
	name: "postGratuity",
	filename: "src/lib/hotel/api.ts"
}, (opts) => postGratuity.__executeServer(opts));
var postGratuity = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = asRecord(input);
	const cents = Number(raw.cents);
	if (!GRATUITY.includes(cents)) throw new Error("Choose a folio gratuity");
	return {
		id: str(raw.id, "Reservation", 80),
		cents,
		paystackRef: payRef(raw.paystackRef)
	};
}).handler(postGratuity_createServerFn_handler, async ({ context, data }) => {
	const sql = await db();
	const row = await ownLive(sql, context.userId, data.id);
	await sql`
      insert into folio_lines (id, user_id, reservation_id, kind, description, cents, settled_via, paystack_ref)
      values (
        ${crypto.randomUUID()}, ${context.userId}, ${data.id}, ${"gratuity"},
        ${"House gratuity"}, ${data.cents}, ${row.folio_account}, ${data.paystackRef}
      )
    `;
	return loadBundle(sql, context.userId, data.id);
});
var logGate_createServerFn_handler = createServerRpc({
	id: "45339d6604fe36f34599eab5ba027e1017b74ec49c4fbfd4a0e04481e542e4fc",
	name: "logGate",
	filename: "src/lib/hotel/api.ts"
}, (opts) => logGate.__executeServer(opts));
var logGate = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = asRecord(input);
	return {
		id: str(raw.id, "Reservation", 80),
		source: oneOf(raw.source, GATE_SOURCES, "source"),
		action: oneOf(raw.action, GATE_ACTIONS.map((a) => a.id), "action")
	};
}).handler(logGate_createServerFn_handler, async ({ context, data }) => {
	const sql = await db();
	await ownLive(sql, context.userId, data.id);
	await sql`
      insert into gate_events (id, user_id, reservation_id, source, action)
      values (${crypto.randomUUID()}, ${context.userId}, ${data.id}, ${data.source}, ${data.action})
    `;
	return loadBundle(sql, context.userId, data.id);
});
var setConduct_createServerFn_handler = createServerRpc({
	id: "65de813bf7d08dde28ec3196cbb4ec3a150d9d9e14b020e929bac43b3eb8887e",
	name: "setConduct",
	filename: "src/lib/hotel/api.ts"
}, (opts) => setConduct.__executeServer(opts));
var setConduct = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = asRecord(input);
	return {
		id: str(raw.id, "Reservation", 80),
		code: oneOf(raw.code, CONDUCT.map((c) => c.code), "check"),
		adhered: raw.adhered === true
	};
}).handler(setConduct_createServerFn_handler, async ({ context, data }) => {
	const sql = await db();
	await ownLive(sql, context.userId, data.id);
	await sql`
      update conduct_checks set adhered = ${data.adhered}
      where user_id = ${context.userId} and reservation_id = ${data.id} and code = ${data.code}
    `;
	return loadBundle(sql, context.userId, data.id);
});
var addNote_createServerFn_handler = createServerRpc({
	id: "e41e152161af3faa970ca2776e99ec9015ae47ca478228ad8ab9e80e1df37005",
	name: "addNote",
	filename: "src/lib/hotel/api.ts"
}, (opts) => addNote.__executeServer(opts));
var addNote = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = asRecord(input);
	return {
		id: str(raw.id, "Reservation", 80),
		author: oneOf(raw.author, ["desk", "hostess"], "author"),
		body: str(raw.body, "Note", 500)
	};
}).handler(addNote_createServerFn_handler, async ({ context, data }) => {
	const sql = await db();
	await ownLive(sql, context.userId, data.id);
	await sql`
      insert into desk_notes (id, user_id, reservation_id, author, body)
      values (${crypto.randomUUID()}, ${context.userId}, ${data.id}, ${data.author}, ${data.body})
    `;
	return loadBundle(sql, context.userId, data.id);
});
var setAccount_createServerFn_handler = createServerRpc({
	id: "3fa8502ebeb425c239e8bbaed8b304822af218c5de78dcfcf9ee600e540e7a7f",
	name: "setAccount",
	filename: "src/lib/hotel/api.ts"
}, (opts) => setAccount.__executeServer(opts));
var setAccount = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = asRecord(input);
	return {
		id: str(raw.id, "Reservation", 80),
		account: oneOf(raw.account, ["room", "corporate"], "account")
	};
}).handler(setAccount_createServerFn_handler, async ({ context, data }) => {
	const sql = await db();
	await ownLive(sql, context.userId, data.id);
	await sql`
      update reservations set folio_account = ${data.account}
      where user_id = ${context.userId} and id = ${data.id}
    `;
	return loadBundle(sql, context.userId, data.id);
});
var cancelReservation_createServerFn_handler = createServerRpc({
	id: "e3598540ecac4c5ea9d725fc6c442bfecb6bc8b397a5d621e4a3f5aa060283ff",
	name: "cancelReservation",
	filename: "src/lib/hotel/api.ts"
}, (opts) => cancelReservation.__executeServer(opts));
var cancelReservation = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(parseId).handler(cancelReservation_createServerFn_handler, async ({ context, data }) => {
	const sql = await db();
	if ((await ownLive(sql, context.userId, data.id)).status === "cancelled") return loadBundle(sql, context.userId, data.id);
	await sql`
      update reservations set status = 'cancelled', phase = 'closed'
      where user_id = ${context.userId} and id = ${data.id}
    `;
	await sql`
      insert into desk_notes (id, user_id, reservation_id, author, body)
      values (
        ${crypto.randomUUID()}, ${context.userId}, ${data.id}, ${"desk"},
        ${"Block cancelled. Existing folio lines stay for audit."}
      )
    `;
	return loadBundle(sql, context.userId, data.id);
});
var submitApplication_createServerFn_handler = createServerRpc({
	id: "3c2ec6e1cd00bc23fa73c8b0bf8427dd91a0ceefae06d70174059262d9e21dee",
	name: "submitApplication",
	filename: "src/lib/hotel/api.ts"
}, (opts) => submitApplication.__executeServer(opts));
var submitApplication = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = asRecord(input);
	return {
		name: str(raw.name, "Name", 60),
		languages: str(raw.languages, "Languages", 80),
		hours: str(raw.hours, "Hours", 80),
		message: str(raw.message, "Note", 600)
	};
}).handler(submitApplication_createServerFn_handler, async ({ context, data }) => {
	await (await db())`
      insert into applications (id, user_id, name, languages, hours, message, status)
      values (
        ${crypto.randomUUID()}, ${context.userId}, ${data.name}, ${data.languages},
        ${data.hours}, ${data.message}, ${"review"}
      )
    `;
	return { ok: true };
});
var reviewApplication_createServerFn_handler = createServerRpc({
	id: "1d966b39addcdbbf3993492bf5a899c2b221881eebdc9c2d4f2f0fba36e5fb01",
	name: "reviewApplication",
	filename: "src/lib/hotel/api.ts"
}, (opts) => reviewApplication.__executeServer(opts));
var reviewApplication = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = asRecord(input);
	return {
		id: str(raw.id, "Application", 80),
		decision: oneOf(raw.decision, ["accepted", "declined"], "decision")
	};
}).handler(reviewApplication_createServerFn_handler, async ({ context, data }) => {
	const sql = await db();
	const app = (await sql`
      select id, name, languages, hours, message, status
      from applications
      where user_id = ${context.userId} and id = ${data.id}
    `)[0];
	if (!app) throw new Error("Application not found");
	if (app.status !== "review") throw new Error("Already reviewed");
	await sql`
      update applications set status = ${data.decision}
      where user_id = ${context.userId} and id = ${data.id}
    `;
	if (data.decision === "accepted") await sql`
        insert into hostesses (
          id, user_id, name, vibe, bio, languages, hours, specialties, status
        ) values (
          ${crypto.randomUUID()}, ${context.userId}, ${app.name}, ${"New intake"},
          ${app.message}, ${app.languages}, ${app.hours}, ${""}, ${"paused"}
        )
      `;
	return { ok: true };
});
var setHostessStatus_createServerFn_handler = createServerRpc({
	id: "7c40cf7e798c150e707ad3182c679a463f6e9c8b4e39ae2a49470c76f3bda038",
	name: "setHostessStatus",
	filename: "src/lib/hotel/api.ts"
}, (opts) => setHostessStatus.__executeServer(opts));
var setHostessStatus = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = asRecord(input);
	return {
		id: str(raw.id, "Hostess", 120),
		status: oneOf(raw.status, ["active", "paused"], "status")
	};
}).handler(setHostessStatus_createServerFn_handler, async ({ context, data }) => {
	if (!(await (await db())`
      update hostesses set status = ${data.status}
      where user_id = ${context.userId} and id = ${data.id}
      returning id
    `).length) throw new Error("Hostess not found");
	return { ok: true };
});
//#endregion
export { addNote_createServerFn_handler, advanceCourse_createServerFn_handler, advancePhase_createServerFn_handler, cancelReservation_createServerFn_handler, createReservation_createServerFn_handler, getReservation_createServerFn_handler, loadDesk_createServerFn_handler, logGate_createServerFn_handler, orderPour_createServerFn_handler, postExtension_createServerFn_handler, postGratuity_createServerFn_handler, reviewApplication_createServerFn_handler, saveEnvironment_createServerFn_handler, servePour_createServerFn_handler, setAccount_createServerFn_handler, setConduct_createServerFn_handler, setHostessStatus_createServerFn_handler, submitApplication_createServerFn_handler };
