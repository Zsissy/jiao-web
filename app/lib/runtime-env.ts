import { AsyncLocalStorage } from "node:async_hooks";

export type RuntimeEnv = {
  DB?: D1Database;
  MEDIA?: R2Bucket;
};

const STORE_KEY = Symbol.for("jiao.runtimeEnv.als");

function als() {
  const globalStore = globalThis as unknown as Record<symbol, AsyncLocalStorage<RuntimeEnv>>;
  return (globalStore[STORE_KEY] ??= new AsyncLocalStorage<RuntimeEnv>());
}

export function runWithRuntimeEnv<T>(env: RuntimeEnv, fn: () => T | Promise<T>) {
  return als().run(env, fn);
}

export function getRuntimeEnv() {
  return als().getStore();
}
