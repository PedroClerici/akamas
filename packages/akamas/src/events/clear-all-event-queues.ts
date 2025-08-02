import type { World } from '../world/mod.ts';

import { Events } from './events.ts';

export function clearAllEventQueues({ writers }: Events) {
  for (const writer of writers) {
    writer.clear();
  }
}
clearAllEventQueues.getSystemArguments = (world: World) => [
  world.getResource(Events),
];
