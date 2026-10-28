import { n as createMiddleware } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/catalog-CTbdx2-U.js
/**
* Auth middleware for server functions — the standard way to get the caller's
* verified user id. When deployed the session cookie is same-origin and rides
* along automatically. In the live preview the client also forwards the bearer
* token (partitioned cookies) via the `.client` hook below — call sites do not
* thread it themselves.
*
*   import { createServerFn } from "@tanstack/react-start";
*   import { getSql } from "@/lib/db";
*   import { authMiddleware } from "@/lib/auth/middleware";
*
*   export const listTodos = createServerFn({ method: "GET" })
*     .middleware([authMiddleware])
*     .handler(async ({ context }) => {
*       const sql = await getSql();
*       return sql`select * from todos where user_id = ${context.userId}`;
*     });
*
* Signed out with auth on (live preview included) -> throws `UnauthorizedError`
* (see `verify.server.ts`). With auth disabled (`VITE_AUTH_ENABLED=false`, the
* shipped default) it resolves the shared dev user — but throws instead when a
* `DATABASE_URL` is also set, so an app without sign-in must not use this at
* all. On the auth-on path, use it on every server function that touches
* per-user data and scope every query by `context.userId`.
*/
var authMiddleware = createMiddleware({ type: "function" }).client(async ({ next }) => {
	const { getBearerToken } = await import("./client-IWHfIGH2.mjs").then((n) => n.n);
	return next({ sendContext: { bearerToken: getBearerToken() ?? void 0 } });
}).server(async ({ next, context }) => {
	const { assertSameSiteRequest } = await import("./isolation.server-CGNg1r0B.mjs");
	const { requireUserId } = await import("./verify.server-Bkq6DXst.mjs");
	assertSameSiteRequest();
	return next({ context: { userId: await requireUserId(context.bearerToken) } });
});
var DEPARTMENTS = [
	{
		id: "hosting",
		title: "Hospitality & spatial hosting",
		line: "Private arrival, the room, the bar, and the kitchen."
	},
	{
		id: "companion",
		title: "Companion & social engagement",
		line: "Conversation, the house’s private rooms, and arranged outings."
	},
	{
		id: "wellness",
		title: "Wellness, sensory & boundaries",
		line: "The suite’s calm, and the limits that stay in force."
	},
	{
		id: "logistics",
		title: "Pacing & administration",
		line: "Time, discretion, and a folio that never enters the conversation."
	}
];
var SERVICES = [
	{
		slug: "in-suite-reception",
		department: "hosting",
		name: "Exclusive in-suite reception",
		summary: "Greet at the suite or a VIP entrance. The main lobby is never used.",
		brief: "Meet the guest at the private entrance or the suite door. Confirm the alias, walk them in, and keep staff off the corridor.",
		standing: false,
		supplementCents: 0
	},
	{
		slug: "suite-ambience",
		department: "hosting",
		name: "Ambient suite customization",
		summary: "Lighting, climate, and sound set to the mood profile before they sit.",
		brief: "Apply the mood profile before arrival: lights, climate, playlist. Adjust only if the guest asks.",
		standing: false,
		supplementCents: 0
	},
	{
		slug: "mixology",
		department: "hosting",
		name: "Private mixology & bar",
		summary: "The hostess serves from the suite bar. Nothing is paid in the room.",
		brief: "Work the suite bar. Pour, leave the glass, and let the desk post the folio. Do not quote a price.",
		standing: false,
		supplementCents: 0
	},
	{
		slug: "private-dining",
		department: "hosting",
		name: "In-suite dining",
		summary: "Courses from the kitchen, paced inside the suite.",
		brief: "Call courses one at a time. The kitchen plates; the hostess serves; the corridor stays clear between courses.",
		standing: false,
		supplementCents: 22e4
	},
	{
		slug: "intellectual-company",
		department: "companion",
		name: "Intellectual companionship",
		summary: "Unhurried conversation matched to the guest’s world.",
		brief: "Listen first. Stay with the guest’s subjects. No performance, no script beyond the agreed persona.",
		standing: false,
		supplementCents: 0
	},
	{
		slug: "social-accompaniment",
		department: "companion",
		name: "On-property accompaniment",
		summary: "Private gaming room, members’ lounge, or a viewing box.",
		brief: "Move with the guest through restricted rooms only. Return to the suite when the block says so.",
		standing: false,
		supplementCents: 0
	},
	{
		slug: "local-excursion",
		department: "companion",
		name: "Guided local excursion",
		summary: "Off-property with the hotel car, shopping, or a cultural booking.",
		brief: "The hotel car is already on the folio. The hostess hosts; the driver does not enter the conversation.",
		standing: false,
		supplementCents: 14e4
	},
	{
		slug: "persona",
		department: "companion",
		name: "Experiential persona",
		summary: "One agreed social frame, held for the whole block.",
		brief: "Hold the chosen frame from the greeting until the bookend. Drop it cleanly when the window closes.",
		standing: false,
		supplementCents: 0
	},
	{
		slug: "wellness",
		department: "wellness",
		name: "Private wellness facilitation",
		summary: "Hydrotherapy, aromatics, or access to the spa suite.",
		brief: "Draw the bath or set the diffuser before the guest is in the room. Stay only as the brief allows.",
		standing: false,
		supplementCents: 65e3
	},
	{
		slug: "sensory",
		department: "wellness",
		name: "Sensory environment",
		summary: "Blackout, white noise, and the lighting array for deep rest.",
		brief: "Build the sensory room from the controls. This is rest and privacy, not a show.",
		standing: false,
		supplementCents: 0
	},
	{
		slug: "gatekeeping",
		department: "wellness",
		name: "Spatial security & filtering",
		summary: "The hostess is the only door. Staff and phones wait outside.",
		brief: "Silence house notifications. Defer housekeeping and room service. Admit someone only if the guest asks.",
		standing: false,
		supplementCents: 0
	},
	{
		slug: "boundaries",
		department: "wellness",
		name: "Operational boundary adherence",
		summary: "The code of conduct and the hostess’s own limits stay in force.",
		brief: "If a request leaves the brief or her comfort, stop, return to the suite standard, and note the desk.",
		standing: true,
		supplementCents: 0
	},
	{
		slug: "pacing",
		department: "logistics",
		name: "Session pacing",
		summary: "Reception, the heart of the block, then an unhurried close.",
		brief: "Do not rush the middle and do not linger past the window. The phase on the desk is the truth.",
		standing: true,
		supplementCents: 0
	},
	{
		slug: "bookends",
		department: "logistics",
		name: "Temporal bookends",
		summary: "A clear start and a polished end to the hosting persona.",
		brief: "Open on the alias and the frame. Close with a social cue, not a clock. The persona ends at the door.",
		standing: true,
		supplementCents: 0
	},
	{
		slug: "discretion",
		department: "logistics",
		name: "Discretion & non-disclosure",
		summary: "No images, no recordings, no story that leaves the house.",
		brief: "Devices stay down. Nothing about the guest is repeated off this desk. POPIA applies to every note.",
		standing: true,
		supplementCents: 0
	},
	{
		slug: "folio-settlement",
		department: "logistics",
		name: "Folio settlement",
		summary: "Fees, drinks, and extra time post to the room or a corporate account.",
		brief: "Never discuss money in the suite. Extensions and gratuities are desk actions on the folio.",
		standing: true,
		supplementCents: 0
	}
];
var ELECTIVES = SERVICES.filter((s) => !s.standing);
var STANDING = SERVICES.filter((s) => s.standing);
var DURATIONS = [
	{
		code: "arrival",
		label: "Arrival block",
		detail: "90 minutes",
		cents: 18e4
	},
	{
		code: "evening",
		label: "Evening hosting",
		detail: "4 hours",
		cents: 64e4
	},
	{
		code: "residency",
		label: "Overnight residency",
		detail: "Until 10:00",
		cents: 185e4
	}
];
var PERSONAS = [
	{
		id: "conversationalist",
		label: "Relaxed conversationalist"
	},
	{
		id: "gala",
		label: "High-society gala companion"
	},
	{
		id: "social",
		label: "Social hosting"
	},
	{
		id: "wellness-quiet",
		label: "Quiet wellness attendant"
	}
];
var MOODS = [
	{
		id: "amber",
		label: "Amber evening",
		lighting: 32,
		climateTenths: 220,
		playlist: "evening-strings",
		blackout: false,
		whiteNoise: false,
		aromatherapy: "cedar",
		hydrotherapy: false
	},
	{
		id: "gallery",
		label: "Cool gallery",
		lighting: 62,
		climateTenths: 200,
		playlist: "low-piano",
		blackout: false,
		whiteNoise: false,
		aromatherapy: "none",
		hydrotherapy: false
	},
	{
		id: "quiet",
		label: "Deep quiet",
		lighting: 12,
		climateTenths: 210,
		playlist: "rain-room",
		blackout: true,
		whiteNoise: true,
		aromatherapy: "neroli",
		hydrotherapy: false
	},
	{
		id: "celebration",
		label: "Celebration",
		lighting: 74,
		climateTenths: 215,
		playlist: "cape-jazz",
		blackout: false,
		whiteNoise: false,
		aromatherapy: "neroli",
		hydrotherapy: false
	}
];
var PLAYLISTS = [
	{
		id: "evening-strings",
		label: "Evening strings"
	},
	{
		id: "cape-jazz",
		label: "Cape jazz"
	},
	{
		id: "low-piano",
		label: "Low piano"
	},
	{
		id: "rain-room",
		label: "Rain room"
	}
];
var AROMAS = [
	{
		id: "none",
		label: "None"
	},
	{
		id: "cedar",
		label: "Cedar"
	},
	{
		id: "neroli",
		label: "Neroli"
	},
	{
		id: "smoke",
		label: "Smoke"
	}
];
var SUITES = [
	"The Cedar Suite",
	"Pinelands Villa",
	"Garden Court 4",
	"River Wing 12"
];
var WINDOWS = [
	"Tonight",
	"Tomorrow evening",
	"This weekend"
];
var PHASES = [
	{
		id: "reception",
		label: "Reception",
		cue: "Greet at the private entrance. Confirm the alias, the persona, and that the folio is already open."
	},
	{
		id: "ambient",
		label: "Ambience",
		cue: "Set light, climate, and sound before they settle. Stage the first glass or the first course."
	},
	{
		id: "active",
		label: "Hosting",
		cue: "Conversation, dining, or the outing. Hold the gate. Do not discuss money."
	},
	{
		id: "wind_down",
		label: "Wind-down",
		cue: "Soften the room. Water, not a new round. Cue the close without announcing the clock."
	},
	{
		id: "closed",
		label: "Closed",
		cue: "The persona ends at the door. Return the suite to house standard. The folio is final."
	}
];
var BAR = [
	{
		id: "cabernet",
		name: "Stellenbosch Cabernet, glass",
		cents: 28e3
	},
	{
		id: "champagne",
		name: "Champagne, half bottle",
		cents: 95e3
	},
	{
		id: "negroni",
		name: "House negroni",
		cents: 22e3
	},
	{
		id: "amarula",
		name: "Amarula on ice",
		cents: 16e3
	},
	{
		id: "water",
		name: "Still water & citrus",
		cents: 0
	}
];
var MENU = [
	{
		course: 1,
		dish: "Citrus-cured line fish, fennel"
	},
	{
		course: 2,
		dish: "Karoo lamb, rosemary jus"
	},
	{
		course: 3,
		dish: "Dark chocolate, sea salt"
	}
];
var CONDUCT = [
	{
		code: "nda",
		label: "Non-disclosure in force"
	},
	{
		code: "devices",
		label: "No recording devices"
	},
	{
		code: "boundaries",
		label: "Hostess comfort zones"
	},
	{
		code: "conduct",
		label: "Hotel code of conduct"
	},
	{
		code: "folio",
		label: "Settlement on the folio only"
	},
	{
		code: "popia",
		label: "Guest data stays on this desk"
	}
];
var GATE_SOURCES = [
	"Room service",
	"Front office",
	"Housekeeping",
	"External call",
	"Do-not-disturb"
];
var GATE_ACTIONS = [
	{
		id: "silenced",
		label: "Silenced"
	},
	{
		id: "deferred",
		label: "Deferred to wind-down"
	},
	{
		id: "admitted",
		label: "Admitted"
	}
];
var EXTENSION_CENTS = 16e4;
var GRATUITY = [
	2e4,
	5e4,
	1e5
];
var HOUSE_MENU = SERVICES.map((s) => s.slug).join(",");
var ROSTER = [
	{
		key: "thandi",
		name: "Thandi",
		vibe: "Elegant",
		portrait: "/hostesses/thandi.jpg",
		bio: "Holds an evening at the guest’s pace. She offers the full house menu, the same one every hostess holds.",
		languages: "English, isiXhosa, Afrikaans",
		hours: "Evenings",
		specialties: HOUSE_MENU
	},
	{
		key: "naledi",
		name: "Naledi",
		vibe: "Warm",
		portrait: "/hostesses/naledi.jpg",
		bio: "Dinner service, unhurried talk, and the same menu as the rest of the floor.",
		languages: "English, Sesotho",
		hours: "Dinner service",
		specialties: HOUSE_MENU
	},
	{
		key: "lerato",
		name: "Lerato",
		vibe: "Confident",
		portrait: "/hostesses/lerato.jpg",
		bio: "The lounge, the hotel car, and every service on the house list.",
		languages: "English, Setswana, Afrikaans",
		hours: "Flexible",
		specialties: HOUSE_MENU
	},
	{
		key: "ayanda",
		name: "Ayanda",
		vibe: "Calm",
		portrait: "/hostesses/ayanda.jpg",
		bio: "Quiet rooms and the spa suite. The menu does not change because the mood does.",
		languages: "English, isiZulu",
		hours: "Afternoons & late",
		specialties: HOUSE_MENU
	},
	{
		key: "zanele",
		name: "Zanele",
		vibe: "Bold",
		portrait: "/hostesses/zanele.jpg",
		bio: "A stronger social frame, still the same sixteen services.",
		languages: "English, isiXhosa",
		hours: "Late",
		specialties: HOUSE_MENU
	},
	{
		key: "mpho",
		name: "Mpho",
		vibe: "Smooth",
		portrait: "/hostesses/mpho.jpg",
		bio: "Bar and conversation. Nothing on her card is missing from the others.",
		languages: "English, Sepedi",
		hours: "Evenings",
		specialties: HOUSE_MENU
	},
	{
		key: "thato",
		name: "Thato",
		vibe: "Playful",
		portrait: "/hostesses/thato.jpg",
		bio: "Lighter company. The house menu, including the quiet options, stays open.",
		languages: "English, Afrikaans",
		hours: "Evenings & weekends",
		specialties: HOUSE_MENU
	},
	{
		key: "kea",
		name: "Kea",
		vibe: "Fresh",
		portrait: "/hostesses/kea.jpg",
		bio: "Daytime blocks and arrivals. She hosts the full list, not a shorter one.",
		languages: "English, isiXhosa",
		hours: "Daytime",
		specialties: HOUSE_MENU
	},
	{
		key: "amina",
		name: "Amina",
		vibe: "Refined",
		portrait: "/hostesses/amina.jpg",
		bio: "Gala frames and private dining, drawn from the shared menu.",
		languages: "English, Arabic, Afrikaans",
		hours: "Evenings",
		specialties: HOUSE_MENU
	},
	{
		key: "lindiwe",
		name: "Lindiwe",
		vibe: "Soft",
		portrait: "/hostesses/lindiwe.jpg",
		bio: "Low light and a slower close. Wellness and hosting are both hers.",
		languages: "English, isiZulu",
		hours: "Afternoons",
		specialties: HOUSE_MENU
	},
	{
		key: "nomsa",
		name: "Nomsa",
		vibe: "Direct",
		portrait: "/hostesses/nomsa.jpg",
		bio: "Clear pacing and a firm gate. The menu is the house’s, not a private edit.",
		languages: "English, Sesotho, Afrikaans",
		hours: "Overnights",
		specialties: HOUSE_MENU
	},
	{
		key: "palesa",
		name: "Palesa",
		vibe: "Bright",
		portrait: "/hostesses/palesa.jpg",
		bio: "Celebrations and the members’ rooms, on the same list as a quiet night.",
		languages: "English, Setswana",
		hours: "Weekends",
		specialties: HOUSE_MENU
	},
	{
		key: "bontle",
		name: "Bontle",
		vibe: "Quiet",
		portrait: "/hostesses/bontle.jpg",
		bio: "Few words, full service. Sensory and reception are included, not extras.",
		languages: "English, isiXhosa",
		hours: "Late",
		specialties: HOUSE_MENU
	},
	{
		key: "refilwe",
		name: "Refilwe",
		vibe: "Magnetic",
		portrait: "/hostesses/refilwe.jpg",
		bio: "Social hosting. She does not drop dining, the gate, or the folio rules.",
		languages: "English, Sepedi, Afrikaans",
		hours: "Evenings",
		specialties: HOUSE_MENU
	},
	{
		key: "karabo",
		name: "Karabo",
		vibe: "Polished",
		portrait: "/hostesses/karabo.jpg",
		bio: "The bookend and the greeting. Every professional option on the floor is hers too.",
		languages: "English, Setswana",
		hours: "Flexible",
		specialties: HOUSE_MENU
	}
];
function serviceBySlug(slug) {
	return SERVICES.find((s) => s.slug === slug);
}
function durationByCode(code) {
	return DURATIONS.find((d) => d.code === code);
}
function personaLabel(id) {
	return PERSONAS.find((p) => p.id === id)?.label ?? id;
}
function moodById(id) {
	return MOODS.find((m) => m.id === id);
}
function phaseById(id) {
	return PHASES.find((p) => p.id === id);
}
function zar(cents) {
	const rands = Math.round(cents / 100);
	const body = String(Math.abs(rands)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
	return `${rands < 0 ? "−" : ""}R ${body}`;
}
function splitSlugs(value) {
	return value.split(",").map((s) => s.trim()).filter(Boolean);
}
//#endregion
export { moodById as C, splitSlugs as D, serviceBySlug as E, zar as O, durationByCode as S, phaseById as T, SERVICES as _, DURATIONS as a, WINDOWS as b, GATE_ACTIONS as c, MENU as d, MOODS as f, ROSTER as g, PLAYLISTS as h, DEPARTMENTS as i, GATE_SOURCES as l, PHASES as m, BAR as n, ELECTIVES as o, PERSONAS as p, CONDUCT as r, EXTENSION_CENTS as s, AROMAS as t, GRATUITY as u, STANDING as v, personaLabel as w, authMiddleware as x, SUITES as y };
