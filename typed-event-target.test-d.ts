import { expectDeprecated, expectType } from "tsd";
import { TypedEventTarget } from "./index";

interface EventMap {
	emptyEvent: never;
	numberEvent: number;
}

const eventTarget = new TypedEventTarget<EventMap>();

// ----- event in callback of addEventListener works with all types of events

eventTarget.addEventListener("emptyEvent", (e) => {
	expectType<Event>(e);
});

eventTarget.addEventListener("numberEvent", (e) => {
	expectType<CustomEvent<number>>(e);
});

eventTarget.addEventListener("numberEvent", (e) => {
	// @ts-expect-error | This should error because string is not the correct type (should be number)
	expectType<CustomEvent<string>>(e);
});

// ----- Event in callback of removeEventListener works with all types of events

eventTarget.removeEventListener("emptyEvent", (e) => {
	expectType<Event>(e);
});

eventTarget.removeEventListener("numberEvent", (e) => {
	expectType<CustomEvent<number>>(e);
});

// ----- Unknown event types should error

// @ts-expect-error | This should error because 'unknown' is not included in the EventMap
eventTarget.addEventListener("unknown", () => {});

// @ts-expect-error | This should error because 'unknown' is not included in the EventMap
eventTarget.removeEventListener("unknown", () => {});

// ----- dispatchEvent is deprecated

expectDeprecated(eventTarget.dispatchEvent);

// ----- dispatchTypedEvent only accepts correct types

expectType<(_type: "emptyEvent", e: CustomEventInit<never>) => boolean>(
	eventTarget.dispatchTypedEvent<"emptyEvent">,
);

expectType<(_type: "numberEvent", e: CustomEventInit<number>) => boolean>(
	eventTarget.dispatchTypedEvent<"numberEvent">,
);

// @ts-expect-error | This should error because the event types don't match
eventTarget.dispatchTypedEvent("my", new MyEvent2("my2"));

// @ts-expect-error | This should error because 'unknown' is not included in the EventMap
eventTarget.dispatchTypedEvent("unknown", new Event("unknown"));
