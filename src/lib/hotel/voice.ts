import { DURATIONS, zar } from "@/lib/hotel/catalog";

export type Stage = "intro" | "shape" | "confirm" | "booked" | "settled";

export type Memory = {
  stage: Stage;
  slot?: string;
  price?: string;
  focus?: string;
  asked: number;
  spent: string[];
};

export type HostLine = {
  text: string;
  booking?: { slot: string; price: string };
};

export type Reply = {
  memory: Memory;
  lines: HostLine[];
  quick: string[];
};

const SLOT_QUICK = ["90 minutes", "The evening", "Overnight"];
const LOCK_QUICK = ["Yes, lock it", "Tell me more", "Not yet"];
const OPEN_QUICK = ["Dinner in the suite", "A quiet room", "The bar", "Just company"];

type Tone = "measured" | "light" | "plain";

function toneOf(vibe: string): Tone {
  if (["Playful", "Bright", "Fresh", "Bold", "Magnetic"].includes(vibe)) return "light";
  if (["Direct", "Confident", "Warm", "Smooth"].includes(vibe)) return "plain";
  return "measured";
}

function take(pool: readonly string[], spent: string[]): { line: string; spent: string[] } {
  const fresh = pool.filter((line) => !spent.includes(line));
  const bag = fresh.length ? fresh : pool;
  const line = bag[Math.floor(Math.random() * bag.length)] ?? pool[0];
  return { line, spent: fresh.length ? [...spent, line] : [line] };
}

function stamp(memory: Memory, line: string, patch: Partial<Memory>): Memory {
  return { ...memory, ...patch, spent: memory.spent.includes(line) ? memory.spent : [...memory.spent, line] };
}

export function blankMemory(): Memory {
  return { stage: "intro", asked: 0, spent: [] };
}

export function humanPause() {
  return 3000 + Math.floor(Math.random() * 1001);
}

export function openingLine(name: string, vibe: string, spent: string[]): { line: string; spent: string[] } {
  const tone = toneOf(vibe);
  const pools: Record<Tone, string[]> = {
    measured: [
      `${name} here. You found the line. Tell me what the evening should feel like — I won’t guess.`,
      `Evening. It’s ${name}. What are you actually in the mood for?`,
      `Hi. ${name}. Dinner, a quiet room, or the longer stay. Your call.`,
      `You opened my chat. I’m ${name}. Say it in your own words and I’ll shape the block around it.`,
    ],
    light: [
      `Hey. ${name}. You tapped through — what’s the plan, loosely?`,
      `Hi. ${name} on this side. Dinner, the bar, or should I leave the room quiet?`,
      `Ok I’m here. Don’t write an essay. Just the shape of tonight.`,
      `${name}. Talk to me like a person. What do you want when you walk in?`,
    ],
    plain: [
      `It’s ${name}. Line’s open. What do you want from the block?`,
      `${name}. I read fast, so say it straight — hosting, dining, or an early night.`,
      `Hey. ${name}. I’m not going to pitch you a list. Tell me the evening.`,
      `Right. ${name}. What should I have ready before you arrive?`,
    ],
  };
  return take(pools[tone], spent);
}

function slotOf(text: string): { slot: string; price: string } | null {
  const t = text.toLowerCase();
  const overnight = DURATIONS.find((d) => d.code === "residency");
  const evening = DURATIONS.find((d) => d.code === "evening");
  const arrival = DURATIONS.find((d) => d.code === "arrival");
  if (!overnight || !evening || !arrival) return null;
  if (/\b(overnight|residency|all night|whole night|sleep)\b/.test(t)) {
    return { slot: overnight.label, price: zar(overnight.cents) };
  }
  if (/\b(evening|four hours|4 hours|4hr|the night)\b/.test(t) && !/overnight/.test(t)) {
    return { slot: evening.label, price: zar(evening.cents) };
  }
  if (/\b(90|ninety|hour and a half|arrival|short block)\b/.test(t) || /\b1 hour\b|\bone hour\b/.test(t)) {
    return { slot: arrival.label, price: zar(arrival.cents) };
  }
  return null;
}

