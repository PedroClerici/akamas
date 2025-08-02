import { expect } from '@std/expect';
import { describe, it } from '@std/testing/bdd';
import { Maybe } from './modifiers.ts';

describe('Modifiers', () => {
  class MyComponent {}

  describe('Maybe', () => {
    it('intoArgument() returns a maybe descriptor', () => {
      expect(Maybe.intoArgument({} as any, MyComponent)).toStrictEqual({
        modifier: 'maybe',
        type: MyComponent,
      });
    });

    it('isMaybe() returns true if a value is a maybe descriptor', () => {
      const maybeComp = Maybe.intoArgument({} as any, MyComponent);
      expect(Maybe.isMaybe(maybeComp)).toBe(true);
      expect(Maybe.isMaybe(MyComponent)).toBe(false);
    });
  });
});
