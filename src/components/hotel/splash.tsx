import { useEffect, useState } from "react";
import { ROSTER } from "@/lib/hotel/catalog";

const CLIPS = ["/media/slide-1.mp4", "/media/slide-2.mp4", "/media/slide-3.mp4", "/media/slide-4.mp4"];

const SCREENS = [
  {
    title: "In-suite reception",
    line: "Met at the suite. The lobby is not used.",
    src: ROSTER[0]?.portrait ?? "",
  },
  {
    title: "Suite atmosphere",
    line: "Light, climate and sound, set before arrival.",
    src: ROSTER[3]?.portrait ?? "",
  },
  {
    title: "Private dining",
    line: "Courses from the kitchen, paced in the room.",
    src: ROSTER[7]?.portrait ?? "",
  },
  {
    title: "House folio",
    line: "Paystack only. Nothing is settled in cash.",
    src: ROSTER[8]?.portrait ?? "",
  },
  {
    title: "Become a hostess",
    line: "Your hours. The same house menu as the floor.",
    src: ROSTER[4]?.portrait ?? "",
  },
];

const HOLD_MS = 5000;

export function HouseSplash() {
  const [phase, setPhase] = useState<"in" | "out" | "done">("in");

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setPhase("out"), reduce ? 900 : HOLD_MS);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (phase !== "out") return;
    const timer = window.setTimeout(() => setPhase("done"), 620);
    return () => window.clearTimeout(timer);
  }, [phase]);

  if (phase === "done") return null;

  const film = [...CLIPS, ...CLIPS];

  return (
    <div className={phase === "out" ? "splash leave" : "splash"} role="dialog" aria-label="Maitland House, opening">
      <div className="splash-film" aria-hidden="true">
        <div className="splash-track">
          {film.map((src, i) => (
            <video key={`${src}-${i}`} src={src} autoPlay muted loop playsInline />
          ))}
        </div>
      </div>
      <img className="splash-pair" src="/media/splash-pair.jpg" alt="" />
      <div className="splash-veil" aria-hidden="true" />

      <header className="splash-brand">
        <span className="splash-crest" aria-hidden="true">
          M
        </span>
        <p>Maitland House</p>
        <h1>Bespoke hospitality</h1>
        <p className="splash-sub">Private arrival. The suite is already prepared.</p>
        <p className="splash-foot">House application</p>
      </header>

      <div className="apk-fan" aria-hidden="true">
        {SCREENS.map((screen, i) => (
          <article key={screen.title} className={`apk-phone apk-phone-${i}`}>
            <div className="apk-notch" />
            <img src={screen.src} alt="" />
            <div className="apk-copy">
              <strong>{screen.title}</strong>
              <span>{screen.line}</span>
            </div>
          </article>
        ))}
      </div>

      <div className="splash-meter" aria-hidden="true">
        <span />
      </div>
    </div>
  );
}
