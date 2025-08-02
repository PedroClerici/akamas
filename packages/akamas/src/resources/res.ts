import type { Class } from '../components/mod.ts';
import type { World } from '../world/mod.ts';

/**
 * The type for a **Resource**.
 * Resources are world-unique objects that exist for the lifetime of a world.
 */
export type Res<T extends object> = T;

export const Res = {
  async intoArgument(world: World, resource: Class): Promise<object> {
    return world.getResource(resource);
  },
};
