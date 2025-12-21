# @mvd/event-target

Type-safe `EventTarget` for TypeScript: strongly-typed event names and strongly-typed `CustomEvent.detail`.

This package exports a single class, `TypedEventTarget<M>`, which behaves like the DOM `EventTarget`, but:

- `addEventListener` / `removeEventListener` only accept event names from your map
- listeners receive a correctly typed `CustomEvent<Detail>`
- `dispatchEvent` is **deprecated** (untyped); use `dispatchTypedEvent(type, init?)` instead

## Install

```sh
npm i @mvd/event-target
```

Notes:

- ESM package (`"type": "module"`).
- `typescript` is a peer dependency (v5+).

## Quick start (standalone instance)

Define an **event map** where each key is an event name and each value is the `detail` payload type.

- Use `never` for no detail.
- Use any type for payloads (primitives, objects, unions, etc.).

```ts
import { TypedEventTarget } from "@mvd/event-target";

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
bus.addEventListener("doesNotExist", () => {});

//  wrong detail type is a type error
// @ts-expect-error
bus.dispatchTypedEvent("message", { detail: 123 });
```

## Extending `TypedEventTarget` (recommended for components)

You can subclass `TypedEventTarget` to model things that emit events.

```ts
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
```

## Listener forms (function or `{ handleEvent() }`)

Like the DOM API, the `listener` can be a function or an object with a `handleEvent` method.

```ts
import { TypedEventTarget } from "@mvd/event-target";

interface Events {
  ping: { id: string };
}

const target = new TypedEventTarget<Events>();

const listenerObject = {
  handleEvent(e: CustomEvent<{ id: string }>) {
    console.log("ping", e.detail.id);
  },
};

target.addEventListener("ping", listenerObject);
target.dispatchTypedEvent("ping", { detail: { id: "abc" } });
target.removeEventListener("ping", listenerObject);
```

Listeners may also be `async` (return a `Promise<void>`):

```ts
import { TypedEventTarget } from "@mvd/event-target";

interface Events {
  saved: { path: string };
}

const t = new TypedEventTarget<Events>();

t.addEventListener("saved", async (e) => {
  await fetch("/log", {
    method: "POST",
    body: JSON.stringify({ path: e.detail.path }),
  });
});
```

## Dispatching options

`dispatchTypedEvent(type, init)` accepts a standard `CustomEventInit<Detail>`.

If an event’s payload type is `never`, then `init` is **optional**.

- `detail` (typed; **required** unless the payload is `never`)
- `bubbles`, `cancelable`, `composed`

```ts
import { TypedEventTarget } from "@mvd/event-target";

interface Events {
  changed: { field: string };
}

const t = new TypedEventTarget<Events>();

t.dispatchTypedEvent("changed", {
  detail: { field: "name" },
  bubbles: true,
  cancelable: true,
});

// For `never` payload events, you can omit init entirely:
interface OtherEvents {
  ready: never;
}

const other = new TypedEventTarget<OtherEvents>();
other.dispatchTypedEvent("ready");

// ...or still pass options (without `detail`):
other.dispatchTypedEvent("ready", { bubbles: true });
```

## Difference with [`typescript-event-target`](https://www.npmjs.com/package/typescript-event-target)

This is a fork of the `typescript-event-target` package with some differences:

- This package only supports `CustomEvent` (no plain `Event`).
- This package constructs CustomEvents internally. Thus, the event type does not
  have to be added twice.
