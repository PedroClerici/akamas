import type { Class } from '../components/mod.ts';
import { devAssert } from '../utils/dev.ts';
import type { World } from '../world/mod.ts';

/**
 * A type for data local (and unique) to a system.
 */
export type Local<T extends object> = T;
export const Local = {
  async intoArgument(world: World, resourceType: Class) {
    const result =
      'fromWorld' in resourceType
        ? await (resourceType as any).fromWorld(world)
        : new resourceType();

    devAssert(
      result !== undefined,
      'Resource.fromWorld must return an object.',
    );

    return result;
  },
};
