import { x as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ui-Debh48St.js
var import_jsx_runtime = require_jsx_runtime();
function errText(error) {
	if (error instanceof Error && error.message) return error.message;
	return "The desk could not complete that.";
}
function clock(raw) {
	const d = new Date(raw);
	if (Number.isNaN(d.getTime())) return "";
	return d.toLocaleTimeString("en-ZA", {
		hour: "2-digit",
		minute: "2-digit"
	});
}
function Chip({ on, children, onClick, disabled }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		"aria-pressed": on,
		disabled,
		onClick,
		className: "min-h-11 rounded-full border px-3 text-sm disabled:opacity-50 " + (on ? "border-gold bg-gold text-bg" : "border-line bg-raised text-fg"),
		children
	});
}
function Block({ title, kicker, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "rounded-2xl border border-line bg-surface p-4",
		children: [
			kicker ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "text-xs tracking-widest text-gold uppercase",
				children: kicker
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "font-display text-2xl italic leading-tight",
				children: title
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-3 flex flex-col gap-3",
				children
			})
		]
	});
}
function GoldButton({ children, onClick, disabled, type = "button" }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type,
		onClick,
		disabled,
		className: "min-h-11 rounded-full bg-gold px-5 text-sm font-medium text-bg disabled:opacity-50",
		children
	});
}
function GhostButton({ children, onClick, disabled }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
		type: "button",
		onClick,
		disabled,
		className: "min-h-11 rounded-full border border-line px-4 text-sm text-fg disabled:opacity-50",
		children
	});
}
function Label({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
		className: "text-xs tracking-wide text-muted uppercase",
		children
	});
}
//#endregion
export { Label as a, GoldButton as i, Chip as n, clock as o, GhostButton as r, errText as s, Block as t };
