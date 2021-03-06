export function checkExists<T>(obj: T | undefined): T {
  if (obj == null) {
    throw new Error('Expected property to be defined, but found undefined');
  }
  return obj;
}

export function checkState(condition: boolean): asserts condition {
  if (!condition) {
    throw new Error('Expected condition to be true, but was false');
  }
}