function focusOf(text: string): string | null {
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

function acknowledge(name: string, vibe: string, focus: string, spent: string[]) {
  const tone = toneOf(vibe);
  const pools: Record<string, Record<Tone, string[]>> = {
    dining: {
      measured: [
        `Dining in the suite, then. I’ll have the kitchen pace it course by course, not all at once.`,
        `Alright. Private dining. I call the courses. You don’t see the corridor.`,
        `The kitchen can run. I’ll keep the plates moving at your pace, not theirs.`,
      ],
      light: [
        `Kitchen it is. I’ll run the courses so you’re not waiting on a cart.`,
        `Ok, dinner in the room. No lobby, no trolley parked in the hall.`,
        `Love that. I’ll set the table before you’re even sat.`,
      ],
      plain: [
        `Got you — in-suite dining. I’ll hold the kitchen to one course at a time.`,
        `Dinner, inside. I’ll deal with the pass. You don’t have to.`,
        `Noted. Food stays in the suite. I won’t let them stack the courses.`,
      ],
    },
    bar: {
      measured: [
        `I’ll work the bar in the suite. You won’t be handed a bill in the room.`,
        `A drink, then. I’ll pour. The desk posts it later, not me.`,
        `The private bar is already stocked. Tell me the glass when you’re in, or I can decide.`,
      ],
      light: [
        `Bar’s on me to pour. You just say the mood.`,
        `Ok, drinks in the room. I’ll have a glass waiting, not a menu speech.`,
        `Yeah. I’ll open something decent and we can change it if it’s wrong.`,
      ],
      plain: [
        `I’ll pour. Don’t worry about paying me for it.`,
        `The bar stays in the suite. I don’t do a tab conversation.`,
        `Right. First glass on the side, then we see.`,
      ],
    },
    wellness: {
      measured: [
        `Quiet it is. I’ll drop the lights and keep the corridor empty.`,
        `Wellness, not a performance. Bath or just the dark room — I’ll set it before you sit.`,
        `I’ll make the suite slower. Low light, no staff at the door.`,
      ],
      light: [
        `Quiet room. I’ll kill the bright lights and leave you the calm one.`,
        `Ok. Soft evening. I can draw a bath or just keep it still. Your pick later.`,
        `Yeah, we can do almost nothing. That’s a real option here.`,
      ],
      plain: [
        `Low light, door closed. I’ll handle anyone who knocks.`,
        `Rest, then. I won’t fill the silence unless you do.`,
        `I’ll set the room for quiet and stay inside the brief.`,
      ],
    },
    lounge: {
      measured: [
        `The members’ side, then. I walk with you. We don’t drift into the public rooms.`,
        `Gaming room or the viewing box — I’ll stay beside you and bring you back when the block says so.`,
      ],
      light: [
        `Lounge, got it. I’ll come with. We don’t do the main floor.`,
        `Ok, private rooms only. I’ll know which door.`,
      ],
      plain: [
        `On-property. I accompany. I don’t leave you to find the room.`,
        `Restricted rooms, yes. Public lobby, no.`,
      ],
    },
    outing: {
      measured: [
        `Off the property, then. The hotel car is already the way we move. I host. The driver stays a driver.`,
        `An outing. I’ll keep it to one place, not a tour.`,
      ],
      light: [
        `Out for a bit? Ok. Car’s the house’s, not a random ride.`,
        `Yeah we can leave the building. I’ll keep it simple.`,
      ],
      plain: [
        `Excursion noted. One stop, hotel car, then back.`,
        `Outside is fine. I don’t turn it into a sightseeing script.`,
      ],
    },
    company: {
      measured: [
        `Company, then. I’ll listen first. I’m not going to perform a personality at you.`,
        `Unhurried talk. Tell me what you actually do, or don’t. Both are fine.`,
      ],
      light: [
        `Just company. Easy. I’ll match your pace, not fill every gap.`,
        `Ok. Sit, talk, or don’t. I’m not a script.`,
      ],
      plain: [
        `Conversation. I’ll follow your subject, not mine.`,
        `Company it is. No pitch after this.`,
      ],
    },
    ambience: {
      measured: [
        `I’ll set the room before you arrive — light, climate, something low on the speakers.`,
        `The suite can already match a mood. Tell me warm, cool, or nearly dark.`,
      ],
      light: [
        `Mood of the room, yeah. I’ll fix the lights so you’re not walking into glare.`,
        `Ok I’ll tune it. You shouldn’t have to touch a panel.`,
      ],
      plain: [
        `Lights and sound, before you’re in. Say if you want it dim.`,
        `I’ll preset the suite. You can change one thing, not ten.`,
      ],
    },
    privacy: {
      measured: [
        `Privacy is the default. Phones down, staff off the corridor, nothing recorded.`,
        `I’ll be the only person at the door. Housekeeping waits.`,
      ],
      light: [
        `Discretion’s already on. I’m not taking pictures, and neither is the house.`,
        `Ok. Quiet door. If someone calls the room, they don’t get through.`,
      ],
      plain: [
        `No devices, no story that leaves the suite. That’s not a favour, it’s the rule.`,
        `I’ll filter the door. You won’t meet the rest of the hotel.`,
      ],
    },
  };
  const chosen = pools[focus]?.[tone] ?? pools.company[tone];
  return take(chosen, spent);
}

function askLength(vibe: string, spent: string[], asked: number) {
  const tone = toneOf(vibe);
  const pools: Record<Tone, string[]> = {
    measured: [
      `How long should I hold the suite — ninety minutes, the evening, or overnight?`,
      `The shortest block I keep is an hour and a half. Evening is four hours. Overnight runs to morning.`,
      `Give me a length and I’ll stop asking. Arrival, evening, or the night.`,
    ],
    light: [
      `So — 90 minutes, the whole evening, or overnight?`,
      `We don’t do a rushed half hour. Shortest is ninety. Or we take the night.`,
      `Pick a length and I’ll shut up about the clock.`,
    ],
    plain: [
      `Time first. 90 minutes, four hours, or until morning.`,
      `Which block? I can’t hold the suite on a maybe.`,
      `Arrival, evening, or overnight. One of those.`,
    ],
  };
  const extra = asked > 0 ? pools[tone].slice().reverse() : pools[tone];
  return take(extra, spent);
}

function lockLine(vibe: string, slot: string, price: string, spent: string[]) {
  const tone = toneOf(vibe);
  const pools: Record<Tone, string[]> = {
    measured: [
      `${slot}. ${price} sits on the folio — I won’t talk money once you’re in the room. Shall I hold it from 20:00?`,
      `I can keep ${slot}. The desk posts ${price}. I arrive at the private door, not the lobby. Lock it?`,
      `${slot}, ready from eight. The figure is ${price}, and it never changes hands between us. Want it held?`,
    ],
    light: [
      `${slot}. I’ll be there from 20:00. ${price} goes on the room, not to me. Lock it?`,
      `Ok. ${slot}. Figure’s ${price}, folio only. Want me to hold it?`,
      `Yeah I can do ${slot}. Eight o’clock, private entrance. ${price} on the folio. Yes?`,
    ],
    plain: [
      `${slot}. ${price}. Folio, not cash. I can be at the suite around eight. Lock it?`,
      `Holding ${slot} from 20:00. ${price} is the desk’s line, not a conversation. Confirm?`,
      `${slot}. I’ll take the private door at 20:10. Total ${price}, charged upstairs. Lock?`,
    ],
  };
  return take(pools[tone], spent);
}

function moreLine(vibe: string, slot: string, spent: string[]) {
  const tone = toneOf(vibe);
  const pools: Record<Tone, string[]> = {
    measured: [
      `It’s unhurried. I meet you off the lobby, set the room, and stay inside what we agreed. Still hold the ${slot}?`,
      `No photos, no staff in the room, and I close the evening cleanly when the block ends. Shall I keep the ${slot}?`,
      `I host. I don’t improvise past the brief, and I don’t linger after. The ${slot} is still there if you want it.`,
    ],
    light: [
      `Warm, private, no rush. I won’t turn it into a show. Still want the ${slot}?`,
      `I’ll keep the door. You set the pace. ${slot} still ok?`,
      `Nothing weird, nothing public. Just the ${slot}. Lock it or leave it.`,
    ],
    plain: [
      `Private entrance, suite, then a clean end. That’s the ${slot}. Yes or not yet.`,
      `I stay in the hotel’s rules and my own. If that’s fine, I’ll hold the ${slot}.`,
      `More detail won’t change the shape. ${slot}, private door, folio upstairs. Lock it?`,
    ],
  };
  return take(pools[tone], spent);
}

function laterLine(vibe: string, spent: string[]) {
  const tone = toneOf(vibe);
  const pools: Record<Tone, string[]> = {
    measured: [`No pressure. Say the word and I’ll hold the time. I’ll stay on the line.`],
    light: [`All good. I’m here if you change your mind. No chase.`],
    plain: [`Fine. I won’t hold it in the air. Tell me when it’s a yes.`],
  };
  return take(pools[tone], spent);
}

function bookedLines(vibe: string, slot: string, price: string, spent: string[]): { lines: HostLine[]; spent: string[] } {
  const tone = toneOf(vibe);
  const spoken = slot.startsWith("Overnight") ? "the night" : slot.startsWith("Arrival") ? "the arrival block" : "the evening";
  const firstPools: Record<Tone, string[]> = {
    measured: [
      `Done. ${spoken[0].toUpperCase()}${spoken.slice(1)} is held. I’ll be at the private door around 20:10, not in the lobby.`,
      `Held. I’ll come to the suite for ${spoken} — not the other way around.`,
    ],
    light: [
      `Locked. I’ll slip in around 20:10, private side.`,
      `Ok, ${spoken} is yours. Don’t wait in the lobby. I’ll come to you.`,
    ],
    plain: [
      `Confirmed. ${spoken[0].toUpperCase()}${spoken.slice(1)}, private entrance, 20:10.`,
      `It’s held. I’ll meet you at the suite.`,
    ],
  };
  const first = take(firstPools[tone], spent);
  return {
    spent: first.spent,
    lines: [
      { text: first.line },
      { text: "Settle it on the folio when you’re ready. I don’t take payment in the chat.", booking: { slot, price } },
    ],
  };
}

function settledLine(vibe: string, slot: string, ref: string, room: string, spent: string[]) {
  const tone = toneOf(vibe);
  const where = room ? ` Room ${room}.` : "";
  const pools: Record<Tone, string[]> = {
    measured: [
      `The desk has it. Ref ${ref}.${where} Your ${slot} stands. I’ll see you at 20:00.`,
      `Posted. ${ref}.${where} Nothing else to arrange in here. I’ll be at the door at eight.`,
    ],
    light: [
      `All set. ${ref}.${where} ${slot} is real now. See you at eight.`,
      `Got it on the folio. Ref ${ref}.${where} I’ll be there.`,
    ],
    plain: [
      `Folio updated. ${ref}.${where} ${slot}, 20:00. That’s the end of the admin.`,
      `Recorded. ${ref}.${where} Don’t bring cash. I’ll see you at the suite.`,
    ],
  };
  return take(pools[tone], spent);
}

function afterLine(vibe: string, text: string, spent: string[]) {
  const t = text.toLowerCase();
  const tone = toneOf(vibe);
  let pools: string[];
  if (/\b(wear|dress|outfit|bring)\b/.test(t)) {
    pools = [
      `Dress like you’re already in the building. I won’t turn it into a theme.`,
      `Nothing to bring. If you want the room a certain way, say it in one line.`,
      `I’ll dress for the house, not a costume. You do the same.`,
    ];
  } else if (/\b(quiet|alone|silence|lights)\b/.test(t)) {
    pools = [
      `I’ll keep it quiet unless you start.`,
      `Dim, then. I won’t add music if you don’t ask.`,
      `Understood. Low light, fewer words.`,
    ];
  } else if (/\b(drink|wine|glass|bar)\b/.test(t)) {
    pools = [
      `I’ll have a glass poured. Tell me if you want it changed.`,
      `Wine or something shorter — I’ll decide if you don’t.`,
      `First drink is waiting. The rest can wait too.`,
    ];
  } else if (/\b(see you|soon|tonight|eight|20)\b/.test(t)) {
    pools = [
      `See you at the private door.`,
      `I’ll be on time. You don’t have to be early.`,
      `Tonight, then. I’ll text nothing — this line is enough.`,
    ];
  } else {
    const poolsByTone: Record<Tone, string[]> = {
      measured: [
        `I’ll keep the rest for the room. Anything you want set before I arrive, say it once.`,
        `Noted. I won’t add a plan you didn’t ask for.`,
        `Alright. I’ll hold the shape we agreed and leave the extras alone.`,
        `If the room should be darker, or the first course later, tell me now.`,
      ],
      light: [
        `Ok. I’ll leave it there unless you add something.`,
        `Cool. One more thing if you have it, or we’re done talking logistics.`,
        `Yeah. I won’t over-prepare it.`,
        `Got you. See you when the block starts — or say if the mood should change.`,
      ],
      plain: [
        `Heard. I won’t embroider it.`,
        `Fine. I’ll stick to that.`,
        `Anything else, or do we leave it.`,
        `Noted. The suite will match that, not a bigger idea.`,
      ],
    };
    pools = poolsByTone[tone];
  }
  return take(pools, spent);
}

function curious(vibe: string, text: string, spent: string[]): { line: string; spent: string[] } | null {
  const t = text.toLowerCase();
  const tone = toneOf(vibe);
  if (/\b(who are you|your name|which one)\b/.test(t)) {
    return take(
      tone === "light"
        ? [`Still me. You don’t have to pick again.`]
        : [`You’re already on my line. No need to start over.`],
      spent,
    );
  }
  if (/\b(how much|price|cost|rate|pay)\b/.test(t)) {
    return take(
      [
        `The desk posts the block. I can tell you the figure when you pick a length — I don’t haggle in the chat.`,
        `Money stays on the folio. Choose 90 minutes, the evening, or overnight and I’ll say the number once.`,
        `I don’t take payment personally. The length decides the folio line.`,
      ],
      spent,
    );
  }
  if (/\b(menu|services|what do you do|options)\b/.test(t)) {
    return take(
      [
        `Every hostess holds the same list. Dining, the bar, a quiet suite, the members’ rooms, or a short trip out. What do you actually want?`,
        `I won’t read you sixteen items. Dining, drinks, quiet, company, or out. Start there.`,
        `Same floor for all of us. Tell me the mood and I’ll match a service, not a brochure.`,
      ],
      spent,
    );
  }
  return null;
}

export function replyTo(name: string, vibe: string, memory: Memory, text: string): Reply {
  const clean = text.trim();
  const lower = clean.toLowerCase();
  let spent = memory.spent;
  const slot = slotOf(clean);
  const focus = focusOf(clean) ?? memory.focus;

  if (/\b(30|half an hour|half hour|twenty minutes)\b/.test(lower) && !slot) {
    const short = take(
      [
        `I can’t hold a half hour. The short block is ninety minutes — arrival, then the evening if you want longer.`,
        `Too short for the suite. Ninety minutes is the floor. Evening if you want it unhurried.`,
        `We don’t do a rushed slot. Say ninety minutes, the evening, or overnight.`,
      ],
      spent,
    );
    return {
      memory: { ...memory, stage: "shape", asked: memory.asked + 1, spent: short.spent },
      lines: [{ text: short.line }],
      quick: SLOT_QUICK,
    };
  }

  if (memory.stage === "settled") {
    const next = afterLine(vibe, clean, spent);
    return {
      memory: { ...memory, spent: next.spent },
      lines: [{ text: next.line }],
      quick: [],
    };
  }

  if (memory.stage === "booked" && memory.slot && memory.price) {
    const next = afterLine(vibe, clean, spent);
    return {
      memory: { ...memory, spent: next.spent },
      lines: [{ text: next.line }],
      quick: [],
    };
  }

  if (memory.stage === "confirm" && memory.slot && memory.price) {
    if (/\b(yes|lock|book|confirm|do it|please|ok|okay|yeah|yep|sure)\b/.test(lower)) {
      const booked = bookedLines(vibe, memory.slot, memory.price, spent);
      return {
        memory: { ...memory, stage: "booked", spent: booked.spent },
        lines: booked.lines,
        quick: [],
      };
    }
    if (/\b(more|detail|how|what happens|explain)\b/.test(lower)) {
      const more = moreLine(vibe, memory.slot, spent);
      return {
        memory: stamp(memory, more.line, { spent: more.spent }),
        lines: [{ text: more.line }],
        quick: ["Yes, lock it", "Not yet"],
      };
    }
    const later = laterLine(vibe, spent);
    return {
      memory: stamp(memory, later.line, { stage: "shape", spent: later.spent, asked: memory.asked + 1 }),
      lines: [{ text: later.line }],
      quick: SLOT_QUICK,
    };
  }

  const side = curious(vibe, clean, spent);
  if (side && !slot && memory.stage === "intro") {
    return {
      memory: { ...memory, spent: side.spent, asked: memory.asked + 1 },
      lines: [{ text: side.line }],
      quick: OPEN_QUICK,
    };
  }

  if (slot) {
    const known = memory.focus && memory.focus === focus && (memory.stage === "shape" || memory.stage === "confirm");
    const locked = lockLine(vibe, slot.slot, slot.price, spent);
    if (known) {
      return {
        memory: {
          ...memory,
          stage: "confirm",
          slot: slot.slot,
          price: slot.price,
          spent: locked.spent,
        },
        lines: [{ text: locked.line }],
        quick: LOCK_QUICK,
      };
    }
    const lead = focus
      ? acknowledge(name, vibe, focus, spent)
      : take(
          toneOf(vibe) === "light"
            ? [`Ok. I’ll take ${slot.slot.toLowerCase()}.`]
            : [`${slot.slot}. I’ll work to that.`],
          spent,
        );
    const afterLead = lockLine(vibe, slot.slot, slot.price, lead.spent);
    return {
      memory: {
        ...memory,
        stage: "confirm",
        slot: slot.slot,
        price: slot.price,
        focus: focus ?? memory.focus,
        spent: afterLead.spent,
      },
      lines: [{ text: lead.line }, { text: afterLead.line }],
      quick: LOCK_QUICK,
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
        spent: ask.spent,
      },
      lines: [{ text: ack.line }, { text: ask.line }],
      quick: SLOT_QUICK,
    };
  }

  if (memory.stage === "shape" || memory.stage === "confirm") {
    const ask = askLength(vibe, spent, memory.asked + 1);
    const bridge = take(
      [
        `I can host that. I still need a length or the suite won’t hold.`,
        `Say it plainer if you want — or just pick how long.`,
        `The room can flex. The clock can’t.`,
        `Alright. One decision, then I’ll stop circling.`,
      ],
      ask.spent,
    );
    return {
      memory: { ...memory, asked: memory.asked + 1, spent: [...ask.spent, bridge.line] },
      lines: [{ text: bridge.line }, { text: ask.line }],
      quick: SLOT_QUICK,
    };
  }

  const nudge = take(
    toneOf(vibe) === "measured"
      ? [
          `Tell me straight. Dinner, a quiet room, a drink, or just someone in the suite?`,
          `You can be brief. What should the first hour feel like?`,
          `I’m here. What are you looking for once the door closes?`,
        ]
      : toneOf(vibe) === "light"
        ? [
            `Company, dinner, or a quiet night? Pick one, even loosely.`,
            `You looking for an evening, or just saying hi?`,
            `Give me a hint. Bar, food, or leave the room dim.`,
          ]
        : [
            `Dinner, drinks, quiet, or company. Which one?`,
            `Don’t circle it. What do you want tonight?`,
            `One line is enough. What kind of block?`,
          ],
    spent,
  );
  return {
    memory: { ...memory, stage: "intro", asked: memory.asked + 1, spent: nudge.spent },
    lines: [{ text: nudge.line }],
    quick: OPEN_QUICK,
  };
}

export function paymentLine(name: string, vibe: string, memory: Memory, ref: string, room: string): Reply {
  const slot = memory.slot ?? "the block";
  const next = settledLine(vibe, slot, ref, room, memory.spent);
  return {
    memory: { ...memory, stage: "settled", spent: next.spent },
    lines: [{ text: next.line }],
    quick: ["See you at eight", "Keep the room quiet", "A glass first"],
  };
}

export function hostessFirstName(name: string) {
  return name.split(" ")[0] || name;
}
