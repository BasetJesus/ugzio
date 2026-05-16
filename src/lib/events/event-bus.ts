import { EventEmitter } from "events"
import { appendEvent } from "./event-store"
import { EventType, LEGACY_EVENT_MAP } from "./taxonomy"
import type { EventType as CanonicalEvent, EventPayloadMap } from "./taxonomy"
import { validateBusEvent } from "./validate"

const emitter = new EventEmitter()
emitter.setMaxListeners(100)

export function emit<T extends CanonicalEvent>(event: T, payload: EventPayloadMap[T]): void {
  validateBusEvent(event, payload)
  appendEvent(event, payload)
  emitter.emit(event, payload)
}

export function emitLegacy(legacyName: string, payload: unknown): void {
  const canonical = LEGACY_EVENT_MAP[legacyName]
  if (canonical) {
    emit(canonical, payload as never)
  }
}

export function on<T extends CanonicalEvent>(
  event: T,
  handler: (payload: EventPayloadMap[T]) => void,
): () => void {
  emitter.on(event, handler as (...args: unknown[]) => void)
  return () => {
    emitter.off(event, handler as (...args: unknown[]) => void)
  }
}

export function once<T extends CanonicalEvent>(
  event: T,
  handler: (payload: EventPayloadMap[T]) => void,
): void {
  emitter.once(event, handler as (...args: unknown[]) => void)
}

export function removeAllListeners(event?: CanonicalEvent): void {
  if (event) {
    emitter.removeAllListeners(event)
  } else {
    emitter.removeAllListeners()
  }
}

export function listenerCount(event: CanonicalEvent): number {
  return emitter.listenerCount(event)
}
