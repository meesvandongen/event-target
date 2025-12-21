import { TypedEventTarget } from "../src/index";

interface AppEvents {
	ready: never;
	message: string;
	progress: { loaded: number; total: number };
}

const bus = new TypedEventTarget<AppEvents>();

bus.addEventListener("ready", () => {
	// detail is `never` here; there's nothing to read.
});

bus.addEventListener("message", (e) => {
	// e is CustomEvent<string>
	console.log(e.detail.toUpperCase());
});

bus.addEventListener("progress", (e) => {
	// e is CustomEvent<{ loaded: number; total: number }>
	const pct = (e.detail.loaded / e.detail.total) * 100;
	console.log(`${pct.toFixed(1)}%`);
});

//  strongly typed dispatch
bus.dispatchTypedEvent("ready");
bus.dispatchTypedEvent("message", { detail: "hello" });
bus.dispatchTypedEvent("progress", { detail: { loaded: 5, total: 20 } });

//  unknown event names are a type error
// @ts-expect-error
bus.addEventListener("doesNotExist", {});

//  wrong detail type is a type error
// @ts-expect-error
bus.dispatchTypedEvent("message", { detail: 123 });

//  Empty detail type for 'message' is a type error
// @ts-expect-error
bus.dispatchTypedEvent("message", {});
