class AkamasCompilerError extends Error {}

export function assert(
  condition: unknown,
  errorMessage: string,
  errorType = AkamasCompilerError,
): asserts condition {
  if (!condition) {
    throw new errorType(errorMessage);
  }
}
