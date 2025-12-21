/**
 * A function that can be passed to the `listener` parameter of {@link TypedEventTarget.addEventListener}
 * and {@link TypedEventTarget.removeEventListener}.
 *
 * @template M A map of event names to their respective `CustomEvent.detail` payload types.
 * @template T The event name to listen for (must be a key of `M`).
 */
export type TypedEventListener<M extends Record<string, any>, T extends keyof M> = (
	evt: CustomEvent<M[T]>,
) => void | Promise<void>;

/**
 * An object that can be passed to the `listener` parameter of {@link TypedEventTarget.addEventListener}
 * and {@link TypedEventTarget.removeEventListener}.
 *
 * @template M A map of event names to their respective `CustomEvent.detail` payload types.
 * @template T The event name to listen for (must be a key of `M`).
 */
export interface TypedEventListenerObject<M extends Record<string, any>, T extends keyof M> {
	handleEvent: (evt: CustomEvent<M[T]>) => void | Promise<void>;
}

/**
 * Type of parameter `listener` in {@link TypedEventTarget.addEventListener} and
 * {@link TypedEventTarget.removeEventListener}.
 */
export type TypedEventListenerOrEventListenerObject<
	M extends Record<string, any>,
	T extends keyof M,
> = TypedEventListener<M, T> | TypedEventListenerObject<M, T>;

/**
 * TypeScript-friendly version of {@link EventTarget}.
 *
 * @template M A map of event names to their respective `CustomEvent.detail` payload types.
 */
export interface TypedEventTarget<M extends Record<string, any>> {
	addEventListener: <T extends keyof M & string>(
		type: T,
		listener: TypedEventListenerOrEventListenerObject<M, T> | null,
		options?: boolean | AddEventListenerOptions,
	) => void;

	removeEventListener: <T extends keyof M & string>(
		type: T,
		callback: TypedEventListenerOrEventListenerObject<M, T> | null,
		options?: EventListenerOptions | boolean,
	) => void;

	/**
	 * Dispatches a synthetic event to the target.
	 * @deprecated To ensure type safety use `dispatchTypedEvent` instead.
	 */
	dispatchEvent: (event: Event) => boolean;
}

export declare class TypedEventTarget<M extends Record<string, any>> extends EventTarget {
	/**
	 * Dispatches a typed {@link CustomEvent} and returns true if either the event is not cancelable
	 * or `preventDefault()` was not invoked; otherwise returns false.
	 */
	dispatchTypedEvent<T extends keyof M>(type: T, init: CustomEventInit<M[T]>): boolean;
}
