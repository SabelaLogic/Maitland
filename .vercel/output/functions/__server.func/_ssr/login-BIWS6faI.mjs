import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as GROK_PROVIDERS } from "./server-BCX7neK4.mjs";
import { r as signIn } from "./client-IWHfIGH2.mjs";
import { i as rise, t as arrive } from "./motion-DD2WP4PK.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/login-BIWS6faI.js
var import_jsx_runtime = require_jsx_runtime();
function Login() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 px-5 py-16",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: arrive,
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
					className: "mt-3 text-sm leading-relaxed text-muted",
					children: "Sign in to open reservations, the suite, and the folio."
				})
			]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: `${rise} flex flex-col gap-3`,
			children: GROK_PROVIDERS.map((p) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
				type: "button",
				onClick: () => signIn(p.providerId, { callbackURL: "/" }),
				className: "min-h-11 rounded-full bg-gold px-4 text-sm font-medium text-bg",
				children: ["Continue with ", p.label]
			}, p.providerId))
		})]
	});
}
//#endregion
export { Login as component };
