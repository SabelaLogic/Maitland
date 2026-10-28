import { o as __toESM } from "../_runtime.mjs";
import { J as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as authClient } from "./client-IWHfIGH2.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/paystack-DZFZkEtd.js
var import_react = /* @__PURE__ */ __toESM(require_react());
/**
* Current user + loading state. Same behavior in live preview and when deployed:
*   - Auth enabled -> the real signed-in user; `user` is `null` while
*                            the session resolves (`isPending: true`) and when
*                            signed out (`isPending: false`). Session comes from
*                            Better Auth `useSession()` → `/api/auth/get-session`
*                            (cookie when deployed; bearer in live preview).
*   - Auth disabled (`VITE_AUTH_ENABLED=false`) -> `DEV_USER`, never pending.
*
* Protect a route by waiting out `isPending` before acting on `user` —
* redirecting on `user: null` alone bounces signed-in visitors to sign-in on
* every hard reload:
*
*   import { RedirectToSignIn } from "@/lib/auth/gates";
*   const { user, isPending } = useCurrentUserState();
*   if (isPending) return null;              // still resolving — don't redirect yet
*   if (!user) return <RedirectToSignIn />;  // definitely signed out
*
* `authEnabled` is a module-level constant fixed at load, so the guarded hook
* call keeps a stable hook order across every render of a given component.
*/
function useCurrentUserState() {
	return useSessionUserState();
}
function useSessionUserState() {
	const { data, isPending } = authClient.useSession();
	const id = data?.user.id;
	const displayName = data?.user.name ?? null;
	const primaryEmail = data?.user.email ?? null;
	const profileImageUrl = data?.user.image ?? null;
	const user = (0, import_react.useMemo)(() => id ? {
		id,
		displayName,
		primaryEmail,
		profileImageUrl,
		isDevFallback: false
	} : null, [
		id,
		displayName,
		primaryEmail,
		profileImageUrl
	]);
	return (0, import_react.useMemo)(() => ({
		user,
		isPending
	}), [user, isPending]);
}
/**
* Convenience view of `useCurrentUserState().user` for display (e.g.
* `user?.displayName ?? "Guest"`). NOTE: `null` means *loading OR signed out* —
* for redirects/guards use `useCurrentUserState()` and check `isPending`.
*/
function useCurrentUser() {
	return useCurrentUserState().user;
}
/** Paystack public key. Safe to ship; the secret stays off the client. */
var PAYSTACK_PUBLIC_KEY = "pk_live_fd069e0542040895963a597ca1f70baafaccaba4";
var SCRIPT = "https://js.paystack.co/v1/inline.js";
function payEmail(email) {
	if (email && email.includes("@")) return email;
	return "guest@maitland.hotel";
}
function loadPaystack() {
	if (typeof window === "undefined") return Promise.reject(/* @__PURE__ */ new Error("Paystack runs in the browser"));
	if (window.PaystackPop) return Promise.resolve();
	return new Promise((resolve, reject) => {
		const found = document.querySelector(`script[src="${SCRIPT}"]`);
		if (found) {
			found.addEventListener("load", () => resolve(), { once: true });
			found.addEventListener("error", () => reject(/* @__PURE__ */ new Error("Paystack could not load")), { once: true });
			if (window.PaystackPop) resolve();
			return;
		}
		const script = document.createElement("script");
		script.src = SCRIPT;
		script.async = true;
		script.onload = () => resolve();
		script.onerror = () => reject(/* @__PURE__ */ new Error("Paystack could not load"));
		document.head.appendChild(script);
	});
}
async function startPaystack(input) {
	if (input.amountCents <= 0) return { reference: "" };
	await loadPaystack();
	const pop = window.PaystackPop;
	if (!pop) throw new Error("Paystack could not load");
	return new Promise((resolve, reject) => {
		pop.setup({
			key: PAYSTACK_PUBLIC_KEY,
			email: input.email,
			amount: input.amountCents,
			currency: "ZAR",
			metadata: { custom_fields: [{
				display_name: "Description",
				variable_name: "desc",
				value: input.description
			}] },
			callback: (response) => {
				if (!response.reference) {
					reject(/* @__PURE__ */ new Error("Paystack did not return a reference"));
					return;
				}
				resolve({ reference: response.reference });
			},
			onClose: () => reject(/* @__PURE__ */ new Error("Payment was closed before it finished"))
		}).openIframe();
	});
}
//#endregion
export { useCurrentUserState as i, startPaystack as n, useCurrentUser as r, payEmail as t };
