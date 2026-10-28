import { useEffect, useRef, useState } from "react";
import {
  blankMemory,
  hostessFirstName,
  humanPause,
  openingLine,
  paymentLine,
  replyTo,
  type HostLine,
  type Memory,
} from "@/lib/hotel/voice";

type Bubble = HostLine & { id: string; who: "me" | "them"; time: string };

export type ChatHost = { key: string; name: string; vibe: string; portrait: string };

type Props = {
  host: ChatHost;
  onClose: () => void;
  onGuestLine?: (body: string) => void;
};

function clock() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function uid() {
  return crypto.randomUUID();
}

export function LiveChat({ host, onClose, onGuestLine }: Props) {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [memory, setMemory] = useState<Memory>(blankMemory);
  const [typing, setTyping] = useState(true);
  const [draft, setDraft] = useState("");
  const [quick, setQuick] = useState<string[]>([]);
  const [confirm, setConfirm] = useState(false);
  const [receipt, setReceipt] = useState<{ ref: string; method: string; room: string } | null>(null);
  const [room, setRoom] = useState("");
  const memoryRef = useRef(memory);
  const boxRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    memoryRef.current = memory;
  }, [memory]);

  useEffect(() => {
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

  useEffect(() => {
    const box = boxRef.current;
    if (box) box.scrollTop = box.scrollHeight;
  }, [bubbles, typing, quick, confirm]);

  useEffect(() => {
    return () => {
      for (const id of timers.current) window.clearTimeout(id);
    };
  }, []);

  function later(fn: () => void, ms: number) {
    const id = window.setTimeout(fn, ms);
    timers.current.push(id);
  }

  function pushThem(lines: HostLine[]) {
    setBubbles((prev) => [
      ...prev,
      ...lines.map((line) => ({ ...line, id: uid(), who: "them" as const, time: clock() })),
    ]);
  }

  useEffect(() => {
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
      setMemory((m) => ({ ...m, spent: openedLine.spent }));
      setTyping(false);
      setBubbles([
        { id: crypto.randomUUID(), who: "them", text: openedLine.line, time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
      ]);
      setQuick(["Dinner in the suite", "A quiet room", "The bar", "Just company"]);
    }, wait);
    return () => {
      cancel = true;
      window.clearTimeout(id);
    };
  }, [host.key, host.name, host.vibe]);

  function speak(lines: HostLine[], nextQuick: string[], nextMemory: Memory) {
    setTyping(true);
    setQuick([]);
    later(() => {
      setTyping(false);
      setMemory(nextMemory);
      pushThem(lines);
      setQuick(nextQuick);
    }, humanPause());
  }

  function send(text: string) {
    const body = text.trim();
    if (!body || typing) return;
    setDraft("");
    setQuick([]);
    setBubbles((prev) => [...prev, { id: uid(), who: "me", text: body, time: clock() }]);
    onGuestLine?.(body);
    const next = replyTo(hostessFirstName(host.name), host.vibe, memoryRef.current, body);
    speak(next.lines, next.quick, next.memory);
  }

  function settle(method: string) {
    const ref = `MT-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
    const roomNote = room.trim();
    setReceipt({ ref, method, room: roomNote });
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
      "No payment passes between guest and hostess.",
    ]
      .filter(Boolean)
      .join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `Maitland-Folio-${receipt.ref}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div ref={rootRef} className="live-chat">
      {confirm ? (
        <section className="live-confirm">
          <header className="live-head">
            <button type="button" className="live-back" onClick={() => setConfirm(false)}>
              ← Back
            </button>
            <h2>Confirm the block</h2>
          </header>
          <div className="live-confirm-body">
            {receipt ? (
              <div className="live-success">
                <div className="live-tick">✓</div>
                <h3>Posted to the folio</h3>
                <div className="live-receipt">
                  <h3>Folio note</h3>
                  <div className="live-line">
                    <span>Hostess</span>
                    <span>{host.name}</span>
                  </div>
                  <div className="live-line">
                    <span>Session</span>
                    <span>{memory.slot}</span>
                  </div>
                  {receipt.room ? (
                    <div className="live-line">
                      <span>Room</span>
                      <span>{receipt.room}</span>
                    </div>
                  ) : null}
                  <div className="live-line">
                    <span>Route</span>
                    <span>{receipt.method}</span>
                  </div>
                  <div className="live-line">
                    <span>Amount</span>
                    <span>{memory.price}</span>
                  </div>
                  <div className="live-line">
                    <span>Status</span>
                    <span className="live-ok">On the folio</span>
                  </div>
                  <p className="live-ref">Ref {receipt.ref}</p>
                </div>
                <div className="live-receipt-actions">
                  <button type="button" className="live-ghost" onClick={downloadReceipt}>
                    Download note
                  </button>
                  <button type="button" className="live-send" onClick={() => setConfirm(false)}>
                    Back to chat
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="live-summary">
                  <div className="live-line">
                    <span>Hostess</span>
                    <span>{host.name}</span>
                  </div>
                  <div className="live-line">
                    <span>Session</span>
                    <span>{memory.slot}</span>
                  </div>
                  <div className="live-line">
                    <span>From</span>
                    <span>20:00</span>
                  </div>
                  <div className="live-line live-total">
                    <span>Folio</span>
                    <span>{memory.price}</span>
                  </div>
                </div>
                <p className="live-fine">The house posts this. Nothing is paid to {host.name} directly.</p>
                <label className="live-room">
                  Room, if you have one
                  <input value={room} placeholder="e.g. 412" onChange={(e) => setRoom(e.target.value)} />
                </label>
                <div className="live-pays">
                  <button type="button" className="live-pay primary" onClick={() => settle("Room folio")}>
                    Charge to the room folio
                  </button>
                  <button type="button" className="live-pay" onClick={() => settle("Ozow")}>
                    Ozow / Instant EFT
                  </button>
                  <button type="button" className="live-pay" onClick={() => settle("PayFast")}>
                    PayFast
                  </button>
                  <button type="button" className="live-pay" onClick={() => settle("SnapScan")}>
                    SnapScan
                  </button>
                </div>
              </>
            )}
          </div>
        </section>
      ) : (
        <>
          <header className="live-head">
            <button type="button" className="live-back" onClick={onClose}>
              ← Back
            </button>
            <img src={host.portrait} alt="" />
            <div className="live-who">
              <div className="live-name">{host.name}</div>
              {typing ? <div className="live-typing">typing.....</div> : <div className="live-status">online</div>}
            </div>
          </header>
          <div ref={boxRef} className="live-msgs" aria-live="polite">
            {bubbles.map((msg) => (
              <div key={msg.id} className={msg.who === "me" ? "msg me" : "msg them"}>
                <p>{msg.text}</p>
                {msg.booking ? (
                  <div className="booking-card">
                    <strong>Block held</strong>
                    <span>
                      {msg.booking.slot} · {msg.booking.price}
                    </span>
                    <span>Hostess {host.name}</span>
                    <span>Private door from 20:00</span>
                    <button type="button" onClick={() => setConfirm(true)}>
                      Settle on the folio
                    </button>
                  </div>
                ) : null}
                <div className="time">{msg.time}</div>
              </div>
            ))}
            {typing ? <div className="msg them typing-bubble">typing.....</div> : null}
          </div>
          {quick.length ? (
            <div className="live-quick">
              {quick.map((item) => (
                <button key={item} type="button" disabled={typing} onClick={() => send(item)}>
                  {item}
                </button>
              ))}
            </div>
          ) : null}
          <form
            className="live-input"
            onSubmit={(e) => {
              e.preventDefault();
              send(draft);
            }}
          >
            <input
              value={draft}
              placeholder="Message"
              enterKeyHint="send"
              onChange={(e) => setDraft(e.target.value)}
            />
            <button type="submit" className="live-send" disabled={typing || !draft.trim()}>
              Send
            </button>
          </form>
        </>
      )}
    </div>
  );
}
