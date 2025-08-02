import type { Entity } from '../entities/mod.ts';

import { swapRemove } from '../utils/swap-remove.ts';
import type { Class } from './class.ts';
import { isSizedComponent } from './tag.ts';

/**
 * Contains component data for entities with the same archetype.
 * Entities are rows, component types are columns.
 */
export class Table {
  static createEmpty(): Table {
    return new Table([], 0n, 0);
  }

  id: number;
  archetype: bigint;
  private components: Class[];
  private columns: [...Array<object[]>];

  constructor(components: Class[], archetype: bigint, id: number) {
    this.components = components.filter(isSizedComponent);
    this.archetype = archetype;
    this.id = id;
    this.columns = this.components.map(() => []) as any;
  }

  /**
   * The number of entities in this table.
   */
  get length(): number {
    return this.columns[0].length;
  }

  /**
   * Moves the entity at `row` and all its associated data into `targetTable`.
   * @param row The row of the entity to move.
   * @param targetTable The table to move that entity to.
   */
  move(
    row: number,
    targetTable: Table,
    components: object[],
  ): Entity | undefined {
    for (let i = 0; i < this.columns.length; i++) {
      const componentType = this.components[i];
      const element = swapRemove(this.columns[i], row)!;
      if (targetTable.hasColumn(componentType)) {
        targetTable.getColumn(componentType).push(element);
      }
    }

    for (const component of components) {
      if (targetTable.hasColumn(component.constructor as any)) {
        targetTable.getColumn(component.constructor as any)?.push(component);
      }
    }

    return this.columns[0]?.[this.columns[0].length - 1] as Entity | undefined;
  }

  /**
   * Returns a boolean indicating if this table contains a column for the provided component type.
   *
   * Tables do not create columns for ZSTs so will always return false when called with `Tag` components.
   * @param componentType The type of the component to check for.
   * @returns A boolean, true if this table has a column for the provided component type.
   */
  hasColumn(componentType: Class): boolean {
    return this.components.includes(componentType);
  }
  /**
   * Gets the column for the provided component.
   *
   * Assumes the column exists - check for presence with `hasColumn()` first.
   * @param componentType The type of the component to fetch the column for.
   * @returns The column (`object[]`) for the provided component type.
   */
  getColumn<T extends Class>(componentType: T): InstanceType<T>[] {
    return this.columns[
      this.components.indexOf(componentType)
    ] as InstanceType<T>[];
  }
}
