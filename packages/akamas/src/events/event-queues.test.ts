import { expect } from '@std/expect';
import { describe, it } from '@std/testing/bdd';
import type { Class } from '../components/mod.ts';
import { World } from '../world/mod.ts';
import { EventReader, EventWriter } from './event-queues.ts';

describe('Event Queues', () => {
  async function setupQueue<T extends Class, I extends InstanceType<T>>(
    queueType: T,
  ) {
    const world = new World();
    const queue: I[] = [];
    return [
      new EventReader<I>(queueType as any, queue),
      new EventWriter<I>(queueType as any, queue),
      world,
    ] as const;
  }

  class A {
    value: number;
    constructor(val = 3) {
      this.value = val;
    }
  }

  it('EventReader.type and EventWriter.type point to the class', async () => {
    const [reader, writer] = await setupQueue(A);
    expect(reader.type).toBe(A);
    expect(writer.type).toBe(A);
  });

  it('EventWriter.clearImmediate() clears events immediately', async () => {
    class MyEvent {}
    const [reader, writer] = await setupQueue(MyEvent);
    expect(reader.length).toBe(0);
    expect(writer.length).toBe(0);

    writer.create(new MyEvent());
    writer.create(new MyEvent());
    expect(reader.length).toBe(2);
    expect(writer.length).toBe(2);
  });

  it('EventWriter.create() creates an event from the passed instance', async () => {
    const [reader, writer] = await setupQueue(A);
    expect(reader.length).toBe(0);
    expect(writer.length).toBe(0);

    writer.create(new A(16));
    expect(reader.length).toBe(1);
    expect(writer.length).toBe(1);

    let iterations = 0;
    for (const readInstance of reader) {
      expect(readInstance).toBeInstanceOf(A);
      expect(readInstance.value).toBe(16);
      iterations++;
    }
    expect(iterations).toBe(1);
  });
});
