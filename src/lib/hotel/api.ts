import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { openPaidChannel } from "@/lib/hotel/comms";
import {
  AROMAS,
  BAR,
  CONDUCT,
  DURATIONS,
  ELECTIVES,
  EXTENSION_CENTS,
  GATE_ACTIONS,
  GATE_SOURCES,
  GRATUITY,
  MENU,
  MOODS,
  PERSONAS,
  PHASES,
  PLAYLISTS,
  ROSTER,
  SUITES,
  WINDOWS,
  durationByCode,
  moodById,
  serviceBySlug,
} from "@/lib/hotel/catalog";

type Sql = Awaited<ReturnType<typeof import("@/lib/db").getSql>>;

async function db() {
  const { getSql } = await import("@/lib/db");
  return getSql();
}

function asRecord(input: unknown): Record<string, unknown> {
  if (!input || typeof input !== "object") throw new Error("Invalid request");
  return input as Record<string, unknown>;
}

function str(value: unknown, label: string, max: number) {
  if (typeof value !== "string") throw new Error(`${label} is required`);
  const trimmed = value.trim();
  if (!trimmed || trimmed.length > max) throw new Error(`${label} is required`);
  return trimmed;
}

function payRef(value: unknown) {
  const reference = str(value, "Paystack reference", 80);
  if (!/^[A-Za-z0-9._-]{6,80}$/.test(reference)) throw new Error("Paystack reference is not valid");
  return reference;
}

function opt(value: unknown, max: number) {
  if (typeof value !== "string") return "";
  return value.trim().slice(0, max);
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], label: string): T {
  if (typeof value !== "string" || !allowed.includes(value as T)) {
    throw new Error(`Choose a valid ${label}`);
  }
  return value as T;
}

export type HostessRow = {
  id: string;
  name: string;
  vibe: string;
  bio: string;
  languages: string;
  hours: string;
  specialties: string;
  status: string;
};

export type ApplicationRow = {
  id: string;
  name: string;
  languages: string;
  hours: string;
  message: string;
  status: string;
  created_at: string;
};

export type ReservationRow = {
  id: string;
  guest_name: string;
  suite: string;
  hostess_id: string;
  hostess_name: string;
  services: string;
  duration_code: string;
  persona: string;
  mood: string;
  boundary_note: string;
  window_label: string;
  nda_accepted: boolean;
  phase: string;
  status: string;
  folio_account: string;
  folio_cents: number;
  created_at: string;
};

export type EnvironmentRow = {
  reservation_id: string;
  lighting: number;
  climate_tenths: number;
  playlist: string;
  blackout: boolean;
  white_noise: boolean;
  aromatherapy: string;
  hydrotherapy: boolean;
};

export type BarRow = {
  id: string;
  item: string;
  notes: string;
  cents: number;
  status: string;
  created_at: string;
};

export type CourseRow = {
  id: string;
  course_no: number;
  dish: string;
  status: string;
};

export type FolioRow = {
  id: string;
  kind: string;
  description: string;
  cents: number;
  settled_via: string;
  paystack_ref: string | null;
  created_at: string;
};

export type GateRow = {
  id: string;
  source: string;
  action: string;
  created_at: string;
};

export type ConductRow = {
  code: string;
  adhered: boolean;
};

export type NoteRow = {
  id: string;
  author: string;
  body: string;
  created_at: string;
};

export type DeskData = {
  hostesses: HostessRow[];
  applications: ApplicationRow[];
  reservations: ReservationRow[];
};

export type Bundle = {
  reservation: ReservationRow;
  environment: EnvironmentRow;
  bar: BarRow[];
  courses: CourseRow[];
  folio: FolioRow[];
  gates: GateRow[];
  conduct: ConductRow[];
  notes: NoteRow[];
};

