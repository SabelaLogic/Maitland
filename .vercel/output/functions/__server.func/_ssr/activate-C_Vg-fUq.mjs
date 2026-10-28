import { o as __toESM } from "../_runtime.mjs";
import { J as require_react, x as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { i as consumeActivation } from "./comms-BsPr7Mga.mjs";
import { n as Route$3 } from "./router-XsIfaNUC.mjs";
import { s as errText } from "./ui-Debh48St.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/activate-C_Vg-fUq.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function Activate() {
	const { token } = Route$3.useSearch();
	const [message, setMessage] = (0, import_react.useState)("Activating the account…");
	const [ok, setOk] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		if (!token) {
			setMessage("This activation link is missing its token.");
			return;
		}
		consumeActivation({ data: { token } }).then(() => {
			setOk(true);
			setMessage("The account is active. You can open a hostess line.");
		}).catch((e) => setMessage(errText(e)));
	}, [token]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-4 px-5",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs tracking-widest text-gold uppercase",
				children: "Maitland Hotel"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "font-display text-4xl italic",
				children: "Activation"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: ok ? "text-sm text-fg" : "text-sm text-muted",
				children: message
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
				to: "/",
				className: "min-h-11 text-sm text-gold",
				children: "Back to the floor"
			})
		]
	});
}
//#endregion
export { Activate as component };
