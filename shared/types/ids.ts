export type Brand<K, T> = K & { __brand: T };

export type WorldId = Brand<string, "WorldId">;
export type PlayerId = Brand<string, "PlayerId">;
export type EntityId = Brand<string, "EntityId">;

