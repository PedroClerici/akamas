type PipeFunction<I, O> = (value: I) => O;

export function pipe<I, O>(...fns: PipeFunction<I, O>[]): PipeFunction<I, O> {
  return (value) =>
    fns.reduce((acc, fn) => {
      if (Array.isArray(acc)) {
        return acc.map(fn) as any;
      }
      return fn(acc);
    }, value) as any;
}
