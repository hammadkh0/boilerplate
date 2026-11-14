/** True for plain objects. Arrays, dates, and null are not objects here. */
export function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

/** Deep-clones dates, arrays, maps, sets, and plain objects. */
export function cloneDeep<T>(value: T): T {
  if (value === null || value === undefined || typeof value !== 'object') {
    return value;
  }

  if (value instanceof Date) {
    return new Date(value.getTime()) as T;
  }

  if (value instanceof RegExp) {
    return new RegExp(value.source, value.flags) as T;
  }

  if (Array.isArray(value)) {
    return value.map((item: unknown) => cloneDeep(item)) as T;
  }

  if (value instanceof Set) {
    const cloned = new Set<unknown>();
    value.forEach((entry) => cloned.add(cloneDeep(entry)));
    return cloned as T;
  }

  if (value instanceof Map) {
    const cloned = new Map<unknown, unknown>();
    value.forEach((entry, key) => cloned.set(cloneDeep(key), cloneDeep(entry)));
    return cloned as T;
  }

  if (isObject(value)) {
    const cloned: Record<string, unknown> = {};
    for (const key of Object.keys(value)) {
      cloned[key] = cloneDeep(value[key]);
    }
    return cloned as T;
  }

  return value;
}

/**
 * Writes `value` onto `target[key]` when `value` is not `undefined`.
 * `null` is written, so a caller can clear a field on purpose.
 */
export function assign<T extends Record<string, unknown>, K extends keyof T>(
  target: T,
  key: K,
  value: T[K] | undefined,
): T {
  if (value !== undefined) {
    target[key] = value;
  }
  return target;
}

/**
 * Drops keys whose value is `null`.
 * MongoDB only. Postgres PATCH payloads must use `buildPatchData`, which keeps `null`.
 */
export function omitNullFields<T extends Record<string, unknown>>(data: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => value !== null),
  ) as Partial<T>;
}

/** Deep-clones `existing`, then copies keys from `incoming` over the clone. */
export function mergeObjectMaps<T extends Record<string, unknown>>(
  existing: T,
  incoming: Partial<T>,
): T {
  return { ...cloneDeep(existing), ...incoming };
}
