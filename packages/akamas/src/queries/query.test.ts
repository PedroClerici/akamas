import { expect } from '@std/expect';
import { describe, it } from '@std/testing/bdd';
import { type Class, Tag } from '../components/mod.ts';
import { Entity } from '../entities/mod.ts';
import { World } from '../world/mod.ts';
import { With, Without } from './filters.ts';
import { Maybe } from './modifiers.ts';
import { Query } from './query.ts';

describe('Query', () => {
  const createWorld = (...components: Class[]) => {
    const world = new World();
    for (const component of components) {
      world.getComponentId(component);
    }
    return world;
  };

  class ZST extends Tag {}
  class Vec3 {}
  type Entity = InstanceType<typeof Entity>;

  describe('filtering', () => {
    it('matches tables for basic filters', () => {
      const world = createWorld(ZST, Vec3);
      const catchAllQuery = Query.intoArgument(world, Entity);
      const withVec = Query.intoArgument(world, [Vec3]);

      expect(catchAllQuery.length).toBe(0);
      expect(withVec.length).toBe(0);

      world.spawn(); // 1
      world.spawn().addType(ZST); // 1
      world.spawn().add(new Vec3()); // 1, 2, 3
      world.spawn().add(new Vec3()).addType(ZST); // 1, 3
      world.entities.update();

      expect(catchAllQuery.length).toBe(4);
      expect(withVec.length).toBe(2);
    });

    it('matches tables for Maybe<T>', () => {
      const world = createWorld(ZST, Vec3);
      const catchAllQuery = Query.intoArgument(world, Entity);
      const maybeQuery = Query.intoArgument(
        world,
        Maybe.intoArgument(world, Vec3),
      );

      expect(catchAllQuery.length).toBe(0);
      expect(maybeQuery.length).toBe(0);

      world.spawn(); // 1
      world.spawn().addType(ZST); // 1
      world.spawn().add(new Vec3()); // 1, 2, 3
      world.spawn().add(new Vec3()).addType(ZST); // 1, 3
      world.entities.update();

      expect(catchAllQuery.length).toBe(4);
      expect(maybeQuery.length).toBe(4);
    });

    it('matches tables for With<T>', () => {
      const world = createWorld(ZST, Vec3);
      const withZST = Query.intoArgument(world, Entity, new With(world, [ZST]));
      const withVecAndZST = Query.intoArgument(
        world,
        Vec3,
        new With(world, [ZST]),
      );

      expect(withZST.length).toBe(0);
      expect(withVecAndZST.length).toBe(0);

      world.spawn(); // 1
      world.spawn().addType(ZST); // 1
      world.spawn().add(new Vec3()); // 1, 2, 3
      world.spawn().add(new Vec3()).addType(ZST); // 1, 3
      world.entities.update();

      expect(withZST.length).toBe(2);
      expect(withVecAndZST.length).toBe(1);
    });

    it('matches tables for Without<T>', () => {
      const world = createWorld(ZST, Vec3);
      const withoutZST = Query.intoArgument(
        world,
        Entity,
        new Without(world, [ZST]),
      );
      const withVecWithoutZST = Query.intoArgument(
        world,
        Vec3,
        new Without(world, [ZST]),
      );

      expect(withoutZST.length).toBe(0);
      expect(withVecWithoutZST.length).toBe(0);

      world.spawn(); // 1
      world.spawn().addType(ZST); // 1
      world.spawn().add(new Vec3()); // 1, 2, 3
      world.spawn().add(new Vec3()).addType(ZST); // 1, 3
      world.entities.update();

      expect(withoutZST.length).toBe(2);
      expect(withVecWithoutZST.length).toBe(1);
    });
  });

  describe('*[Symbol.iterator]', () => {
    it('yields normal elements for all table members', () => {
      const world = createWorld(Vec3, ZST);
      const query = new Query<[Vec3, Entity]>(world, [0n, 0n], false, [
        Vec3,
        Entity,
      ]);
      expect(query.length).toBe(0);

      for (let i = 0; i < 5; i++) {
        world.spawn().add(new Vec3());
      }
      for (let i = 0; i < 5; i++) {
        world.spawn().add(new Vec3()).addType(ZST);
      }
      world.entities.update();

      expect(query.length).toBe(10);
      let j = 0;
      for (const [vec, ent] of query) {
        expect(vec).toBeInstanceOf(Vec3);
        expect(ent).toBeInstanceOf(Entity);
        expect(ent.id).toBe(j);
        j++;
      }
      expect(j).toBe(10);
    });

    it('yields individual elements for non-tuple iterators', () => {
      const world = createWorld(Vec3);
      const query = new Query<Vec3>(world, [0n, 0n], true, [Vec3]);

      expect(query.length).toBe(0);
      for (let i = 0; i < 10; i++) {
        world.spawn().add(new Vec3());
      }
      world.entities.update();

      expect(query.length).toBe(10);
      let j = 0;
      for (const vec of query) {
        expect(vec).toBeInstanceOf(Vec3);
        j++;
      }
      expect(j).toBe(10);
    });

    it('yields undefined for Maybe values', () => {
      const world = createWorld(Vec3);
      const query: Query<Vec3 | undefined> = Query.intoArgument(
        world,
        Maybe.intoArgument(world, Vec3),
      );

      expect(query.length).toBe(0);
      for (let i = 0; i < 5; i++) {
        world.spawn();
      }
      for (let i = 0; i < 5; i++) {
        world.spawn().add(new Vec3());
      }
      world.entities.update();

      expect(query.length).toBe(10);
      let undef = 0;
      let def = 0;
      for (const vec of query) {
        if (vec) {
          def++;
          expect(vec).toBeInstanceOf(Vec3);
        } else {
          undef++;
          expect(vec).toBeUndefined();
        }
      }
      expect(undef).toBe(5);
      expect(def).toBe(5);
    });
  });
});
