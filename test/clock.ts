import { TypedEventTarget } from "@mvd/event-target";

interface ClockEvents {
	tick: number; // detail = unix timestamp
	stopped: never;
}

export class Clock extends TypedEventTarget<ClockEvents> {
	#timer: ReturnType<typeof setInterval> | undefined;

	start(intervalMs = 1000) {
		if (this.#timer) return;
		this.#timer = setInterval(() => {
			this.dispatchTypedEvent("tick", { detail: Date.now() });
		}, intervalMs);
	}

	stop() {
		if (!this.#timer) return;
		clearInterval(this.#timer);
		this.#timer = undefined;
		this.dispatchTypedEvent("stopped");
	}
}

const clock = new Clock();

clock.addEventListener("tick", (e) => {
	// e.detail is number
	console.log("tick", e.detail);
});

clock.addEventListener(
	"stopped",
	() => {
		console.log("clock stopped");
	},
	{ once: true },
);

clock.start();
setTimeout(() => clock.stop(), 2500);
