/** Paystack public key. Safe to ship; the secret stays off the client. */
export const PAYSTACK_PUBLIC_KEY = "pk_live_fd069e0542040895963a597ca1f70baafaccaba4";

const SCRIPT = "https://js.paystack.co/v1/inline.js";

type Setup = {
  key: string;
  email: string;
  amount: number;
  currency: "ZAR";
  metadata?: { custom_fields: { display_name: string; variable_name: string; value: string }[] };
  callback: (response: { reference: string }) => void;
  onClose: () => void;
};

declare global {
  interface Window {
    PaystackPop?: { setup: (options: Setup) => { openIframe: () => void } };
  }
}

export function payEmail(email?: string | null) {
  if (email && email.includes("@")) return email;
  return "guest@maitland.hotel";
}

function loadPaystack() {
  if (typeof window === "undefined") return Promise.reject(new Error("Paystack runs in the browser"));
  if (window.PaystackPop) return Promise.resolve();
  return new Promise<void>((resolve, reject) => {
    const found = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT}"]`);
    if (found) {
      found.addEventListener("load", () => resolve(), { once: true });
      found.addEventListener("error", () => reject(new Error("Paystack could not load")), { once: true });
      if (window.PaystackPop) resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = SCRIPT;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Paystack could not load"));
    document.head.appendChild(script);
  });
}

export async function startPaystack(input: { amountCents: number; email: string; description: string }) {
  if (input.amountCents <= 0) return { reference: "" };
  await loadPaystack();
  const pop = window.PaystackPop;
  if (!pop) throw new Error("Paystack could not load");
  return new Promise<{ reference: string }>((resolve, reject) => {
    const handler = pop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: input.email,
      amount: input.amountCents,
      currency: "ZAR",
      metadata: {
        custom_fields: [{ display_name: "Description", variable_name: "desc", value: input.description }],
      },
      callback: (response) => {
        if (!response.reference) {
          reject(new Error("Paystack did not return a reference"));
          return;
        }
        resolve({ reference: response.reference });
      },
      onClose: () => reject(new Error("Payment was closed before it finished")),
    });
    handler.openIframe();
  });
}
