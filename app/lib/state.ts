import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
} from "firebase/firestore";
import { z } from "zod";
import { getStore } from "./firebase";
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
    apiKeys: loadState().apiKeys,
  };
};

export type EmbeddingHistory = Omit<FormState, "apiKeys"> & {
  id: number;
  createdAt: Date;
};

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

export const saveHistory = async (formState: FormState) => {
  const { apiKeys, ...rest } = formState;
  try {
    await addDoc(collection(getStore(), "histories"), {
      ...rest,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("An error occurred while saving a history:", error);
  }
};

export const fetchHistories = async (): Promise<EmbeddingHistory[]> => {
  try {
    const querySnapshot = await getDocs(collection(getStore(), "histories"));
    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as unknown as EmbeddingHistory[];
  } catch (error) {
    console.error("An error occurred while loading histories:", error);
    return [];
  }
};

export const removeHistory = async (id: string) => {
  try {
    await deleteDoc(doc(getStore(), "histories", id));
  } catch (error) {
    console.error("An error occurred while deleting a history:", error);
  }
};
