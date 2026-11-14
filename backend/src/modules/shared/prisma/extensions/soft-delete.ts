import { Prisma, type PrismaClient } from '@prisma/client';

/**
 * Prisma model names that have `deletedAt`.
 * Add a model here in the same change that adds its `deletedAt` column.
 */
export const SOFT_DELETE_MODELS: ReadonlySet<string> = new Set(['User']);

const SOFT_DELETE_FILTER = { deletedAt: null };

function appendSoftDeleteWhere(where: unknown): Record<string, unknown> {
  const existing =
    typeof where === 'object' && where !== null ? (where as Record<string, unknown>) : {};
  const andValue = existing.AND;
  const existingAnd: unknown[] = Array.isArray(andValue)
    ? andValue
    : andValue === undefined
      ? []
      : [andValue];
  return {
    ...existing,
    AND: [...existingAnd, SOFT_DELETE_FILTER],
  };
}

function withFilter(model: string, where: unknown): unknown {
  if (!SOFT_DELETE_MODELS.has(model)) {
    return where;
  }
  return appendSoftDeleteWhere(where);
}

/**
 * Adds `deletedAt: null` to reads on soft-deletable models.
 * Nested relations and writes are not covered. Those queries must filter `deletedAt` themselves.
 */
export const softDeleteExtension = Prisma.defineExtension({
  name: 'softDelete',
  query: {
    $allModels: {
      findFirst({ args, query, model }) {
        args.where = withFilter(model, args.where) as typeof args.where;
        return query(args);
      },
      findFirstOrThrow({ args, query, model }) {
        args.where = withFilter(model, args.where) as typeof args.where;
        return query(args);
      },
      findUnique({ args, query, model }) {
        args.where = withFilter(model, args.where) as typeof args.where;
        return query(args);
      },
      findUniqueOrThrow({ args, query, model }) {
        args.where = withFilter(model, args.where) as typeof args.where;
        return query(args);
      },
      findMany({ args, query, model }) {
        args.where = withFilter(model, args.where) as typeof args.where;
        return query(args);
      },
      count({ args, query, model }) {
        args.where = withFilter(model, args.where) as typeof args.where;
        return query(args);
      },
      groupBy({ args, query, model }) {
        args.where = withFilter(model, args.where) as typeof args.where;
        return query(args);
      },
      aggregate({ args, query, model }) {
        args.where = withFilter(model, args.where) as typeof args.where;
        return query(args);
      },
    },
  },
});

export function createSoftDeleteClient(client: PrismaClient) {
  return client.$extends(softDeleteExtension);
}
