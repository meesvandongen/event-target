# @mvd/event-target

Type-safe `EventTarget` for TypeScript: strongly-typed event names and strongly-typed `CustomEvent.detail`.

This package exports a single class, `TypedEventTarget<M>`, which behaves like the DOM `EventTarget`, but:

- `addEventListener` / `removeEventListener` only accept event names from your map
- listeners receive a correctly typed `CustomEvent<Detail>`
- `dispatchEvent` is **deprecated** (untyped); use `dispatchTypedEvent(type, init)` instead

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
bus.dispatchTypedEvent("ready", {});
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
    this.dispatchTypedEvent("stopped", {});
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

`dispatchTypedEvent(type, init)` accepts a standard `CustomEventInit<Detail>`:

- `detail` (typed)
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
```

## API summary

```ts
class TypedEventTarget<M> extends EventTarget {
  addEventListener<T extends keyof M & string>(
    type: T,
    listener:
      | ((evt: CustomEvent<M[T]>) => void | Promise<void>)
      | { handleEvent: (evt: CustomEvent<M[T]>) => void | Promise<void> }
      | null,
    options?: boolean | AddEventListenerOptions,
  ): void;

  removeEventListener<T extends keyof M & string>(
    type: T,
    listener:
      | ((evt: CustomEvent<M[T]>) => void | Promise<void>)
      | { handleEvent: (evt: CustomEvent<M[T]>) => void | Promise<void> }
      | null,
    options?: boolean | EventListenerOptions,
  ): void;

  /** @deprecated */
  dispatchEvent(event: Event): boolean;

  dispatchTypedEvent<T extends keyof M>(
    type: T,
    init: CustomEventInit<M[T]>,
  ): boolean;
}
```

## Why not just use `EventTarget`?

The DOM `EventTarget` API is runtime-great but type-light:

- event names are just `string`
- listeners typically see `Event` and you end up casting to `CustomEvent<T>`

With `TypedEventTarget`, those casts move into the library so your app code stays clean and safe.
