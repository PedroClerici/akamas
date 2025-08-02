import type { World } from '../world/mod.ts';
import type { Entities } from './entities.ts';

export function applyEntityUpdates(entities: Entities) {
  entities.update();
}

applyEntityUpdates.getSystemArguments = (world: World) => [world.entities];
