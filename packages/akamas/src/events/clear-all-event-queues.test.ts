import { expect } from '@std/expect';
import { describe, it } from '@std/testing/bdd';
import { World } from '../world/mod.ts';
import { clearAllEventQueues } from './clear-all-event-queues.ts';
import { Events } from './events.ts';

describe('Clear All Event Queues', () => {
  class LevelUpEvent {}
  class LevelDownEvent {}

  it('clears event queues', async () => {
    const world = new World();

    const events = await world.getResource(Events);
    const upWriter = events.getWriter(LevelUpEvent);
    const downWriter = events.getWriter(LevelDownEvent);

    expect(upWriter.length).toBe(0);
    expect(downWriter.length).toBe(0);

    upWriter.create(new LevelUpEvent());
    downWriter.create(new LevelDownEvent());
    downWriter.create(new LevelDownEvent());
    expect(upWriter.length).toBe(1);
    expect(downWriter.length).toBe(2);

    clearAllEventQueues(events);
    expect(upWriter.length).toBe(0);
    expect(downWriter.length).toBe(0);
  });
});
