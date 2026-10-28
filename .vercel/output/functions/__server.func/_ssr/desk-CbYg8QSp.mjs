import { o as __toESM } from "../_runtime.mjs";
import { J as require_react, x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { r as createServerFn } from "./ssr.mjs";
import { D as splitSlugs, E as serviceBySlug, O as zar, S as durationByCode, T as phaseById, _ as SERVICES, a as DURATIONS, b as WINDOWS, c as GATE_ACTIONS, f as MOODS, h as PLAYLISTS, i as DEPARTMENTS, l as GATE_SOURCES, m as PHASES, n as BAR, o as ELECTIVES, p as PERSONAS, r as CONDUCT, s as EXTENSION_CENTS, t as AROMAS, u as GRATUITY, v as STANDING, w as personaLabel, x as authMiddleware, y as SUITES } from "./catalog-CTbdx2-U.mjs";
import { a as createSsrRpc, o as deskMessages, p as replyAsHostess, u as listDeskThreads } from "./comms-BsPr7Mga.mjs";
import { a as hasGateSessionMarker, t as GROK_PROVIDERS } from "./server-BCX7neK4.mjs";
import { a as ConciergeBell, i as MessageCircle, o as CalendarPlus, r as ScrollText, s as ArrowLeft, t as Users } from "../_libs/lucide-react.mjs";
import { a as Label, i as GoldButton, n as Chip, o as clock, r as GhostButton, s as errText, t as Block } from "./ui-Debh48St.mjs";
import { i as signOut, r as signIn, t as authClient } from "./client-IWHfIGH2.mjs";
import { i as useCurrentUserState, n as startPaystack, r as useCurrentUser, t as payEmail } from "./paystack-DZFZkEtd.mjs";
import { i as rise, n as descend, r as liveOnce, t as arrive } from "./motion-DD2WP4PK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/desk-CbYg8QSp.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var subscribeToNothing = () => () => {};
var noGateSessionOnServer = () => false;
/**
* Minimal signed-in identity chip + sign-out. Restyle freely (see the
* `design-ui` skill). Sign-out is only shown when auth is enabled (the
* disabled-auth dev user has nothing to sign out of) and the session is not
* gate-materialized — behind the gate the next request signs the viewer
* straight back in, so a sign-out control there is a broken loop.
*/
function UserButton() {
	const user = useCurrentUser();
	const [signingOut, setSigningOut] = (0, import_react.useState)(false);
	const gateSession = (0, import_react.useSyncExternalStore)(subscribeToNothing, hasGateSessionMarker, noGateSessionOnServer);
	if (!user) return null;
	const label = user.displayName ?? user.primaryEmail ?? "Account";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex items-center gap-2",
		children: [
			user.profileImageUrl ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
				src: user.profileImageUrl,
				alt: "",
				className: "h-8 w-8 rounded-full object-cover"
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "grid h-8 w-8 place-items-center rounded-full bg-black/10 text-sm font-medium dark:bg-white/20",
				children: label.charAt(0).toUpperCase()
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-sm font-medium",
				children: label
			}),
			!gateSession && /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				disabled: signingOut,
				onClick: () => {
					setSigningOut(true);
					signOut().catch(() => setSigningOut(false));
				},
				className: "cursor-pointer text-sm underline-offset-4 opacity-70 hover:underline disabled:cursor-wait disabled:no-underline",
				children: signingOut ? "Signing out…" : "Sign out"
			})
		]
	});
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
var loadDesk = createServerFn({ method: "GET" }).middleware([authMiddleware]).handler(createSsrRpc("43fd69c9abe2a41295b8d895be8e024f74bacf774cf27e080abfea8f1af9e5c3"));
var getReservation = createServerFn({ method: "GET" }).middleware([authMiddleware]).validator((id) => str(id, "Reservation", 80)).handler(createSsrRpc("0d211ed0c13fa9149028687d5c832f929a615ff14104170cee87c51de91b4c97"));
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
var createReservation = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(parseBooking).handler(createSsrRpc("9d744c983f99f4632b0bfa32e8324e8cbb866f7eb2865cc0fb3e08ffef37c1f5"));
function parseId(input) {
	return { id: str(asRecord(input).id, "Reservation", 80) };
}
var advancePhase = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(parseId).handler(createSsrRpc("5e2835ddeef5ecc42f0c76f586e6aac53c9e17ed6fd6333bb2388c0908ea4058"));
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
var saveEnvironment = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(parseEnvironment).handler(createSsrRpc("bcd7a16aea7571196ac156e6fe123d3c451c8c8c41e15d6e6bac55c6e46a7f6c"));
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
var orderPour = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(parseBar).handler(createSsrRpc("b32c81df8a22f3f8ce2088a74b2ffaec02c54131dd49a578e1202354f4478375"));
var servePour = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = asRecord(input);
	return {
		id: str(raw.id, "Reservation", 80),
		ticketId: str(raw.ticketId, "Ticket", 80)
	};
}).handler(createSsrRpc("a4312d881bf4f71d39d91c5bce640b2b3d0e10038941291eb2282f69bf1e2f81"));
var advanceCourse = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = asRecord(input);
	return {
		id: str(raw.id, "Reservation", 80),
		courseId: str(raw.courseId, "Course", 80)
	};
}).handler(createSsrRpc("bf1cf229ba9663a61c8fe39c000a92d79b8987f1c62e59bd3817f52afd89f4cc"));
var postExtension = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = asRecord(input);
	return {
		id: str(raw.id, "Reservation", 80),
		paystackRef: payRef(raw.paystackRef)
	};
}).handler(createSsrRpc("eb6415660450bf7054f765f6de6ea8f0aa45b2b7e62a2850152c957346ffb992"));
var postGratuity = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = asRecord(input);
	const cents = Number(raw.cents);
	if (!GRATUITY.includes(cents)) throw new Error("Choose a folio gratuity");
	return {
		id: str(raw.id, "Reservation", 80),
		cents,
		paystackRef: payRef(raw.paystackRef)
	};
}).handler(createSsrRpc("2db119ad245155320da3d9e09b283c79f8f736be61a3fadb0aad581726c17369"));
var logGate = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = asRecord(input);
	return {
		id: str(raw.id, "Reservation", 80),
		source: oneOf(raw.source, GATE_SOURCES, "source"),
		action: oneOf(raw.action, GATE_ACTIONS.map((a) => a.id), "action")
	};
}).handler(createSsrRpc("45339d6604fe36f34599eab5ba027e1017b74ec49c4fbfd4a0e04481e542e4fc"));
var setConduct = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = asRecord(input);
	return {
		id: str(raw.id, "Reservation", 80),
		code: oneOf(raw.code, CONDUCT.map((c) => c.code), "check"),
		adhered: raw.adhered === true
	};
}).handler(createSsrRpc("65de813bf7d08dde28ec3196cbb4ec3a150d9d9e14b020e929bac43b3eb8887e"));
var addNote = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = asRecord(input);
	return {
		id: str(raw.id, "Reservation", 80),
		author: oneOf(raw.author, ["desk", "hostess"], "author"),
		body: str(raw.body, "Note", 500)
	};
}).handler(createSsrRpc("e41e152161af3faa970ca2776e99ec9015ae47ca478228ad8ab9e80e1df37005"));
var setAccount = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = asRecord(input);
	return {
		id: str(raw.id, "Reservation", 80),
		account: oneOf(raw.account, ["room", "corporate"], "account")
	};
}).handler(createSsrRpc("3fa8502ebeb425c239e8bbaed8b304822af218c5de78dcfcf9ee600e540e7a7f"));
var cancelReservation = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator(parseId).handler(createSsrRpc("e3598540ecac4c5ea9d725fc6c442bfecb6bc8b397a5d621e4a3f5aa060283ff"));
var submitApplication = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = asRecord(input);
	return {
		name: str(raw.name, "Name", 60),
		languages: str(raw.languages, "Languages", 80),
		hours: str(raw.hours, "Hours", 80),
		message: str(raw.message, "Note", 600)
	};
}).handler(createSsrRpc("3c2ec6e1cd00bc23fa73c8b0bf8427dd91a0ceefae06d70174059262d9e21dee"));
var reviewApplication = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = asRecord(input);
	return {
		id: str(raw.id, "Application", 80),
		decision: oneOf(raw.decision, ["accepted", "declined"], "decision")
	};
}).handler(createSsrRpc("1d966b39addcdbbf3993492bf5a899c2b221881eebdc9c2d4f2f0fba36e5fb01"));
var setHostessStatus = createServerFn({ method: "POST" }).middleware([authMiddleware]).validator((input) => {
	const raw = asRecord(input);
	return {
		id: str(raw.id, "Hostess", 120),
		status: oneOf(raw.status, ["active", "paused"], "status")
	};
}).handler(createSsrRpc("7c40cf7e798c150e707ad3182c679a463f6e9c8b4e39ae2a49470c76f3bda038"));
function DeskLine() {
	const [rows, setRows] = (0, import_react.useState)([]);
	const [open, setOpen] = (0, import_react.useState)(null);
	const [body, setBody] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	async function refresh() {
		setRows(await listDeskThreads());
	}
	(0, import_react.useEffect)(() => {
		refresh().catch((e) => setError(errText(e)));
	}, []);
	(0, import_react.useEffect)(() => {
		if (!open) return;
		const id = open.id;
		const timer = setInterval(() => {
			deskMessages({ data: id }).then(setOpen).catch(() => void 0);
		}, 4e3);
		return () => clearInterval(timer);
	}, [open?.id]);
	async function load(id) {
		setError("");
		try {
			setOpen(await deskMessages({ data: id }));
		} catch (e) {
			setError(errText(e));
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-3",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "A line opens when Paystack finishes. Anonymous access is R100. Sessions, pours, extensions, and gratuities use the same checkout."
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-danger",
				role: "alert",
				children: error
			}) : null,
			open ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: `${rise} rounded-2xl border border-line bg-surface p-4`,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "min-h-11 text-sm text-gold",
						onClick: () => setOpen(null),
						children: "All lines"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "font-display text-2xl italic",
						children: open.hostessName
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "mt-3 flex max-h-80 flex-col gap-2 overflow-y-auto",
						children: open.messages.map((msg) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: msg.author === "guest" ? "text-sm text-muted" : "text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-xs tracking-wide text-gold uppercase",
								children: msg.author
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: msg.body })]
						}, msg.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						className: "mt-3",
						rows: 3,
						value: body,
						placeholder: "Reply as the hostess",
						onChange: (e) => setBody(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoldButton, {
							disabled: !body.trim(),
							onClick: () => replyAsHostess({ data: {
								threadId: open.id,
								body: body.trim()
							} }).then((next) => {
								setBody("");
								setOpen(next);
							}).catch((e) => setError(errText(e))),
							children: "Send"
						})
					})
				]
			}) : rows.map((row) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => load(row.id),
				className: `${rise} rounded-2xl border border-line bg-surface p-4 text-left`,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-baseline justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display text-xl italic",
						children: row.guest_label
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm text-gold",
						children: row.amount_cents ? zar(row.amount_cents) : "Account"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm text-muted",
					children: [
						row.hostess_name,
						" · ",
						row.guest_kind,
						row.paystack_ref ? ` · ${row.paystack_ref}` : ""
					]
				})]
			}, row.id)),
			!open && !rows.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-muted",
				children: "No lines yet."
			}) : null
		]
	});
}
function SessionView({ bundle, onChange, onBack }) {
	const { user } = useCurrentUserState();
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	const [note, setNote] = (0, import_react.useState)("");
	const [author, setAuthor] = (0, import_react.useState)("desk");
	const [draft, setDraft] = (0, import_react.useState)(bundle.environment);
	const reservation = bundle.reservation;
	const locked = reservation.status === "closed" || reservation.status === "cancelled";
	const phaseIndex = PHASES.findIndex((p) => p.id === reservation.phase);
	const next = PHASES[phaseIndex + 1];
	const phase = phaseById(reservation.phase);
	const total = bundle.folio.reduce((sum, line) => sum + Number(line.cents), 0);
	(0, import_react.useEffect)(() => {
		setDraft(bundle.environment);
	}, [bundle.environment]);
	async function charge(cents, description) {
		if (cents <= 0) return "";
		return (await startPaystack({
			amountCents: cents,
			email: payEmail(user?.primaryEmail),
			description
		})).reference;
	}
	async function run(work) {
		setBusy(true);
		setError("");
		try {
			onChange(await work());
		} catch (e) {
			setError(errText(e));
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4 pb-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: arrive,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
						type: "button",
						onClick: onBack,
						className: "mb-3 inline-flex min-h-11 items-center gap-2 text-sm text-gold",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowLeft, { className: "size-4" }), "Floor"]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs tracking-widest text-gold uppercase",
						children: reservation.window_label
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-4xl italic",
						children: reservation.guest_name
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-sm text-muted",
						children: [
							reservation.suite,
							" · ",
							reservation.hostess_name,
							" · ",
							durationByCode(reservation.duration_code)?.label
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: reservation.status === "live" ? liveOnce : "",
							children: reservation.status
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted",
							children: [
								" · ",
								phase?.label,
								" · ",
								reservation.folio_account === "corporate" ? "Corporate account" : "Room folio"
							]
						})]
					})
				]
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: `${rise} text-sm text-danger`,
				role: "alert",
				children: error
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: `${rise} rounded-2xl border border-line bg-surface p-4`,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs tracking-widest text-gold uppercase",
						children: "Pacing"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ol", {
						className: "mt-3 flex flex-wrap gap-2",
						children: PHASES.map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "rounded-full border px-3 py-1 text-xs " + (i === phaseIndex ? "border-gold text-gold" : i < phaseIndex ? "border-line text-fg" : "border-line text-muted"),
							children: item.label
						}, item.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-3 text-sm leading-relaxed text-muted",
						children: phase?.cue
					}),
					next && !locked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-4",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GoldButton, {
							disabled: busy,
							onClick: () => run(() => advancePhase({ data: { id: reservation.id } })),
							children: ["Move to ", next.label]
						})
					}) : null
				]
			}, reservation.phase),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Block, {
				title: "Run of show",
				kicker: "Services",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "flex flex-col gap-3",
						children: splitSlugs(reservation.services).map((slug) => {
							const service = serviceBySlug(slug);
							if (!service) return null;
							return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm font-medium",
								children: service.name
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-sm leading-relaxed text-muted",
								children: service.brief
							})] }, slug);
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs tracking-wide text-muted uppercase",
						children: "Always in force"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "flex flex-col gap-2",
						children: STANDING.map((service) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
							className: "text-sm text-muted",
							children: service.name
						}, service.slug))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm",
						children: ["Persona · ", personaLabel(reservation.persona)]
					}),
					reservation.boundary_note ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm leading-relaxed text-muted",
						children: reservation.boundary_note
					}) : null
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Block, {
				title: "Suite",
				kicker: "Ambience",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: ["Light ", draft.lighting] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "range",
						min: 0,
						max: 100,
						value: draft.lighting,
						disabled: locked,
						"aria-label": "Lighting",
						onChange: (e) => setDraft({
							...draft,
							lighting: Number(e.target.value)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Label, { children: [
						"Climate ",
						(draft.climate_tenths / 10).toFixed(1),
						"°"
					] }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						type: "range",
						min: 18,
						max: 26,
						step: .5,
						value: draft.climate_tenths / 10,
						disabled: locked,
						"aria-label": "Climate",
						onChange: (e) => setDraft({
							...draft,
							climate_tenths: Math.round(Number(e.target.value) * 10)
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: PLAYLISTS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
							on: draft.playlist === item.id,
							disabled: locked,
							onClick: () => setDraft({
								...draft,
								playlist: item.id
							}),
							children: item.label
						}, item.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: AROMAS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
							on: draft.aromatherapy === item.id,
							disabled: locked,
							onClick: () => setDraft({
								...draft,
								aromatherapy: item.id
							}),
							children: item.label
						}, item.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
								on: draft.blackout,
								disabled: locked,
								onClick: () => setDraft({
									...draft,
									blackout: !draft.blackout
								}),
								children: "Blackout"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
								on: draft.white_noise,
								disabled: locked,
								onClick: () => setDraft({
									...draft,
									white_noise: !draft.white_noise
								}),
								children: "White noise"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
								on: draft.hydrotherapy,
								disabled: locked,
								onClick: () => setDraft({
									...draft,
									hydrotherapy: !draft.hydrotherapy
								}),
								children: "Hydrotherapy"
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoldButton, {
						disabled: busy || locked,
						onClick: () => run(() => saveEnvironment({ data: {
							id: reservation.id,
							lighting: draft.lighting,
							climateTenths: draft.climate_tenths,
							playlist: draft.playlist,
							blackout: draft.blackout,
							whiteNoise: draft.white_noise,
							aromatherapy: draft.aromatherapy,
							hydrotherapy: draft.hydrotherapy
						} })),
						children: "Save the room"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Block, {
				title: "Bar",
				kicker: "Folio, not cash",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-wrap gap-2",
					children: BAR.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Chip, {
						disabled: busy || locked,
						onClick: () => run(async () => {
							const paystackRef = await charge(item.cents, item.name);
							return orderPour({ data: {
								id: reservation.id,
								itemId: item.id,
								notes: "",
								paystackRef
							} });
						}),
						children: [item.name, item.cents ? ` · ${zar(item.cents)}` : ""]
					}, item.id))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "flex flex-col gap-2",
					children: bundle.bar.map((ticket) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center justify-between gap-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [ticket.item, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
							className: "text-muted",
							children: [
								" · ",
								ticket.status,
								" · ",
								clock(ticket.created_at)
							]
						})] }), ticket.status !== "served" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostButton, {
							disabled: busy,
							onClick: () => run(() => servePour({ data: {
								id: reservation.id,
								ticketId: ticket.id
							} })),
							children: "Served"
						}) : null]
					}, ticket.id))
				})]
			}),
			bundle.courses.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
				title: "Kitchen",
				kicker: "Courses",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "flex flex-col gap-3",
					children: bundle.courses.map((course) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "flex items-center justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-sm",
							children: [
								course.course_no,
								". ",
								course.dish
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted uppercase",
							children: course.status
						})] }), course.status !== "served" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostButton, {
							disabled: busy || locked,
							onClick: () => run(() => advanceCourse({ data: {
								id: reservation.id,
								courseId: course.id
							} })),
							children: course.status === "kitchen" ? "Plate" : "Serve"
						}) : null]
					}, course.id))
				})
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Block, {
				title: "Gate",
				kicker: "Undisturbed",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "flex flex-col gap-2",
					children: GATE_SOURCES.map((source) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-center gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "min-w-32 text-sm",
							children: source
						}), GATE_ACTIONS.map((action) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
							disabled: busy || locked,
							onClick: () => run(() => logGate({ data: {
								id: reservation.id,
								source,
								action: action.id
							} })),
							children: action.label
						}, action.id))]
					}, source))
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
					className: "flex flex-col gap-1",
					children: bundle.gates.map((event) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
						className: "text-sm text-muted",
						children: [
							clock(event.created_at),
							" · ",
							event.source,
							" · ",
							event.action
						]
					}, event.id))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
				title: "Conduct",
				kicker: "Code",
				children: CONDUCT.map((item) => {
					const row = bundle.conduct.find((c) => c.code === item.code);
					const adhered = row ? row.adhered === true : true;
					return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex min-h-11 items-center gap-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							className: "size-4",
							checked: adhered,
							disabled: busy,
							onChange: (e) => run(() => setConduct({ data: {
								id: reservation.id,
								code: item.code,
								adhered: e.target.checked
							} }))
						}), item.label]
					}, item.code);
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Block, {
				title: "Folio",
				kicker: zar(total),
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
							on: reservation.folio_account === "room",
							disabled: busy,
							onClick: () => run(() => setAccount({ data: {
								id: reservation.id,
								account: "room"
							} })),
							children: "Room"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
							on: reservation.folio_account === "corporate",
							disabled: busy,
							onClick: () => run(() => setAccount({ data: {
								id: reservation.id,
								account: "corporate"
							} })),
							children: "Corporate"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "flex flex-col gap-2",
						children: bundle.folio.map((line) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
							className: `${rise} flex items-baseline justify-between gap-3 text-sm`,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [line.description, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "text-muted",
								children: [
									" · ",
									line.settled_via,
									line.paystack_ref ? ` · ${line.paystack_ref}` : ""
								]
							})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-gold",
								children: zar(Number(line.cents))
							})]
						}, line.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted",
						children: "Posted by the desk. Not discussed in the suite."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostButton, {
							disabled: busy || locked,
							onClick: () => run(async () => {
								const paystackRef = await charge(EXTENSION_CENTS, "Extended hour");
								return postExtension({ data: {
									id: reservation.id,
									paystackRef
								} });
							}),
							children: "Add an hour"
						}), GRATUITY.map((cents) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(GhostButton, {
							disabled: busy || reservation.status === "cancelled",
							onClick: () => run(async () => {
								const paystackRef = await charge(cents, "House gratuity");
								return postGratuity({ data: {
									id: reservation.id,
									cents,
									paystackRef
								} });
							}),
							children: ["Gratuity ", zar(cents)]
						}, cents))]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Block, {
				title: "Desk notes",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
						className: "flex flex-col gap-3",
						children: bundle.notes.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
							className: "text-xs text-gold uppercase",
							children: [
								item.author,
								" · ",
								clock(item.created_at)
							]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-sm leading-relaxed",
							children: item.body
						})] }, item.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						rows: 3,
						value: note,
						placeholder: "Operational note",
						onChange: (e) => setNote(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
								on: author === "desk",
								onClick: () => setAuthor("desk"),
								children: "Desk"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
								on: author === "hostess",
								onClick: () => setAuthor("hostess"),
								children: "Hostess"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoldButton, {
								disabled: busy || !note.trim(),
								onClick: () => run(async () => {
									const next = await addNote({ data: {
										id: reservation.id,
										author,
										body: note.trim()
									} });
									setNote("");
									return next;
								}),
								children: "Add note"
							})
						]
					}),
					reservation.status !== "cancelled" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GhostButton, {
						disabled: busy,
						onClick: () => run(() => cancelReservation({ data: { id: reservation.id } })),
						children: "Cancel block"
					}) : null
				]
			})
		]
	});
}
function HouseApp() {
	const { user, isPending } = useCurrentUserState();
	const [mounted, setMounted] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => setMounted(true), []);
	if (!mounted || isPending) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Frame, {});
	if (!user) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Welcome, {});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Desk, {});
}
function Frame() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-screen w-full max-w-lg flex-col justify-center px-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs tracking-widest text-gold uppercase",
				children: "Maitland Hotel"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "mt-2 font-display text-4xl italic",
				children: "House desk"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-muted",
				children: "Opening the book."
			})
		]
	});
}
function Welcome() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-screen w-full max-w-lg flex-col gap-6 px-5 py-10",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: arrive,
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs tracking-widest text-gold uppercase",
						children: "Maitland Hotel"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "mt-2 font-display text-5xl italic leading-none",
						children: "House desk"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: `${descend} mt-4 max-w-sm text-sm leading-relaxed text-muted`,
						children: "Sixteen hostess services. The guest is met off the lobby. Every fee posts to the room folio, never in the suite."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: `${rise} flex flex-col gap-3`,
				children: [GROK_PROVIDERS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
					type: "button",
					onClick: () => signIn(p.providerId, { callbackURL: "/" }),
					className: "min-h-11 rounded-full bg-gold text-sm font-medium text-bg",
					children: ["Continue with ", p.label]
				}, p.providerId)), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmailGate, {})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "flex flex-col gap-3 pb-8",
				children: DEPARTMENTS.map((dept, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
					className: `${rise} rounded-2xl border border-line bg-surface p-4`,
					style: { animationDelay: `${i * 60}ms` },
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl italic",
							children: dept.title
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-1 text-sm text-muted",
							children: dept.line
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
							className: "mt-3 flex flex-col gap-1",
							children: SERVICES.filter((s) => s.department === dept.id).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
								className: "text-sm",
								children: [s.name, s.standing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
									className: "text-muted",
									children: " · standing"
								}) : null]
							}, s.slug))
						})
					]
				}, dept.id))
			})
		]
	});
}
function EmailGate() {
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [error, setError] = (0, import_react.useState)("");
	async function submit() {
		setBusy(true);
		setError("");
		const signUp = await authClient.signUp.email({
			email,
			password,
			name: name.trim() || "House"
		});
		if (signUp.error) {
			const signIn = await authClient.signIn.email({
				email,
				password
			});
			if (signIn.error) {
				setError(signIn.error.message || signUp.error.message || "Could not open the desk");
				setBusy(false);
				return;
			}
		}
		setBusy(false);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
		className: "mt-2 flex flex-col gap-3",
		onSubmit: (e) => {
			e.preventDefault();
			submit();
		},
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-center text-xs tracking-widest text-muted uppercase",
				children: "or email"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				value: name,
				placeholder: "Your name",
				autoComplete: "name",
				onChange: (e) => setName(e.target.value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				value: email,
				type: "email",
				placeholder: "Email",
				autoComplete: "email",
				onChange: (e) => setEmail(e.target.value)
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
				value: password,
				type: "password",
				placeholder: "Password",
				autoComplete: "current-password",
				onChange: (e) => setPassword(e.target.value)
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm text-danger",
				role: "alert",
				children: error
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "submit",
				disabled: busy || !email.includes("@") || password.length < 8,
				className: "min-h-11 rounded-full border border-gold text-sm text-gold disabled:opacity-50",
				children: busy ? "Opening…" : "Continue with email"
			})
		]
	});
}
function Desk() {
	const [data, setData] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)("");
	const [tab, setTab] = (0, import_react.useState)("floor");
	const [bundle, setBundle] = (0, import_react.useState)(null);
	async function refresh() {
		const next = await loadDesk();
		setData(next);
		return next;
	}
	(0, import_react.useEffect)(() => {
		refresh().catch((e) => setError(errText(e)));
	}, []);
	function remember(next) {
		setBundle(next);
		setData((prev) => {
			if (!prev) return prev;
			const row = next.reservation;
			const reservations = prev.reservations.some((r) => r.id === row.id) ? prev.reservations.map((r) => r.id === row.id ? row : r) : [row, ...prev.reservations];
			return {
				...prev,
				reservations
			};
		});
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "mx-auto min-h-screen w-full max-w-lg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex flex-wrap items-start justify-between gap-3 px-4 pt-5",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: arrive,
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs tracking-widest text-gold uppercase",
						children: "Maitland Hotel"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-3xl italic",
						children: "House desk"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(UserButton, {})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: `${descend} px-4 pt-2 text-xs tracking-wide text-muted`,
				children: "Discretion · Folio only · Code of conduct"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "px-4 pt-4 pb-28",
				children: [error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mb-3 text-sm text-danger",
					role: "alert",
					children: error
				}) : null, !data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm text-muted",
					children: "Loading the book…"
				}) : bundle ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SessionView, {
					bundle,
					onChange: remember,
					onBack: () => setBundle(null)
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: rise,
					children: [
						tab === "floor" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Floor, {
							rows: data.reservations,
							onOpen: (id) => {
								getReservation({ data: id }).then(setBundle).catch((e) => setError(errText(e)));
							}
						}) : null,
						tab === "services" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Services, {}) : null,
						tab === "book" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Book, {
							data,
							onBooked: (next) => {
								remember(next);
								setTab("floor");
							},
							onError: setError
						}) : null,
						tab === "line" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DeskLine, {}) : null,
						tab === "roster" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Roster, {
							data,
							onReload: () => refresh().catch((e) => setError(errText(e))),
							onError: setError
						}) : null
					]
				}, tab)]
			}),
			bundle ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
				className: "dock fixed inset-x-0 bottom-0 z-10 border-t border-line bg-bg",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto grid w-full max-w-lg grid-cols-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavButton, {
							tab: "floor",
							current: tab,
							onSelect: setTab,
							label: "Floor",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ConciergeBell, { className: "size-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavButton, {
							tab: "services",
							current: tab,
							onSelect: setTab,
							label: "Services",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollText, { className: "size-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavButton, {
							tab: "book",
							current: tab,
							onSelect: setTab,
							label: "Book",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CalendarPlus, { className: "size-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavButton, {
							tab: "line",
							current: tab,
							onSelect: setTab,
							label: "Line",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(MessageCircle, { className: "size-5" })
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(NavButton, {
							tab: "roster",
							current: tab,
							onSelect: setTab,
							label: "Roster",
							icon: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Users, { className: "size-5" })
						})
					]
				})
			})
		]
	});
}
function NavButton({ tab, current, onSelect, label, icon }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: () => onSelect(tab),
		className: "flex min-h-14 flex-col items-center justify-center gap-1 text-xs " + (tab === current ? "text-gold" : "text-muted"),
		children: [icon, label]
	});
}
function Floor({ rows, onOpen }) {
	if (!rows.length) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
		className: "text-sm text-muted",
		children: "No blocks yet. Book one from the desk."
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-col gap-3",
		children: rows.map((row, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
			type: "button",
			onClick: () => onOpen(row.id),
			className: `${rise} rounded-2xl border border-line bg-surface p-4 text-left`,
			style: { animationDelay: `${Math.min(i, 5) * 50}ms` },
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "flex items-baseline justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display text-2xl italic",
						children: row.guest_name
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-sm text-gold",
						children: zar(Number(row.folio_cents))
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm text-muted",
					children: [
						row.suite,
						" · ",
						row.hostess_name
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-2 text-xs tracking-wide text-gold uppercase",
					children: [
						row.window_label,
						" · ",
						phaseById(row.phase)?.label,
						" · ",
						row.status
					]
				})
			]
		}, row.id))
	});
}
function Services() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "flex flex-col gap-3",
		children: DEPARTMENTS.map((dept) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
			title: dept.title,
			kicker: dept.line,
			children: SERVICES.filter((s) => s.department === dept.id).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "text-sm font-medium",
				children: [
					s.name,
					s.standing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-normal text-muted",
						children: " · standing"
					}) : null,
					s.supplementCents ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
						className: "font-normal text-gold",
						children: [" · ", zar(s.supplementCents)]
					}) : null
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-sm leading-relaxed text-muted",
				children: s.summary
			})] }, s.slug))
		}, dept.id))
	});
}
function Book({ data, onBooked, onError }) {
	const active = data.hostesses.filter((h) => h.status === "active");
	const [guestName, setGuestName] = (0, import_react.useState)("");
	const [suite, setSuite] = (0, import_react.useState)(SUITES[0]);
	const [hostessId, setHostessId] = (0, import_react.useState)(active[0]?.id ?? "");
	const [services, setServices] = (0, import_react.useState)(["in-suite-reception", "suite-ambience"]);
	const [duration, setDuration] = (0, import_react.useState)("evening");
	const [persona, setPersona] = (0, import_react.useState)("conversationalist");
	const [mood, setMood] = (0, import_react.useState)("amber");
	const [windowLabel, setWindowLabel] = (0, import_react.useState)("Tonight");
	const [account, setAccount] = (0, import_react.useState)("room");
	const [boundary, setBoundary] = (0, import_react.useState)("");
	const [nda, setNda] = (0, import_react.useState)(false);
	const [busy, setBusy] = (0, import_react.useState)(false);
	const { user } = useCurrentUserState();
	function toggle(slug) {
		setServices((prev) => prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]);
	}
	async function submit() {
		const price = durationByCode(duration);
		const extra = services.reduce((sum, slug) => sum + (serviceBySlug(slug)?.supplementCents ?? 0), 0);
		setBusy(true);
		try {
			const paid = await startPaystack({
				amountCents: (price?.cents ?? 0) + extra,
				email: payEmail(user?.primaryEmail),
				description: `${price?.label ?? "Session"} · ${guestName.trim()}`
			});
			onBooked(await createReservation({ data: {
				guestName,
				suite,
				hostessId,
				services,
				duration,
				persona,
				mood,
				boundary,
				windowLabel,
				account,
				nda,
				paystackRef: paid.reference
			} }));
		} catch (e) {
			onError(errText(e));
		} finally {
			setBusy(false);
		}
	}
	const fee = durationByCode(duration);
	const supplements = services.reduce((sum, slug) => sum + (serviceBySlug(slug)?.supplementCents ?? 0), 0);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Block, {
				title: "New block",
				kicker: "Reservation",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Guest alias" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: guestName,
						placeholder: "Alias only",
						onChange: (e) => setGuestName(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Suite" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
						value: suite,
						onChange: (e) => setSuite(e.target.value),
						children: SUITES.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", { children: item }, item))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Window" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: WINDOWS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
							on: windowLabel === item,
							onClick: () => setWindowLabel(item),
							children: item
						}, item))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Hostess" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: active.map((host) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
							on: hostessId === host.id,
							onClick: () => setHostessId(host.id),
							children: host.name
						}, host.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: "Length" }),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-col gap-2",
						children: DURATIONS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Chip, {
							on: duration === item.code,
							onClick: () => setDuration(item.code),
							children: [
								item.label,
								" · ",
								item.detail,
								" · ",
								zar(item.cents)
							]
						}, item.code))
					})
				]
			}),
			DEPARTMENTS.map((dept) => {
				const items = ELECTIVES.filter((s) => s.department === dept.id);
				if (!items.length) return null;
				return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Block, {
					title: dept.title,
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: items.map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
							on: services.includes(s.slug),
							onClick: () => toggle(s.slug),
							children: s.name
						}, s.slug))
					})
				}, dept.id);
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Block, {
				title: "Frame",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: PERSONAS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
							on: persona === item.id,
							onClick: () => setPersona(item.id),
							children: item.label
						}, item.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "flex flex-wrap gap-2",
						children: MOODS.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
							on: mood === item.id,
							onClick: () => setMood(item.id),
							children: item.label
						}, item.id))
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						rows: 3,
						value: boundary,
						placeholder: "Limits, allergies, topics to avoid",
						onChange: (e) => setBoundary(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "flex min-h-11 items-center gap-3 text-sm",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							type: "checkbox",
							className: "size-4",
							checked: nda,
							onChange: (e) => setNda(e.target.checked)
						}), "Non-disclosure accepted. Settlement stays on the folio."]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "text-sm text-muted",
						children: [
							"Paystack charges ",
							fee ? zar(fee.cents + supplements) : "",
							supplements ? ", including supplements" : "",
							". The hostess line opens when the payment finishes. Standing rules still apply."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoldButton, {
						disabled: busy || !guestName.trim() || !hostessId || !services.length || !nda,
						onClick: submit,
						children: busy ? "Waiting on Paystack…" : "Pay with Paystack"
					})
				]
			})
		]
	});
}
function Roster({ data, onReload, onError }) {
	const [name, setName] = (0, import_react.useState)("");
	const [languages, setLanguages] = (0, import_react.useState)("");
	const [hours, setHours] = (0, import_react.useState)("");
	const [message, setMessage] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function send() {
		setBusy(true);
		try {
			await submitApplication({ data: {
				name,
				languages,
				hours,
				message
			} });
			setName("");
			setLanguages("");
			setHours("");
			setMessage("");
			onReload();
		} catch (e) {
			onError(errText(e));
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex flex-col gap-4",
		children: [
			data.hostesses.map((host, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: `${rise} rounded-2xl border border-line bg-surface p-4`,
				style: { animationDelay: `${Math.min(i, 5) * 40}ms` },
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-baseline justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
							className: "font-display text-2xl italic",
							children: host.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs tracking-wide text-gold uppercase",
							children: host.status
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm text-muted",
						children: host.vibe
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm leading-relaxed",
						children: host.bio
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-2 text-xs text-muted",
						children: [
							host.languages,
							" · ",
							host.hours
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-1 text-xs text-muted",
						children: splitSlugs(host.specialties).map((slug) => serviceBySlug(slug)?.name).filter(Boolean).join(" · ")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "mt-3",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
							on: host.status === "active",
							onClick: () => setHostessStatus({ data: {
								id: host.id,
								status: host.status === "active" ? "paused" : "active"
							} }).then(onReload).catch((e) => onError(errText(e))),
							children: host.status === "active" ? "On the floor" : "Paused"
						})
					})
				]
			}, host.id)),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Block, {
				title: "Intake",
				kicker: "Applications",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: name,
						placeholder: "Name",
						onChange: (e) => setName(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: languages,
						placeholder: "Languages",
						onChange: (e) => setLanguages(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: hours,
						placeholder: "Hours she can hold",
						onChange: (e) => setHours(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
						rows: 4,
						value: message,
						placeholder: "Note from the interview",
						onChange: (e) => setMessage(e.target.value)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoldButton, {
						disabled: busy || !name.trim() || !languages.trim() || !hours.trim() || !message.trim(),
						onClick: send,
						children: "Log application"
					})
				]
			}),
			data.applications.map((app) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
				className: "rounded-2xl border border-line bg-surface p-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex items-baseline justify-between gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
							className: "font-display text-xl italic",
							children: app.name
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "text-xs text-gold uppercase",
							children: app.status
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-1 text-xs text-muted",
						children: [
							app.languages,
							" · ",
							app.hours
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-2 text-sm leading-relaxed",
						children: app.message
					}),
					app.status === "review" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-3 flex flex-wrap gap-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoldButton, {
							onClick: () => reviewApplication({ data: {
								id: app.id,
								decision: "accepted"
							} }).then(onReload).catch((e) => onError(errText(e))),
							children: "Accept"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Chip, {
							onClick: () => reviewApplication({ data: {
								id: app.id,
								decision: "declined"
							} }).then(onReload).catch((e) => onError(errText(e))),
							children: "Decline"
						})]
					}) : null
				]
			}, app.id))
		]
	});
}
var SplitComponent = HouseApp;
//#endregion
export { SplitComponent as component };
