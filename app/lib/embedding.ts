import { OpenAI } from "openai";
import { VoyageAIClient } from "voyageai";

type GetEmbeddings = (
  model: string,
  texts: string[],
  apiKey: string
) => Promise<number[][]>;

const getEmbeddingsByOpenAI: GetEmbeddings = async (
  model: string,
  texts: string[],
  apiKey: string
) => {
  const client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
  const response = await client.embeddings.create({
    model,
    input: texts,
  });
  return response.data.map((embedding) => embedding.embedding);
};

export const getEmbeddingsByVoyage: GetEmbeddings = async (
  model: string,
  texts: string[],
  apiKey: string
) => {
  const client = new VoyageAIClient({ apiKey });
  const response = await client.embed({
    model,
    input: texts,
  });
  if (
    !response.data ||
    response.data.find((embedding) => !embedding.embedding)
  ) {
    throw new Error("No data returned from VoyageAI API");
  }
  return response.data.map((embedding) => embedding.embedding as number[]);
};

export const getEmbeddings = async (
  provider: string,
  model: string,
  texts: string[],
  apiKey: string
) => {
  switch (provider) {
    case "openai":
      return getEmbeddingsByOpenAI(model, texts, apiKey);
    case "voyage":
      return getEmbeddingsByVoyage(model, texts, apiKey);
    default:
      throw new Error("Invalid provider");
  }
};
