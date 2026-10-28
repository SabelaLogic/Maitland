import { o as __toESM } from "../_runtime.mjs";
import { J as require_react, x as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { O as zar, _ as SERVICES, a as DURATIONS, g as ROSTER, i as DEPARTMENTS } from "./catalog-CTbdx2-U.mjs";
import { c as guestThread, d as openAccountLine, h as sendGuestMessage, l as issueActivation, m as sendAccountMessage, n as accountStatus, r as beginAnonymous, s as finalizePayment, t as ACCESS_CENTS } from "./comms-BsPr7Mga.mjs";
import { t as GROK_PROVIDERS } from "./server-BCX7neK4.mjs";
import { i as GoldButton, s as errText } from "./ui-Debh48St.mjs";
import { r as signIn, t as authClient } from "./client-IWHfIGH2.mjs";
import { i as useCurrentUserState, n as startPaystack, t as payEmail } from "./paystack-DZFZkEtd.mjs";
import { i as rise, n as descend, t as arrive } from "./motion-DD2WP4PK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-Cr5XQEfO.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var SLOT_QUICK = [
	"90 minutes",
	"The evening",
	"Overnight"
];
var LOCK_QUICK = [
	"Yes, lock it",
	"Tell me more",
	"Not yet"
];
var OPEN_QUICK = [
	"Dinner in the suite",
	"A quiet room",
	"The bar",
	"Just company"
];
function toneOf(vibe) {
	if ([
		"Playful",
		"Bright",
		"Fresh",
		"Bold",
		"Magnetic"
	].includes(vibe)) return "light";
	if ([
		"Direct",
		"Confident",
		"Warm",
		"Smooth"
	].includes(vibe)) return "plain";
	return "measured";
}
function take(pool, spent) {
	const fresh = pool.filter((line) => !spent.includes(line));
	const bag = fresh.length ? fresh : pool;
	const line = bag[Math.floor(Math.random() * bag.length)] ?? pool[0];
	return {
		line,
		spent: fresh.length ? [...spent, line] : [line]
	};
}
function stamp(memory, line, patch) {
	return {
		...memory,
		...patch,
		spent: memory.spent.includes(line) ? memory.spent : [...memory.spent, line]
	};
}
function blankMemory() {
	return {
		stage: "intro",
		asked: 0,
		spent: []
	};
}
function humanPause() {
	return 3e3 + Math.floor(Math.random() * 1001);
}
function openingLine(name, vibe, spent) {
	const tone = toneOf(vibe);
	return take({
		measured: [
			`${name} here. You found the line. Tell me what the evening should feel like — I won’t guess.`,
			`Evening. It’s ${name}. What are you actually in the mood for?`,
			`Hi. ${name}. Dinner, a quiet room, or the longer stay. Your call.`,
			`You opened my chat. I’m ${name}. Say it in your own words and I’ll shape the block around it.`
		],
		light: [
			`Hey. ${name}. You tapped through — what’s the plan, loosely?`,
			`Hi. ${name} on this side. Dinner, the bar, or should I leave the room quiet?`,
			`Ok I’m here. Don’t write an essay. Just the shape of tonight.`,
			`${name}. Talk to me like a person. What do you want when you walk in?`
		],
		plain: [
			`It’s ${name}. Line’s open. What do you want from the block?`,
			`${name}. I read fast, so say it straight — hosting, dining, or an early night.`,
			`Hey. ${name}. I’m not going to pitch you a list. Tell me the evening.`,
			`Right. ${name}. What should I have ready before you arrive?`
		]
	}[tone], spent);
}
function slotOf(text) {
	const t = text.toLowerCase();
	const overnight = DURATIONS.find((d) => d.code === "residency");
	const evening = DURATIONS.find((d) => d.code === "evening");
	const arrival = DURATIONS.find((d) => d.code === "arrival");
	if (!overnight || !evening || !arrival) return null;
	if (/\b(overnight|residency|all night|whole night|sleep)\b/.test(t)) return {
		slot: overnight.label,
		price: zar(overnight.cents)
	};
	if (/\b(evening|four hours|4 hours|4hr|the night)\b/.test(t) && !/overnight/.test(t)) return {
		slot: evening.label,
		price: zar(evening.cents)
	};
	if (/\b(90|ninety|hour and a half|arrival|short block)\b/.test(t) || /\b1 hour\b|\bone hour\b/.test(t)) return {
		slot: arrival.label,
		price: zar(arrival.cents)
	};
	return null;
}
function focusOf(text) {
	const t = text.toLowerCase();
	if (/\b(dinner|dining|kitchen|course|eat|supper|hungry|food|michelin)\b/.test(t)) return "dining";
	if (/\b(bar|drink|drinks|wine|cocktail|negroni|champagne|glass|whisky|whiskey)\b/.test(t)) return "bar";
	if (/\b(spa|bath|wellness|hydro|quiet|rest|asleep|calm|dark)\b/.test(t)) return "wellness";
	if (/\b(lounge|gaming|box|members|gala)\b/.test(t)) return "lounge";
	if (/\b(car|town|outing|excursion|outside|drive|shopping)\b/.test(t)) return "outing";
	if (/\b(talk|conversation|company|chat|sit|listen)\b/.test(t)) return "company";
	if (/\b(light|lights|music|mood|playlist|climate|ambience|ambiance)\b/.test(t)) return "ambience";
	if (/\b(privacy|private|disturb|phone|staff|gate|discreet|anonymous)\b/.test(t)) return "privacy";
	return null;
}
function acknowledge(name, vibe, focus, spent) {
	const tone = toneOf(vibe);
	const pools = {
		dining: {
			measured: [
				`Dining in the suite, then. I’ll have the kitchen pace it course by course, not all at once.`,
				`Alright. Private dining. I call the courses. You don’t see the corridor.`,
				`The kitchen can run. I’ll keep the plates moving at your pace, not theirs.`
			],
			light: [
				`Kitchen it is. I’ll run the courses so you’re not waiting on a cart.`,
				`Ok, dinner in the room. No lobby, no trolley parked in the hall.`,
				`Love that. I’ll set the table before you’re even sat.`
			],
			plain: [
				`Got you — in-suite dining. I’ll hold the kitchen to one course at a time.`,
				`Dinner, inside. I’ll deal with the pass. You don’t have to.`,
				`Noted. Food stays in the suite. I won’t let them stack the courses.`
			]
		},
		bar: {
			measured: [
				`I’ll work the bar in the suite. You won’t be handed a bill in the room.`,
				`A drink, then. I’ll pour. The desk posts it later, not me.`,
				`The private bar is already stocked. Tell me the glass when you’re in, or I can decide.`
			],
			light: [
				`Bar’s on me to pour. You just say the mood.`,
				`Ok, drinks in the room. I’ll have a glass waiting, not a menu speech.`,
				`Yeah. I’ll open something decent and we can change it if it’s wrong.`
			],
			plain: [
				`I’ll pour. Don’t worry about paying me for it.`,
				`The bar stays in the suite. I don’t do a tab conversation.`,
				`Right. First glass on the side, then we see.`
			]
		},
		wellness: {
			measured: [
				`Quiet it is. I’ll drop the lights and keep the corridor empty.`,
				`Wellness, not a performance. Bath or just the dark room — I’ll set it before you sit.`,
				`I’ll make the suite slower. Low light, no staff at the door.`
			],
			light: [
				`Quiet room. I’ll kill the bright lights and leave you the calm one.`,
				`Ok. Soft evening. I can draw a bath or just keep it still. Your pick later.`,
				`Yeah, we can do almost nothing. That’s a real option here.`
			],
			plain: [
				`Low light, door closed. I’ll handle anyone who knocks.`,
				`Rest, then. I won’t fill the silence unless you do.`,
				`I’ll set the room for quiet and stay inside the brief.`
			]
		},
		lounge: {
			measured: [`The members’ side, then. I walk with you. We don’t drift into the public rooms.`, `Gaming room or the viewing box — I’ll stay beside you and bring you back when the block says so.`],
			light: [`Lounge, got it. I’ll come with. We don’t do the main floor.`, `Ok, private rooms only. I’ll know which door.`],
			plain: [`On-property. I accompany. I don’t leave you to find the room.`, `Restricted rooms, yes. Public lobby, no.`]
		},
		outing: {
			measured: [`Off the property, then. The hotel car is already the way we move. I host. The driver stays a driver.`, `An outing. I’ll keep it to one place, not a tour.`],
			light: [`Out for a bit? Ok. Car’s the house’s, not a random ride.`, `Yeah we can leave the building. I’ll keep it simple.`],
			plain: [`Excursion noted. One stop, hotel car, then back.`, `Outside is fine. I don’t turn it into a sightseeing script.`]
		},
		company: {
			measured: [`Company, then. I’ll listen first. I’m not going to perform a personality at you.`, `Unhurried talk. Tell me what you actually do, or don’t. Both are fine.`],
			light: [`Just company. Easy. I’ll match your pace, not fill every gap.`, `Ok. Sit, talk, or don’t. I’m not a script.`],
			plain: [`Conversation. I’ll follow your subject, not mine.`, `Company it is. No pitch after this.`]
		},
		ambience: {
			measured: [`I’ll set the room before you arrive — light, climate, something low on the speakers.`, `The suite can already match a mood. Tell me warm, cool, or nearly dark.`],
			light: [`Mood of the room, yeah. I’ll fix the lights so you’re not walking into glare.`, `Ok I’ll tune it. You shouldn’t have to touch a panel.`],
			plain: [`Lights and sound, before you’re in. Say if you want it dim.`, `I’ll preset the suite. You can change one thing, not ten.`]
		},
		privacy: {
			measured: [`Privacy is the default. Phones down, staff off the corridor, nothing recorded.`, `I’ll be the only person at the door. Housekeeping waits.`],
			light: [`Discretion’s already on. I’m not taking pictures, and neither is the house.`, `Ok. Quiet door. If someone calls the room, they don’t get through.`],
			plain: [`No devices, no story that leaves the suite. That’s not a favour, it’s the rule.`, `I’ll filter the door. You won’t meet the rest of the hotel.`]
		}
	};
	return take(pools[focus]?.[tone] ?? pools.company[tone], spent);
}
function askLength(vibe, spent, asked) {
	const tone = toneOf(vibe);
	const pools = {
		measured: [
			`How long should I hold the suite — ninety minutes, the evening, or overnight?`,
			`The shortest block I keep is an hour and a half. Evening is four hours. Overnight runs to morning.`,
			`Give me a length and I’ll stop asking. Arrival, evening, or the night.`
		],
		light: [
			`So — 90 minutes, the whole evening, or overnight?`,
			`We don’t do a rushed half hour. Shortest is ninety. Or we take the night.`,
			`Pick a length and I’ll shut up about the clock.`
		],
		plain: [
			`Time first. 90 minutes, four hours, or until morning.`,
			`Which block? I can’t hold the suite on a maybe.`,
			`Arrival, evening, or overnight. One of those.`
		]
	};
	return take(asked > 0 ? pools[tone].slice().reverse() : pools[tone], spent);
}
function lockLine(vibe, slot, price, spent) {
	const tone = toneOf(vibe);
	return take({
		measured: [
			`${slot}. ${price} sits on the folio — I won’t talk money once you’re in the room. Shall I hold it from 20:00?`,
			`I can keep ${slot}. The desk posts ${price}. I arrive at the private door, not the lobby. Lock it?`,
			`${slot}, ready from eight. The figure is ${price}, and it never changes hands between us. Want it held?`
		],
		light: [
			`${slot}. I’ll be there from 20:00. ${price} goes on the room, not to me. Lock it?`,
			`Ok. ${slot}. Figure’s ${price}, folio only. Want me to hold it?`,
			`Yeah I can do ${slot}. Eight o’clock, private entrance. ${price} on the folio. Yes?`
		],
		plain: [
			`${slot}. ${price}. Folio, not cash. I can be at the suite around eight. Lock it?`,
			`Holding ${slot} from 20:00. ${price} is the desk’s line, not a conversation. Confirm?`,
			`${slot}. I’ll take the private door at 20:10. Total ${price}, charged upstairs. Lock?`
		]
	}[tone], spent);
}
function moreLine(vibe, slot, spent) {
	const tone = toneOf(vibe);
	return take({
		measured: [
			`It’s unhurried. I meet you off the lobby, set the room, and stay inside what we agreed. Still hold the ${slot}?`,
			`No photos, no staff in the room, and I close the evening cleanly when the block ends. Shall I keep the ${slot}?`,
			`I host. I don’t improvise past the brief, and I don’t linger after. The ${slot} is still there if you want it.`
		],
		light: [
			`Warm, private, no rush. I won’t turn it into a show. Still want the ${slot}?`,
			`I’ll keep the door. You set the pace. ${slot} still ok?`,
			`Nothing weird, nothing public. Just the ${slot}. Lock it or leave it.`
		],
		plain: [
			`Private entrance, suite, then a clean end. That’s the ${slot}. Yes or not yet.`,
			`I stay in the hotel’s rules and my own. If that’s fine, I’ll hold the ${slot}.`,
			`More detail won’t change the shape. ${slot}, private door, folio upstairs. Lock it?`
		]
	}[tone], spent);
}
function laterLine(vibe, spent) {
	return take({
		measured: [`No pressure. Say the word and I’ll hold the time. I’ll stay on the line.`],
		light: [`All good. I’m here if you change your mind. No chase.`],
		plain: [`Fine. I won’t hold it in the air. Tell me when it’s a yes.`]
	}[toneOf(vibe)], spent);
}
function bookedLines(vibe, slot, price, spent) {
	const tone = toneOf(vibe);
	const spoken = slot.startsWith("Overnight") ? "the night" : slot.startsWith("Arrival") ? "the arrival block" : "the evening";
	const first = take({
		measured: [`Done. ${spoken[0].toUpperCase()}${spoken.slice(1)} is held. I’ll be at the private door around 20:10, not in the lobby.`, `Held. I’ll come to the suite for ${spoken} — not the other way around.`],
		light: [`Locked. I’ll slip in around 20:10, private side.`, `Ok, ${spoken} is yours. Don’t wait in the lobby. I’ll come to you.`],
		plain: [`Confirmed. ${spoken[0].toUpperCase()}${spoken.slice(1)}, private entrance, 20:10.`, `It’s held. I’ll meet you at the suite.`]
	}[tone], spent);
	return {
		spent: first.spent,
		lines: [{ text: first.line }, {
			text: "Settle it on the folio when you’re ready. I don’t take payment in the chat.",
			booking: {
				slot,
				price
			}
		}]
	};
}
function settledLine(vibe, slot, ref, room, spent) {
	const tone = toneOf(vibe);
	const where = room ? ` Room ${room}.` : "";
	return take({
		measured: [`The desk has it. Ref ${ref}.${where} Your ${slot} stands. I’ll see you at 20:00.`, `Posted. ${ref}.${where} Nothing else to arrange in here. I’ll be at the door at eight.`],
		light: [`All set. ${ref}.${where} ${slot} is real now. See you at eight.`, `Got it on the folio. Ref ${ref}.${where} I’ll be there.`],
		plain: [`Folio updated. ${ref}.${where} ${slot}, 20:00. That’s the end of the admin.`, `Recorded. ${ref}.${where} Don’t bring cash. I’ll see you at the suite.`]
	}[tone], spent);
}
function afterLine(vibe, text, spent) {
	const t = text.toLowerCase();
	const tone = toneOf(vibe);
	let pools;
	if (/\b(wear|dress|outfit|bring)\b/.test(t)) pools = [
		`Dress like you’re already in the building. I won’t turn it into a theme.`,
		`Nothing to bring. If you want the room a certain way, say it in one line.`,
		`I’ll dress for the house, not a costume. You do the same.`
	];
	else if (/\b(quiet|alone|silence|lights)\b/.test(t)) pools = [
		`I’ll keep it quiet unless you start.`,
		`Dim, then. I won’t add music if you don’t ask.`,
		`Understood. Low light, fewer words.`
	];
	else if (/\b(drink|wine|glass|bar)\b/.test(t)) pools = [
		`I’ll have a glass poured. Tell me if you want it changed.`,
		`Wine or something shorter — I’ll decide if you don’t.`,
		`First drink is waiting. The rest can wait too.`
	];
	else if (/\b(see you|soon|tonight|eight|20)\b/.test(t)) pools = [
		`See you at the private door.`,
		`I’ll be on time. You don’t have to be early.`,
		`Tonight, then. I’ll text nothing — this line is enough.`
	];
	else pools = {
		measured: [
			`I’ll keep the rest for the room. Anything you want set before I arrive, say it once.`,
			`Noted. I won’t add a plan you didn’t ask for.`,
			`Alright. I’ll hold the shape we agreed and leave the extras alone.`,
			`If the room should be darker, or the first course later, tell me now.`
		],
		light: [
			`Ok. I’ll leave it there unless you add something.`,
			`Cool. One more thing if you have it, or we’re done talking logistics.`,
			`Yeah. I won’t over-prepare it.`,
			`Got you. See you when the block starts — or say if the mood should change.`
		],
		plain: [
			`Heard. I won’t embroider it.`,
			`Fine. I’ll stick to that.`,
			`Anything else, or do we leave it.`,
			`Noted. The suite will match that, not a bigger idea.`
		]
	}[tone];
	return take(pools, spent);
}
function curious(vibe, text, spent) {
	const t = text.toLowerCase();
	const tone = toneOf(vibe);
	if (/\b(who are you|your name|which one)\b/.test(t)) return take(tone === "light" ? [`Still me. You don’t have to pick again.`] : [`You’re already on my line. No need to start over.`], spent);
	if (/\b(how much|price|cost|rate|pay)\b/.test(t)) return take([
		`The desk posts the block. I can tell you the figure when you pick a length — I don’t haggle in the chat.`,
		`Money stays on the folio. Choose 90 minutes, the evening, or overnight and I’ll say the number once.`,
		`I don’t take payment personally. The length decides the folio line.`
	], spent);
	if (/\b(menu|services|what do you do|options)\b/.test(t)) return take([
		`Every hostess holds the same list. Dining, the bar, a quiet suite, the members’ rooms, or a short trip out. What do you actually want?`,
		`I won’t read you sixteen items. Dining, drinks, quiet, company, or out. Start there.`,
		`Same floor for all of us. Tell me the mood and I’ll match a service, not a brochure.`
	], spent);
	return null;
}
function replyTo(name, vibe, memory, text) {
	const clean = text.trim();
	const lower = clean.toLowerCase();
	let spent = memory.spent;
	const slot = slotOf(clean);
	const focus = focusOf(clean) ?? memory.focus;
	if (/\b(30|half an hour|half hour|twenty minutes)\b/.test(lower) && !slot) {
		const short = take([
			`I can’t hold a half hour. The short block is ninety minutes — arrival, then the evening if you want longer.`,
			`Too short for the suite. Ninety minutes is the floor. Evening if you want it unhurried.`,
			`We don’t do a rushed slot. Say ninety minutes, the evening, or overnight.`
		], spent);
		return {
			memory: {
				...memory,
				stage: "shape",
				asked: memory.asked + 1,
				spent: short.spent
			},
			lines: [{ text: short.line }],
			quick: SLOT_QUICK
		};
	}
	if (memory.stage === "settled") {
		const next = afterLine(vibe, clean, spent);
		return {
			memory: {
				...memory,
				spent: next.spent
			},
			lines: [{ text: next.line }],
			quick: []
		};
	}
	if (memory.stage === "booked" && memory.slot && memory.price) {
		const next = afterLine(vibe, clean, spent);
		return {
			memory: {
				...memory,
				spent: next.spent
			},
			lines: [{ text: next.line }],
			quick: []
		};
	}
	if (memory.stage === "confirm" && memory.slot && memory.price) {
		if (/\b(yes|lock|book|confirm|do it|please|ok|okay|yeah|yep|sure)\b/.test(lower)) {
			const booked = bookedLines(vibe, memory.slot, memory.price, spent);
			return {
				memory: {
					...memory,
					stage: "booked",
					spent: booked.spent
				},
				lines: booked.lines,
				quick: []
			};
		}
		if (/\b(more|detail|how|what happens|explain)\b/.test(lower)) {
			const more = moreLine(vibe, memory.slot, spent);
			return {
				memory: stamp(memory, more.line, { spent: more.spent }),
				lines: [{ text: more.line }],
				quick: ["Yes, lock it", "Not yet"]
			};
		}
		const later = laterLine(vibe, spent);
		return {
			memory: stamp(memory, later.line, {
				stage: "shape",
				spent: later.spent,
				asked: memory.asked + 1
			}),
			lines: [{ text: later.line }],
			quick: SLOT_QUICK
		};
	}
	const side = curious(vibe, clean, spent);
	if (side && !slot && memory.stage === "intro") return {
		memory: {
			...memory,
			spent: side.spent,
			asked: memory.asked + 1
		},
		lines: [{ text: side.line }],
		quick: OPEN_QUICK
	};
	if (slot) {
		const known = memory.focus && memory.focus === focus && (memory.stage === "shape" || memory.stage === "confirm");
		const locked = lockLine(vibe, slot.slot, slot.price, spent);
		if (known) return {
			memory: {
				...memory,
				stage: "confirm",
				slot: slot.slot,
				price: slot.price,
				spent: locked.spent
			},
			lines: [{ text: locked.line }],
			quick: LOCK_QUICK
		};
		const lead = focus ? acknowledge(name, vibe, focus, spent) : take(toneOf(vibe) === "light" ? [`Ok. I’ll take ${slot.slot.toLowerCase()}.`] : [`${slot.slot}. I’ll work to that.`], spent);
		const afterLead = lockLine(vibe, slot.slot, slot.price, lead.spent);
		return {
			memory: {
				...memory,
				stage: "confirm",
				slot: slot.slot,
				price: slot.price,
				focus: focus ?? memory.focus,
				spent: afterLead.spent
			},
			lines: [{ text: lead.line }, { text: afterLead.line }],
			quick: LOCK_QUICK
		};
	}
	if (focus) {
		const ack = acknowledge(name, vibe, focus, spent);
		const ask = askLength(vibe, ack.spent, memory.asked);
		return {
			memory: {
				...memory,
				stage: "shape",
				focus,
				asked: memory.asked + 1,
				spent: ask.spent
			},
			lines: [{ text: ack.line }, { text: ask.line }],
			quick: SLOT_QUICK
		};
	}
	if (memory.stage === "shape" || memory.stage === "confirm") {
		const ask = askLength(vibe, spent, memory.asked + 1);
		const bridge = take([
			`I can host that. I still need a length or the suite won’t hold.`,
			`Say it plainer if you want — or just pick how long.`,
			`The room can flex. The clock can’t.`,
			`Alright. One decision, then I’ll stop circling.`
		], ask.spent);
		return {
			memory: {
				...memory,
				asked: memory.asked + 1,
				spent: [...ask.spent, bridge.line]
			},
			lines: [{ text: bridge.line }, { text: ask.line }],
			quick: SLOT_QUICK
		};
	}
	const nudge = take(toneOf(vibe) === "measured" ? [
		`Tell me straight. Dinner, a quiet room, a drink, or just someone in the suite?`,
		`You can be brief. What should the first hour feel like?`,
		`I’m here. What are you looking for once the door closes?`
	] : toneOf(vibe) === "light" ? [
		`Company, dinner, or a quiet night? Pick one, even loosely.`,
		`You looking for an evening, or just saying hi?`,
		`Give me a hint. Bar, food, or leave the room dim.`
	] : [
		`Dinner, drinks, quiet, or company. Which one?`,
		`Don’t circle it. What do you want tonight?`,
		`One line is enough. What kind of block?`
	], spent);
	return {
		memory: {
			...memory,
			stage: "intro",
			asked: memory.asked + 1,
			spent: nudge.spent
		},
		lines: [{ text: nudge.line }],
		quick: OPEN_QUICK
	};
}
function paymentLine(name, vibe, memory, ref, room) {
	const next = settledLine(vibe, memory.slot ?? "the block", ref, room, memory.spent);
	return {
		memory: {
			...memory,
			stage: "settled",
			spent: next.spent
		},
		lines: [{ text: next.line }],
		quick: [
			"See you at eight",
			"Keep the room quiet",
			"A glass first"
		]
	};
}
function hostessFirstName(name) {
	return name.split(" ")[0] || name;
}
function clock() {
	return (/* @__PURE__ */ new Date()).toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit"
	});
}
function uid() {
	return crypto.randomUUID();
}
function LiveChat({ host, onClose, onGuestLine }) {
	const [bubbles, setBubbles] = (0, import_react.useState)([]);
	const [memory, setMemory] = (0, import_react.useState)(blankMemory);
	const [typing, setTyping] = (0, import_react.useState)(true);
	const [draft, setDraft] = (0, import_react.useState)("");
	const [quick, setQuick] = (0, import_react.useState)([]);
	const [confirm, setConfirm] = (0, import_react.useState)(false);
	const [receipt, setReceipt] = (0, import_react.useState)(null);
	const [room, setRoom] = (0, import_react.useState)("");
	const memoryRef = (0, import_react.useRef)(memory);
	const boxRef = (0, import_react.useRef)(null);
	const rootRef = (0, import_react.useRef)(null);
	const timers = (0, import_react.useRef)([]);
	(0, import_react.useEffect)(() => {
		memoryRef.current = memory;
	}, [memory]);
	(0, import_react.useEffect)(() => {
		const vv = window.visualViewport;
		if (!vv) return;
		const sync = () => {
			const el = rootRef.current;
			if (!el) return;
			el.style.height = `${vv.height}px`;
			el.style.top = `${vv.offsetTop}px`;
		};
		sync();
		vv.addEventListener("resize", sync);
		vv.addEventListener("scroll", sync);
		return () => {
			vv.removeEventListener("resize", sync);
			vv.removeEventListener("scroll", sync);
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const box = boxRef.current;
		if (box) box.scrollTop = box.scrollHeight;
	}, [
		bubbles,
		typing,
		quick,
		confirm
	]);
	(0, import_react.useEffect)(() => {
		return () => {
			for (const id of timers.current) window.clearTimeout(id);
		};
	}, []);
	function later(fn, ms) {
		const id = window.setTimeout(fn, ms);
		timers.current.push(id);
	}
	function pushThem(lines) {
		setBubbles((prev) => [...prev, ...lines.map((line) => ({
			...line,
			id: uid(),
			who: "them",
			time: clock()
		}))]);
	}
	(0, import_react.useEffect)(() => {
		let cancel = false;
		setBubbles([]);
		setMemory(blankMemory());
		setTyping(true);
		setQuick([]);
		setConfirm(false);
		setReceipt(null);
		const wait = humanPause();
		const id = window.setTimeout(() => {
			if (cancel) return;
			const openedLine = openingLine(hostessFirstName(host.name), host.vibe, []);
			setMemory((m) => ({
				...m,
				spent: openedLine.spent
			}));
			setTyping(false);
			setBubbles([{
				id: crypto.randomUUID(),
				who: "them",
				text: openedLine.line,
				time: (/* @__PURE__ */ new Date()).toLocaleTimeString([], {
					hour: "2-digit",
					minute: "2-digit"
				})
			}]);
			setQuick([
				"Dinner in the suite",
				"A quiet room",
				"The bar",
				"Just company"
			]);
		}, wait);
		return () => {
			cancel = true;
			window.clearTimeout(id);
		};
	}, [
		host.key,
		host.name,
		host.vibe
	]);
	function speak(lines, nextQuick, nextMemory) {
		setTyping(true);
		setQuick([]);
		later(() => {
			setTyping(false);
			setMemory(nextMemory);
			pushThem(lines);
			setQuick(nextQuick);
		}, humanPause());
	}
	function send(text) {
		const body = text.trim();
		if (!body || typing) return;
		setDraft("");
		setQuick([]);
		setBubbles((prev) => [...prev, {
			id: uid(),
			who: "me",
			text: body,
			time: clock()
		}]);
		onGuestLine?.(body);
		const next = replyTo(hostessFirstName(host.name), host.vibe, memoryRef.current, body);
		speak(next.lines, next.quick, next.memory);
	}
	function settle(method) {
		const ref = `MT-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
		const roomNote = room.trim();
		setReceipt({
			ref,
			method,
			room: roomNote
		});
		const next = paymentLine(hostessFirstName(host.name), host.vibe, memoryRef.current, ref, roomNote);
		later(() => {
			setConfirm(false);
			setTyping(true);
			later(() => {
				setTyping(false);
				setMemory(next.memory);
				pushThem(next.lines);
				setQuick(next.quick);
			}, humanPause());
		}, 700);
	}
	function downloadReceipt() {
		if (!receipt || !memory.slot) return;
		const text = [
			"MAITLAND HOUSE FOLIO NOTE",
			"",
			`Ref: ${receipt.ref}`,
			`Hostess: ${host.name}`,
			`Session: ${memory.slot}`,
			memory.price ? `Amount: ${memory.price}` : "",
			receipt.room ? `Room: ${receipt.room}` : "",
			`Route: ${receipt.method}`,
			"Status: Posted to the folio",
			"",
			"No payment passes between guest and hostess."
		].filter(Boolean).join("\n");
		const blob = new Blob([text], { type: "text/plain" });
		const a = document.createElement("a");
		a.href = URL.createObjectURL(blob);
		a.download = `Maitland-Folio-${receipt.ref}.txt`;
		a.click();
		URL.revokeObjectURL(a.href);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		ref: rootRef,
		className: "live-chat",
		children: confirm ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
			className: "live-confirm",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "live-head",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					className: "live-back",
					onClick: () => setConfirm(false),
					children: "← Back"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: "Confirm the block" })]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "live-confirm-body",
				children: receipt ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "live-success",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "live-tick",
							children: "✓"
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Posted to the folio" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "live-receipt",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", { children: "Folio note" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "live-line",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Hostess" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: host.name })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "live-line",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Session" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: memory.slot })]
								}),
								receipt.room ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "live-line",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Room" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: receipt.room })]
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "live-line",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Route" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: receipt.method })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "live-line",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Amount" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: memory.price })]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "live-line",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Status" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "live-ok",
										children: "On the folio"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
									className: "live-ref",
									children: ["Ref ", receipt.ref]
								})
							]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "live-receipt-actions",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "live-ghost",
								onClick: downloadReceipt,
								children: "Download note"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "live-send",
								onClick: () => setConfirm(false),
								children: "Back to chat"
							})]
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "live-summary",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "live-line",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Hostess" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: host.name })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "live-line",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Session" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: memory.slot })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "live-line",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "From" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "20:00" })]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "live-line live-total",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Folio" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: memory.price })]
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "live-fine",
						children: [
							"The house posts this. Nothing is paid to ",
							host.name,
							" directly."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
						className: "live-room",
						children: ["Room, if you have one", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
							value: room,
							placeholder: "e.g. 412",
							onChange: (e) => setRoom(e.target.value)
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "live-pays",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "live-pay primary",
								onClick: () => settle("Room folio"),
								children: "Charge to the room folio"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "live-pay",
								onClick: () => settle("Ozow"),
								children: "Ozow / Instant EFT"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "live-pay",
								onClick: () => settle("PayFast"),
								children: "PayFast"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "live-pay",
								onClick: () => settle("SnapScan"),
								children: "SnapScan"
							})
						]
					})
				] })
			})]
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "live-head",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						className: "live-back",
						onClick: onClose,
						children: "← Back"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: host.portrait,
						alt: ""
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "live-who",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "live-name",
							children: host.name
						}), typing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "live-typing",
							children: "typing....."
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "live-status",
							children: "online"
						})]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				ref: boxRef,
				className: "live-msgs",
				"aria-live": "polite",
				children: [bubbles.map((msg) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: msg.who === "me" ? "msg me" : "msg them",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: msg.text }),
						msg.booking ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "booking-card",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("strong", { children: "Block held" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [
									msg.booking.slot,
									" · ",
									msg.booking.price
								] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["Hostess ", host.name] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: "Private door from 20:00" }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setConfirm(true),
									children: "Settle on the folio"
								})
							]
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "time",
							children: msg.time
						})
					]
				}, msg.id)), typing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "msg them typing-bubble",
					children: "typing....."
				}) : null]
			}),
			quick.length ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "live-quick",
				children: quick.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "button",
					disabled: typing,
					onClick: () => send(item),
					children: item
				}, item))
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "live-input",
				onSubmit: (e) => {
					e.preventDefault();
					send(draft);
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
					value: draft,
					placeholder: "Message",
					enterKeyHint: "send",
					onChange: (e) => setDraft(e.target.value)
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
					type: "submit",
					className: "live-send",
					disabled: typing || !draft.trim(),
					children: "Send"
				})]
			})
		] })
	});
}
var STORE = "maitland-guest";
function readGuest() {
	try {
		const raw = localStorage.getItem(STORE);
		if (!raw) return null;
		const parsed = JSON.parse(raw);
		if (!parsed.id || !parsed.secret) return null;
		return parsed;
	} catch {
		return null;
	}
}
function GuestHome() {
	const { user } = useCurrentUserState();
	const [index, setIndex] = (0, import_react.useState)(0);
	const [sheet, setSheet] = (0, import_react.useState)(null);
	const [thread, setThread] = (0, import_react.useState)(null);
	const [ready, setReady] = (0, import_react.useState)(false);
	const [guest, setGuest] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [name, setName] = (0, import_react.useState)("");
	const [email, setEmail] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [activation, setActivation] = (0, import_react.useState)("");
	const [clip, setClip] = (0, import_react.useState)(0);
	const [applyName, setApplyName] = (0, import_react.useState)("");
	const [applyBody, setApplyBody] = (0, import_react.useState)("");
	const [applyHours, setApplyHours] = (0, import_react.useState)("");
	const [applyNote, setApplyNote] = (0, import_react.useState)("");
	const [applySent, setApplySent] = (0, import_react.useState)(false);
	const host = ROSTER[index] ?? ROSTER[0];
	const pendingLines = (0, import_react.useRef)([]);
	(0, import_react.useEffect)(() => {
		setGuest(readGuest());
	}, []);
	(0, import_react.useEffect)(() => {
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
		const id = window.setInterval(() => setClip((n) => (n + 1) % 2), 8e3);
		return () => window.clearInterval(id);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!user) {
			setReady(false);
			return;
		}
		accountStatus().then((row) => setReady(row.ready)).catch(() => setReady(false));
	}, [user]);
	(0, import_react.useEffect)(() => {
		if (!guest || guest.hostessKey !== host.key) return;
		guestThread({ data: {
			guestId: guest.id,
			secret: guest.secret,
			hostessKey: host.key
		} }).then((row) => {
			if (row) setThread(row);
		}).catch(() => void 0);
	}, [guest, host.key]);
	(0, import_react.useEffect)(() => {
		if (sheet !== "chat" || !thread) return;
		const timer = setInterval(() => {
			if (guest && thread) guestThread({ data: {
				guestId: guest.id,
				secret: guest.secret,
				hostessKey: thread.hostessKey
			} }).then((row) => row && setThread(row)).catch(() => void 0);
			else if (user) openAccountLine({ data: { hostessKey: host.key } }).then(setThread).catch(() => void 0);
		}, 4e3);
		return () => clearInterval(timer);
	}, [
		sheet,
		thread?.id,
		guest,
		user,
		host.key
	]);
	async function payAnonymous() {
		setBusy(true);
		setError("");
		try {
			const started = await beginAnonymous({ data: {
				contact: email.trim(),
				hostessKey: host.key
			} });
			const paid = await startPaystack({
				amountCents: ACCESS_CENTS,
				email: payEmail(email),
				description: "Executive access, anonymous"
			});
			const next = await finalizePayment({ data: {
				guestId: started.guestId,
				secret: started.secret,
				reference: paid.reference
			} });
			const saved = {
				id: started.guestId,
				secret: started.secret,
				hostessKey: host.key
			};
			localStorage.setItem(STORE, JSON.stringify(saved));
			setGuest(saved);
			setThread(next);
			setSheet("chat");
		} catch (e) {
			setError(errText(e));
		} finally {
			setBusy(false);
		}
	}
	async function openWithAccount() {
		setBusy(true);
		setError("");
		try {
			const next = await openAccountLine({ data: { hostessKey: host.key } });
			setThread(next);
			setSheet("chat");
		} catch (e) {
			setError(errText(e));
		} finally {
			setBusy(false);
		}
	}
	async function sendEmailAccount() {
		setBusy(true);
		setError("");
		setActivation("");
		try {
			const signed = await authClient.signUp.email({
				email,
				password,
				name: name.trim() || "Guest"
			});
			if (signed.error) {
				const again = await authClient.signIn.email({
					email,
					password
				});
				if (again.error) throw new Error(again.error.message || signed.error.message || "Could not open the account");
			}
			const link = await issueActivation();
			if (link.already) {
				setReady(true);
				return;
			}
			setActivation(link.path);
		} catch (e) {
			setError(errText(e));
		} finally {
			setBusy(false);
		}
	}
	function startChat() {
		if (!ready && !guest) {
			setSheet("access");
			return;
		}
		setSheet("chat");
		if (ready && !thread) openWithAccount();
	}
	async function mirror(body) {
		if (!thread) {
			pendingLines.current.push(body);
			return;
		}
		await deliver([body], thread.id);
	}
	async function deliver(lines, threadId) {
		let current = null;
		try {
			for (const body of lines) current = guest ? await sendGuestMessage({ data: {
				guestId: guest.id,
				secret: guest.secret,
				threadId,
				body
			} }) : await sendAccountMessage({ data: {
				threadId,
				body
			} });
			if (current) setThread(current);
		} catch (e) {
			setError(errText(e));
		}
	}
	(0, import_react.useEffect)(() => {
		if (!thread || pendingLines.current.length === 0) return;
		const lines = pendingLines.current;
		pendingLines.current = [];
		deliver(lines, thread.id);
	}, [thread?.id]);
	const gmail = GROK_PROVIDERS.find((p) => p.idp === "google");
	const nextHost = ROSTER[(index + 1) % ROSTER.length];
	const prevHost = ROSTER[(index + ROSTER.length - 1) % ROSTER.length];
	function shuffle() {
		let step = 0;
		const id = window.setInterval(() => {
			setIndex((i) => (i + 1) % ROSTER.length);
			step += 1;
			if (step >= 8) {
				window.clearInterval(id);
				setIndex(Math.floor(Math.random() * ROSTER.length));
			}
		}, 90);
	}
	const sheetTitle = sheet === "apply" ? "Become a Hostess" : "Unlock the line";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "landing",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "ribbon",
				"aria-hidden": "true"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "hero",
				"aria-label": "Maitland House",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "house-bg",
						"aria-hidden": "true",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
								className: clip === 0 ? "bg-clip on" : "bg-clip",
								autoPlay: true,
								muted: true,
								loop: true,
								playsInline: true,
								src: "/media/house-a.mp4"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
								className: clip === 1 ? "bg-clip on" : "bg-clip",
								autoPlay: true,
								muted: true,
								loop: true,
								playsInline: true,
								src: "/media/house-b.mp4"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
								className: "hero-pair",
								src: "/media/splash-pair.jpg",
								alt: ""
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { className: "hero-veil" })
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "landing-top",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "tab-btn",
							onClick: () => setSheet("apply"),
							children: "Become a Hostess"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "button",
							className: "tab-btn gold-fill",
							onClick: () => ready ? startChat() : setSheet("access"),
							children: "Login"
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
						className: `${descend} hero-brand`,
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "splash-crest",
								"aria-hidden": "true",
								children: "M"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "Maitland House" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", { children: "Bespoke hospitality" }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "splash-sub",
								children: "Private arrival. The suite is already prepared."
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "stage",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "fan-card peek",
								onClick: () => setIndex((i) => (i + 1) % ROSTER.length),
								"aria-label": nextHost.name,
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: nextHost.portrait,
									alt: ""
								})
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("article", {
								className: `${arrive} fan-card front`,
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
									src: host.portrait,
									alt: ""
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "fan-ov",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "fan-name",
										children: host.name
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
										className: "fan-vibe",
										children: host.vibe
									})]
								})]
							}, host.key),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "sr-only",
								children: prevHost.name
							})
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "ctr",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: shuffle,
								children: "Shuffle"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setIndex((i) => (i + 1) % ROSTER.length),
								children: "Next"
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "gold-fill",
								onClick: startChat,
								children: "Start Chat"
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "menu-list",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "menu-note",
						children: [
							"One house menu, shared by every hostess. A line opens when Paystack finishes — ",
							zar(ACCESS_CENTS),
							" to stay anonymous, or an activated email or Gmail account."
						]
					}),
					DEPARTMENTS.map((dept, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: `${rise} menu-card`,
						style: { animationDelay: `${i * 80}ms` },
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", { children: dept.title }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", { children: SERVICES.filter((s) => s.department === dept.id).map((s) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", { children: [s.name, s.standing ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: " · every hostess" }) : null] }, s.slug)) })]
					}, dept.id)),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/desk",
						className: "desk-link",
						children: "House desk"
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "trust",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "trust-track",
					children: [
						"Safe Scrolling",
						"Secure Payment",
						"Confidential Information Processing",
						"POPIA Compliant",
						"Private & Discreet",
						"Safe Scrolling",
						"Secure Payment",
						"Confidential Information Processing",
						"POPIA Compliant",
						"Private & Discreet"
					].map((item, i) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: item }, `${item}-${i}`))
				})
			}),
			sheet === "chat" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveChat, {
				host,
				onClose: () => setSheet(null),
				onGuestLine: (body) => void mirror(body)
			}, host.key) : null,
			sheet && sheet !== "chat" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "fixed inset-0 z-20 flex items-end justify-center bg-bg/80 p-3 sm:items-center",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: `${rise} max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-line bg-surface p-4`,
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
								className: "font-display text-2xl italic",
								children: sheetTitle
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								className: "min-h-11 text-sm text-gold",
								onClick: () => setSheet(null),
								children: "Close"
							})]
						}),
						error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-danger",
							role: "alert",
							children: error
						}) : null,
						sheet === "apply" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
							className: "mt-4 flex flex-col gap-3",
							onSubmit: (e) => {
								e.preventDefault();
								if (!applyName.trim()) return;
								setApplySent(true);
							},
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm leading-relaxed text-muted",
									children: "Independent hostesses set their own hours and hold the same house menu as the floor. Send a short note, your availability, and a picture or clip. The house replies only if there is a fit."
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: applyName,
									placeholder: "First name or alias",
									onChange: (e) => setApplyName(e.target.value),
									required: true
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: applyBody,
									placeholder: "Height and weight, if you want them noted",
									onChange: (e) => setApplyBody(e.target.value)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									value: applyHours,
									placeholder: "Hours — evenings, weekends, flexible",
									onChange: (e) => setApplyHours(e.target.value)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "text-sm text-gold",
									children: ["Pictures", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "file",
										accept: "image/*",
										multiple: true,
										className: "mt-1"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
									className: "text-sm text-gold",
									children: ["Short video", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
										type: "file",
										accept: "video/*",
										className: "mt-1"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
									rows: 4,
									value: applyNote,
									placeholder: "A short note about yourself",
									onChange: (e) => setApplyNote(e.target.value)
								}),
								applySent ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "text-sm text-gold",
									children: "Received. The house will reply only if there is a fit."
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoldButton, {
									type: "submit",
									disabled: !applyName.trim() || applySent,
									children: "Send application"
								})
							]
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 flex flex-col gap-4",
							children: [
								gmail ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoldButton, {
									onClick: () => signIn(gmail.providerId, { callbackURL: "/" }),
									children: "Continue with Gmail"
								}) : null,
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
									className: "flex flex-col gap-2",
									onSubmit: (e) => {
										e.preventDefault();
										sendEmailAccount();
									},
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-xs tracking-widest text-muted uppercase",
											children: "Email account"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											value: name,
											placeholder: "Name",
											onChange: (e) => setName(e.target.value)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											value: email,
											type: "email",
											placeholder: "Email",
											onChange: (e) => setEmail(e.target.value)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
											value: password,
											type: "password",
											placeholder: "Password",
											onChange: (e) => setPassword(e.target.value)
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
											type: "submit",
											disabled: busy || !email.includes("@") || password.length < 8,
											className: "min-h-11 rounded-full border border-gold text-sm text-gold disabled:opacity-50",
											children: "Send activation link"
										}),
										activation ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
											className: "text-sm text-gold underline",
											href: activation,
											children: "Open the activation link"
										}) : null
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "flex flex-col gap-2",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-xs tracking-widest text-muted uppercase",
											children: ["Anonymous · ", zar(ACCESS_CENTS)]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-sm text-muted",
											children: [
												"Paystack checkout. The line with ",
												host.name,
												" opens when the payment finishes. No account."
											]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoldButton, {
											disabled: busy,
											onClick: payAnonymous,
											children: busy ? "Waiting on Paystack…" : `Pay ${zar(ACCESS_CENTS)} with Paystack`
										})
									]
								}),
								ready ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(GoldButton, {
									disabled: busy,
									onClick: openWithAccount,
									children: "Open the line on this account"
								}) : null
							]
						})
					]
				})
			}) : null
		]
	});
}
var SplitComponent = GuestHome;
//#endregion
export { SplitComponent as component };
