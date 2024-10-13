import { z } from "zod";
import { providers } from "./models";

// Define form schema
export const formStateSchema = z
  .object({
    provider: z.enum(providers),
    model: z.string(),
    apiKeys: z.record(z.enum(providers), z.string()),
    leftText: z.string().min(1),
    rightText: z.string().min(1),
  })
  .refine(
    (data) => !!data.apiKeys[data.provider],
    (data) => ({
      message: "API key is required",
      path: ["apiKeys", data.provider],
    })
  );

export type FormState = z.infer<typeof formStateSchema>;

export const getStateFromHistory = (history: EmbeddingHistory): FormState => {
  return {
    ...history,
  };
};

export type EmbeddingHistory = FormState & { id: number; createdAt: Date };

const defaultState = {
  provider: "openai",
  model: "text-embedding-3-small",
  apiKeys: {},
  leftText: "",
  rightText: "",
};

const stateKey = "state";

export const loadState = () => {
  const state = localStorage.getItem(stateKey);
  if (state && formStateSchema.safeParse(JSON.parse(state)).success) {
    return JSON.parse(state);
  }
  return defaultState;
};

export const saveState = (state: FormState) => {
  localStorage.setItem(stateKey, JSON.stringify(state));
};

export const clearState = () => {
  localStorage.removeItem(stateKey);
};

export const saveHistory = async (history: FormState) => {
  const db = await openDB("embedding-playground", 1, (db) => {
    db.createObjectStore("histories", { autoIncrement: true });
  });
  const tx = db.transaction("histories", "readwrite");
  const store = tx.objectStore("histories");
  store.add(history);
};

export const loadHistories = async (): Promise<EmbeddingHistory[]> => {
  const db = await openDB("embedding-playground", 1);
  const tx = db.transaction("histories", "readonly");
  const store = tx.objectStore("histories");
  return (await store.getAll()) as unknown as EmbeddingHistory[];
};

export const removeHistory = async (id: number) => {
  const db = await openDB("embedding-playground", 1);
  const tx = db.transaction("histories", "readwrite");
  const store = tx.objectStore("histories");
  store.delete(id);
};

// IndexedDBを開くためのヘルパー関数
const openDB = (
  name: string,
  version: number,
  upgradeCallback?: (db: IDBDatabase) => void
) => {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(name, version);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    if (upgradeCallback) {
      request.onupgradeneeded = (event) => upgradeCallback(request.result);
    }
  });
};
