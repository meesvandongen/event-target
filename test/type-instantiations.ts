import { type CustomEvent, TypedEventTarget } from "../src/index";

/**
 * Tiny type-level assertion helpers.
 * If a type check fails, TypeScript will error during `bun run typecheck`.
 */

type Equal<A, B> =
	(<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2
		? true
		: false;

type Expect<T extends true> = T;

interface InstantiationEvents {
	/** Payload is literally `undefined` */
	undef: undefined;
	/** Regular payload */
	text: string;
	/** Union payload (detail required) */
	maybeText: string | undefined;
}

// --- TypedEventTarget API surface

const t = new TypedEventTarget<InstantiationEvents>();

// `undefined` payload: init should be optional; `detail` should be allowed but only as `undefined`.
t.dispatchTypedEvent("undef");
t.dispatchTypedEvent("undef", {});
t.dispatchTypedEvent("undef", { bubbles: true });
// @ts-expect-error - detail may never be present for `undefined` payload
t.dispatchTypedEvent("undef", { detail: undefined });
// @ts-expect-error - wrong detail type
t.dispatchTypedEvent("undef", { detail: "nope" });

// Regular payload: init required and must contain correct `detail`.
// @ts-expect-error - init required for non-`never`/`undefined` payload
t.dispatchTypedEvent("text");
// @ts-expect-error - missing detail
t.dispatchTypedEvent("text", {});
t.dispatchTypedEvent("text", { detail: "hello" });
// @ts-expect-error - wrong detail type
t.dispatchTypedEvent("text", { detail: 123 });

// Union including undefined: should still require init (and detail), because payload isn’t literally `undefined`.
// @ts-expect-error - init required
t.dispatchTypedEvent("maybeText");
t.dispatchTypedEvent("maybeText", {});
t.dispatchTypedEvent("maybeText", { detail: "hi" });

// Listener event parameter typing

t.addEventListener("undef", (e) => {
	type _1 = Expect<Equal<typeof e, Event>>;
  type _2 = Expect<Equal<typeof e, CustomEvent<undefined>>>;
	// @ts-expect-error - plain Event has no typed detail
	e.detail;
});

t.addEventListener("text", (e) => {
	type _ = Expect<Equal<typeof e, CustomEvent<string>>>;
	const s: string = e.detail;
	void s;
});