async function syncRoster(sql: Sql, userId: string) {
  for (const host of ROSTER) {
    const id = `${userId}:${host.key}`;
    await sql`
      insert into hostesses (
        id, user_id, name, vibe, bio, languages, hours, specialties, status
      ) values (
        ${id}, ${userId}, ${host.name}, ${host.vibe}, ${host.bio},
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
}

async function ensureSeed(sql: Sql, userId: string) {
  const existing = await sql<{ user_id: string }>`
    select user_id from hotel_seed where user_id = ${userId}
  `;
  if (existing.length) return;

  for (const host of ROSTER) {
    const id = `${userId}:${host.key}`;
    await sql`
      insert into hostesses (
        id, user_id, name, vibe, bio, languages, hours, specialties, status
      ) values (
        ${id}, ${userId}, ${host.name}, ${host.vibe}, ${host.bio},
        ${host.languages}, ${host.hours}, ${host.specialties}, ${"active"}
      )
      on conflict (id) do nothing
    `;
  }

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
      ${"Evening hosting · Thandi"}, ${640000}, ${"room"}
    )
    on conflict (id) do nothing
  `;
  await sql`
    insert into bar_tickets (id, user_id, reservation_id, item, notes, cents, status)
    values (
      ${`${liveId}:bar`}, ${userId}, ${liveId}, ${"House negroni"}, ${""}, ${22000}, ${"served"}
    )
    on conflict (id) do nothing
  `;
  await sql`
    insert into folio_lines (id, user_id, reservation_id, kind, description, cents, settled_via)
    values (
      ${`${liveId}:bar`}, ${userId}, ${liveId}, ${"beverage"}, ${"House negroni"}, ${22000}, ${"room"}
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
  for (const item of CONDUCT) {
    await sql`
      insert into conduct_checks (reservation_id, user_id, code, adhered)
      values (${liveId}, ${userId}, ${item.code}, ${true})
      on conflict (reservation_id, code) do nothing
    `;
  }
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
      ${"Evening hosting · Naledi"}, ${640000}, ${"corporate"}
    )
    on conflict (id) do nothing
  `;
  await sql`
    insert into folio_lines (id, user_id, reservation_id, kind, description, cents, settled_via)
    values (
      ${`${nextId}:dine`}, ${userId}, ${nextId}, ${"dining"},
      ${"Kitchen coordination · three courses"}, ${220000}, ${"corporate"}
    )
    on conflict (id) do nothing
  `;
  for (const course of MENU) {
    await sql`
      insert into courses (id, user_id, reservation_id, course_no, dish, status)
      values (
        ${`${nextId}:c${course.course}`}, ${userId}, ${nextId},
        ${course.course}, ${course.dish}, ${"kitchen"}
      )
      on conflict (id) do nothing
    `;
  }
  for (const item of CONDUCT) {
    await sql`
      insert into conduct_checks (reservation_id, user_id, code, adhered)
      values (${nextId}, ${userId}, ${item.code}, ${true})
      on conflict (reservation_id, code) do nothing
    `;
  }

  await sql`
    insert into hotel_seed (user_id) values (${userId})
    on conflict (user_id) do nothing
  `;
}

async function listReservations(sql: Sql, userId: string) {
  return sql<ReservationRow>`
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

async function loadBundle(sql: Sql, userId: string, id: string): Promise<Bundle> {
  const rows = await sql<ReservationRow>`
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
  `;
  const reservation = rows[0];
  if (!reservation) throw new Error("Reservation not found");
  const [environmentRows, bar, courses, folio, gates, conduct, notes] = await Promise.all([
    sql<EnvironmentRow>`
      select reservation_id, lighting, climate_tenths, playlist, blackout,
        white_noise, aromatherapy, hydrotherapy
      from environments
      where user_id = ${userId} and reservation_id = ${id}
    `,
    sql<BarRow>`
      select id, item, notes, cents, status, created_at::text as created_at
      from bar_tickets
      where user_id = ${userId} and reservation_id = ${id}
      order by created_at
    `,
    sql<CourseRow>`
      select id, course_no, dish, status
      from courses
      where user_id = ${userId} and reservation_id = ${id}
      order by course_no
    `,
    sql<FolioRow>`
      select id, kind, description, cents, settled_via, paystack_ref, created_at::text as created_at
      from folio_lines
      where user_id = ${userId} and reservation_id = ${id}
      order by created_at
    `,
    sql<GateRow>`
      select id, source, action, created_at::text as created_at
      from gate_events
      where user_id = ${userId} and reservation_id = ${id}
      order by created_at
    `,
    sql<ConductRow>`
      select code, adhered from conduct_checks
      where user_id = ${userId} and reservation_id = ${id}
      order by code
    `,
    sql<NoteRow>`
      select id, author, body, created_at::text as created_at
      from desk_notes
      where user_id = ${userId} and reservation_id = ${id}
      order by created_at
    `,
  ]);
  const environment = environmentRows[0];
  if (!environment) throw new Error("Suite environment missing");
  return { reservation, environment, bar, courses, folio, gates, conduct, notes };
}

async function ownLive(sql: Sql, userId: string, id: string) {
  const rows = await sql<{ id: string; phase: string; status: string; folio_account: string; hostess_id: string }>`
    select id, phase, status, folio_account, hostess_id
    from reservations
    where user_id = ${userId} and id = ${id}
  `;
  const row = rows[0];
  if (!row) throw new Error("Reservation not found");
  return row;
}

export const loadDesk = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }): Promise<DeskData> => {
    const sql = await db();
    await ensureSeed(sql, context.userId);
    await syncRoster(sql, context.userId);
    const [hostesses, applications, reservations] = await Promise.all([
      sql<HostessRow>`
        select id, name, vibe, bio, languages, hours, specialties, status
        from hostesses where user_id = ${context.userId}
        order by name
      `,
      sql<ApplicationRow>`
        select id, name, languages, hours, message, status, created_at::text as created_at
        from applications where user_id = ${context.userId}
        order by created_at desc
      `,
      listReservations(sql, context.userId),
    ]);
    return { hostesses, applications, reservations };
  });

export const getReservation = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .validator((id: unknown) => str(id, "Reservation", 80))
  .handler(async ({ context, data }) => {
    const sql = await db();
    return loadBundle(sql, context.userId, data);
  });

type BookingInput = {
  guestName: string;
  suite: (typeof SUITES)[number];
  hostessId: string;
  services: string[];
  duration: (typeof DURATIONS)[number]["code"];
  persona: (typeof PERSONAS)[number]["id"];
  mood: (typeof MOODS)[number]["id"];
  boundary: string;
  windowLabel: (typeof WINDOWS)[number];
  account: "room" | "corporate";
  nda: boolean;
  paystackRef: string;
};

function parseBooking(input: unknown): BookingInput {
  const raw = asRecord(input);
  const guestName = str(raw.guestName, "Guest alias", 60);
  const suite = oneOf(raw.suite, SUITES, "suite");
  const hostessId = str(raw.hostessId, "Hostess", 120);
  if (!Array.isArray(raw.services) || raw.services.length === 0) {
    throw new Error("Choose at least one service");
  }
  const services = raw.services.map((slug) => {
    if (typeof slug !== "string" || !ELECTIVES.some((s) => s.slug === slug)) {
      throw new Error("Unknown service");
    }
    return slug;
  });
  const duration = oneOf(
    raw.duration,
    DURATIONS.map((d) => d.code),
    "duration",
  );
  const persona = oneOf(
    raw.persona,
    PERSONAS.map((p) => p.id),
    "persona",
  );
  const mood = oneOf(
    raw.mood,
    MOODS.map((m) => m.id),
    "mood",
  );
  const windowLabel = oneOf(raw.windowLabel, WINDOWS, "window");
  const account = oneOf(raw.account, ["room", "corporate"] as const, "account");
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
    paystackRef: payRef(raw.paystackRef),
  };
}

export const createReservation = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(parseBooking)
  .handler(async ({ context, data }) => {
    const sql = await db();
    const userId = context.userId;
    const hosts = await sql<{ id: string; name: string }>`
      select id, name from hostesses
      where user_id = ${userId} and id = ${data.hostessId} and status = 'active'
    `;
    const host = hosts[0];
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
    const supplementCents = data.services.reduce(
      (sum, slug) => sum + (serviceBySlug(slug)?.supplementCents ?? 0),
      0,
    );
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
    if (data.services.includes("private-dining")) {
      for (const course of MENU) {
        await sql`
          insert into courses (id, user_id, reservation_id, course_no, dish, status)
          values (${crypto.randomUUID()}, ${userId}, ${id}, ${course.course}, ${course.dish}, ${"kitchen"})
        `;
      }
    }
    for (const item of CONDUCT) {
      await sql`
        insert into conduct_checks (reservation_id, user_id, code, adhered)
        values (${id}, ${userId}, ${item.code}, ${true})
      `;
    }
    await sql`
      insert into desk_notes (id, user_id, reservation_id, author, body)
      values (
        ${crypto.randomUUID()}, ${userId}, ${id}, ${"desk"},
        ${"Charged on Paystack. The reference is on the folio. It is not discussed in the suite."}
      )
    `;
    const hostessKey = host.id.startsWith(`${userId}:`) ? host.id.slice(userId.length + 1) : "";
    if (hostessKey) {
      await openPaidChannel({
        hostessKey,
        label: data.guestName,
        reference: data.paystackRef,
        amountCents: duration.cents + supplementCents,
        description: `${duration.label} · ${host.name}`,
      });
    }
    return loadBundle(sql, userId, id);
  });

function parseId(input: unknown) {
  const raw = asRecord(input);
  return { id: str(raw.id, "Reservation", 80) };
}

export const advancePhase = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(parseId)
  .handler(async ({ context, data }) => {
    const sql = await db();
    const row = await ownLive(sql, context.userId, data.id);
    if (row.status === "cancelled" || row.phase === "closed") {
      throw new Error("This block is already closed");
    }
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

function parseEnvironment(input: unknown) {
  const raw = asRecord(input);
  const id = str(raw.id, "Reservation", 80);
  const lighting = Number(raw.lighting);
  const climateTenths = Number(raw.climateTenths);
  if (!Number.isInteger(lighting) || lighting < 0 || lighting > 100) {
    throw new Error("Lighting must be between 0 and 100");
  }
  if (!Number.isInteger(climateTenths) || climateTenths < 160 || climateTenths > 280) {
    throw new Error("Climate is out of range");
  }
  return {
    id,
    lighting,
    climateTenths,
    playlist: oneOf(
      raw.playlist,
      PLAYLISTS.map((p) => p.id),
      "playlist",
    ),
    blackout: raw.blackout === true,
    whiteNoise: raw.whiteNoise === true,
    aromatherapy: oneOf(
      raw.aromatherapy,
      AROMAS.map((a) => a.id),
      "aroma",
    ),
    hydrotherapy: raw.hydrotherapy === true,
  };
}

export const saveEnvironment = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(parseEnvironment)
  .handler(async ({ context, data }) => {
    const sql = await db();
    await ownLive(sql, context.userId, data.id);
    const updated = await sql<{ reservation_id: string }>`
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
    `;
    if (!updated.length) throw new Error("Suite environment missing");
    return loadBundle(sql, context.userId, data.id);
  });

function parseBar(input: unknown) {
  const raw = asRecord(input);
  const id = str(raw.id, "Reservation", 80);
  const itemId = oneOf(
    raw.itemId,
    BAR.map((b) => b.id),
    "pour",
  );
  const item = BAR.find((b) => b.id === itemId);
  if (!item) throw new Error("Unknown pour");
  return {
    id,
    item: item.name,
    cents: item.cents,
    notes: opt(raw.notes, 140),
    paystackRef: item.cents > 0 ? payRef(raw.paystackRef) : "",
  };
}

export const orderPour = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(parseBar)
  .handler(async ({ context, data }) => {
    const sql = await db();
    const row = await ownLive(sql, context.userId, data.id);
    if (row.status === "closed" || row.status === "cancelled") {
      throw new Error("The bar is closed for this block");
    }
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

export const servePour = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const raw = asRecord(input);
    return { id: str(raw.id, "Reservation", 80), ticketId: str(raw.ticketId, "Ticket", 80) };
  })
  .handler(async ({ context, data }) => {
    const sql = await db();
    await ownLive(sql, context.userId, data.id);
    await sql`
      update bar_tickets set status = 'served'
      where user_id = ${context.userId} and reservation_id = ${data.id} and id = ${data.ticketId}
    `;
    return loadBundle(sql, context.userId, data.id);
  });

const COURSE_NEXT: Record<string, string> = { kitchen: "plating", plating: "served" };

export const advanceCourse = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const raw = asRecord(input);
    return { id: str(raw.id, "Reservation", 80), courseId: str(raw.courseId, "Course", 80) };
  })
  .handler(async ({ context, data }) => {
    const sql = await db();
    await ownLive(sql, context.userId, data.id);
    const rows = await sql<{ id: string; status: string }>`
      select id, status from courses
      where user_id = ${context.userId} and reservation_id = ${data.id} and id = ${data.courseId}
    `;
    const course = rows[0];
    if (!course) throw new Error("Course not found");
    const next = COURSE_NEXT[course.status];
    if (!next) return loadBundle(sql, context.userId, data.id);
    await sql`
      update courses set status = ${next}
      where user_id = ${context.userId} and id = ${course.id}
    `;
    return loadBundle(sql, context.userId, data.id);
  });

export const postExtension = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const raw = asRecord(input);
    return { id: str(raw.id, "Reservation", 80), paystackRef: payRef(raw.paystackRef) };
  })
  .handler(async ({ context, data }) => {
    const sql = await db();
    const row = await ownLive(sql, context.userId, data.id);
    if (row.status === "closed" || row.status === "cancelled") {
      throw new Error("Cannot extend a closed block");
    }
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

export const postGratuity = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const raw = asRecord(input);
    const cents = Number(raw.cents);
    if (!GRATUITY.includes(cents as (typeof GRATUITY)[number])) {
      throw new Error("Choose a folio gratuity");
    }
    return { id: str(raw.id, "Reservation", 80), cents, paystackRef: payRef(raw.paystackRef) };
  })
  .handler(async ({ context, data }) => {
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

export const logGate = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const raw = asRecord(input);
    return {
      id: str(raw.id, "Reservation", 80),
      source: oneOf(raw.source, GATE_SOURCES, "source"),
      action: oneOf(
        raw.action,
        GATE_ACTIONS.map((a) => a.id),
        "action",
      ),
    };
  })
  .handler(async ({ context, data }) => {
    const sql = await db();
    await ownLive(sql, context.userId, data.id);
    await sql`
      insert into gate_events (id, user_id, reservation_id, source, action)
      values (${crypto.randomUUID()}, ${context.userId}, ${data.id}, ${data.source}, ${data.action})
    `;
    return loadBundle(sql, context.userId, data.id);
  });

export const setConduct = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const raw = asRecord(input);
    return {
      id: str(raw.id, "Reservation", 80),
      code: oneOf(
        raw.code,
        CONDUCT.map((c) => c.code),
        "check",
      ),
      adhered: raw.adhered === true,
    };
  })
  .handler(async ({ context, data }) => {
    const sql = await db();
    await ownLive(sql, context.userId, data.id);
    await sql`
      update conduct_checks set adhered = ${data.adhered}
      where user_id = ${context.userId} and reservation_id = ${data.id} and code = ${data.code}
    `;
    return loadBundle(sql, context.userId, data.id);
  });

export const addNote = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const raw = asRecord(input);
    return {
      id: str(raw.id, "Reservation", 80),
      author: oneOf(raw.author, ["desk", "hostess"] as const, "author"),
      body: str(raw.body, "Note", 500),
    };
  })
  .handler(async ({ context, data }) => {
    const sql = await db();
    await ownLive(sql, context.userId, data.id);
    await sql`
      insert into desk_notes (id, user_id, reservation_id, author, body)
      values (${crypto.randomUUID()}, ${context.userId}, ${data.id}, ${data.author}, ${data.body})
    `;
    return loadBundle(sql, context.userId, data.id);
  });

export const setAccount = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const raw = asRecord(input);
    return {
      id: str(raw.id, "Reservation", 80),
      account: oneOf(raw.account, ["room", "corporate"] as const, "account"),
    };
  })
  .handler(async ({ context, data }) => {
    const sql = await db();
    await ownLive(sql, context.userId, data.id);
    await sql`
      update reservations set folio_account = ${data.account}
      where user_id = ${context.userId} and id = ${data.id}
    `;
    return loadBundle(sql, context.userId, data.id);
  });

export const cancelReservation = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator(parseId)
  .handler(async ({ context, data }) => {
    const sql = await db();
    const row = await ownLive(sql, context.userId, data.id);
    if (row.status === "cancelled") return loadBundle(sql, context.userId, data.id);
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

export const submitApplication = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const raw = asRecord(input);
    return {
      name: str(raw.name, "Name", 60),
      languages: str(raw.languages, "Languages", 80),
      hours: str(raw.hours, "Hours", 80),
      message: str(raw.message, "Note", 600),
    };
  })
  .handler(async ({ context, data }) => {
    const sql = await db();
    await sql`
      insert into applications (id, user_id, name, languages, hours, message, status)
      values (
        ${crypto.randomUUID()}, ${context.userId}, ${data.name}, ${data.languages},
        ${data.hours}, ${data.message}, ${"review"}
      )
    `;
    return { ok: true };
  });

export const reviewApplication = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const raw = asRecord(input);
    return {
      id: str(raw.id, "Application", 80),
      decision: oneOf(raw.decision, ["accepted", "declined"] as const, "decision"),
    };
  })
  .handler(async ({ context, data }) => {
    const sql = await db();
    const rows = await sql<{
      id: string;
      name: string;
      languages: string;
      hours: string;
      message: string;
      status: string;
    }>`
      select id, name, languages, hours, message, status
      from applications
      where user_id = ${context.userId} and id = ${data.id}
    `;
    const app = rows[0];
    if (!app) throw new Error("Application not found");
    if (app.status !== "review") throw new Error("Already reviewed");
    await sql`
      update applications set status = ${data.decision}
      where user_id = ${context.userId} and id = ${data.id}
    `;
    if (data.decision === "accepted") {
      await sql`
        insert into hostesses (
          id, user_id, name, vibe, bio, languages, hours, specialties, status
        ) values (
          ${crypto.randomUUID()}, ${context.userId}, ${app.name}, ${"New intake"},
          ${app.message}, ${app.languages}, ${app.hours}, ${""}, ${"paused"}
        )
      `;
    }
    return { ok: true };
  });

export const setHostessStatus = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: unknown) => {
    const raw = asRecord(input);
    return {
      id: str(raw.id, "Hostess", 120),
      status: oneOf(raw.status, ["active", "paused"] as const, "status"),
    };
  })
  .handler(async ({ context, data }) => {
    const sql = await db();
    const updated = await sql<{ id: string }>`
      update hostesses set status = ${data.status}
      where user_id = ${context.userId} and id = ${data.id}
      returning id
    `;
    if (!updated.length) throw new Error("Hostess not found");
    return { ok: true };
  });
