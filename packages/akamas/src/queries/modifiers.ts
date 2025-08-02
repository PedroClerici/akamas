import type { Class } from '../components/mod.ts';
import type { World } from '../world/mod.ts';

/**
 * A type that may or may not be present.
 */
export type Maybe<T> = T | undefined;
export const Maybe = {
  intoArgument(_: World, type: Class) {
    return { modifier: 'maybe', type };
  },
  isMaybe(value: any): value is { modifier: string; type: Class } {
    return typeof value === 'object' && value.modifier === 'maybe';
  },
};

export type AccessorDescriptor = Class | { modifier: string; type: Class };
export type Accessor = Maybe<object>;
