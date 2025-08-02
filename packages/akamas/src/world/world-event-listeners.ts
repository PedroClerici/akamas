import type { Table } from '../components/mod.ts';
import type { World } from './world.ts';

export type WorldEventListeners = {
  createTable: Array<(table: Table) => void>;
  start: Array<(world: World) => void>;
  stop: Array<(world: World) => void>;
};
