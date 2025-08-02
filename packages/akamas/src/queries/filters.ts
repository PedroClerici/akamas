import type { Class } from '../components/mod.ts';
import { devAssert } from '../utils/dev.ts';
import type { World } from '../world/mod.ts';

/**
 * The base class for a condition (or conditions) that entities must satisfy in
 * order to match a query.
 */
export class Filter<T extends object[] = object[]> {
  static intoArgument<T extends object[]>(
    world: World,
    ...children: T
  ): Filter<T> {
    return new Filter(world, children);
  }

  world: World;
  children: T;

  constructor(world: World, children: T) {
    this.world = world;
    this.children = children;
  }

  execute(current: bigint[]): bigint[] {
    return current;
  }
}
/**
 * A predicate that ensures only entities **with** the specified components will match a query.
 */
export class With<
  A extends object,
  B extends object = object,
  C extends object = object,
  D extends object = object,
> extends Filter<Class[]> {
  private _: [A, B, C, D] = true as any;

  override execute(current: bigint[]): bigint[] {
    return current.map((val, i) =>
      i % 2 === 0 ? val | this.world.getArchetype(...this.children) : val,
    );
  }
}

/**
 * A predicate that ensures only entities **without** the specified components will match a query.
 */
export class Without<
  A extends object,
  B extends object = object,
  C extends object = object,
  D extends object = object,
> extends Filter<Class[]> {
  private _: [A, B, C, D] = true as any;

  override execute(current: bigint[]): bigint[] {
    return current.map((val, i) =>
      i % 2 === 1
        ? val | (this.world.getArchetype(...this.children) ^ 1n)
        : val,
    );
  }
}

/**
 * A connective that ensures that **all** of the provided conditions must be met for a query to match.
 */
export class And<
  A extends Filter,
  B extends Filter,
  C extends Filter = any,
  D extends Filter = any,
> extends Filter<Filter[]> {
  private _: [A, B, C, D] = true as any;

  override execute(current: bigint[]): bigint[] {
    return this.children.reduce((acc, filter) => filter.execute(acc), current);
  }
}

/**
 * A connective that ensures that **at least one** of the provided conditions must be met for a query to match.
 */
export class Or<
  A extends Filter,
  B extends Filter,
  C extends Filter = any,
  D extends Filter = any,
> extends Filter<Filter[]> {
  private _: [A, B, C, D] = true as any;

  override execute(current: bigint[]): bigint[] {
    return this.children.flatMap((filter) => filter.execute(current));
  }
}

export function devAssertFilterValid(filters: bigint[]) {
  devAssert(
    filters.some((f, i) => i % 2 === 0 && (f & filters[i + 1]) === 0n),
    'Impossible query - cannot match any entities.',
  );
}
