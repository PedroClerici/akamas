import type { Class } from '../components/mod.ts';
import type { World } from '../world/mod.ts';

import { Events } from './events.ts';

/**
 * A class that holds a queue of events and can be used to read those events.
 */
export class EventReader<T extends object> {
  static async intoArgument(
    world: World,
    eventType: Class,
  ): Promise<EventReader<any>> {
    return (await world.getResource(Events)).getReader(eventType);
  }

  public readonly type: Class;
  private queue: T[];

  constructor(type: { new (...args: any[]): T }, queue: T[]) {
    this.type = type;
    this.queue = queue;
  }

  /**
   * The number of events currently in this queue.
   */
  get length(): number {
    return this.queue.length;
  }

  [Symbol.iterator](): IterableIterator<Readonly<T>> {
    return this.queue[Symbol.iterator]();
  }
}

/**
 * A class that holds a queue of events and can be used to read or write those events.
 */
export class EventWriter<T extends object> extends EventReader<T> {
  static override async intoArgument(
    world: World,
    eventType: Class,
  ): Promise<EventWriter<any>> {
    return (await world.getResource(Events)).getWriter(eventType);
  }
  #queue: T[];

  constructor(type: { new (...args: any[]): T }, queue: T[]) {
    super(type, queue);
    this.#queue = queue;
  }

  /**
   * Adds the provided event to the queue.
   * @param instance The event to add to the event queue.
   * @returns `this`, for chaining.
   */
  create(instance: T): this {
    this.#queue.push(instance);
    return this;
  }

  /**
   * Immediately clears all events in this queue.
   */
  clear(): void {
    this.#queue.length = 0;
  }
}
