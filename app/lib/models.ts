export const providers = ["openai", "voyage"] as const;

export type Provider = (typeof providers)[number];

type Model = {
  name: string;
  dimensions: number;
  contextLength: number;
  description: string;
};

export const modelsByProvider: Record<Provider, Model[]> = {
  openai: [
    {
      name: "text-embedding-3-small",
      dimensions: 1536,
      contextLength: 8191,
      description:
        "High efficiency model with 62,500 pages per dollar. 62.3% performance on MTEB evaluation.",
    },
    {
      name: "text-embedding-3-large",
      dimensions: 3072,
      contextLength: 8191,
      description:
        "High performance model with 9,615 pages per dollar. 64.6% performance on MTEB evaluation.",
    },
    {
      name: "text-embedding-ada-002",
      dimensions: 1536,
      contextLength: 8191,
      description:
        "Balanced model with 12,500 pages per dollar. 61.0% performance on MTEB evaluation.",
    },
  ],
  voyage: [
    {
      name: "voyage-3",
      dimensions: 1024,
      contextLength: 32000,
      description:
        "Optimized for general-purpose and multilingual retrieval quality. See blog post for details.",
    },
    {
      name: "voyage-3-lite",
      dimensions: 512,
      contextLength: 32000,
      description: "Optimized for latency and cost. See blog post for details.",
    },
    {
      name: "voyage-finance-2",
      dimensions: 1024,
      contextLength: 32000,
      description:
        "Optimized for finance retrieval and RAG. See blog post for details.",
    },
    {
      name: "voyage-multilingual-2",
      dimensions: 1024,
      contextLength: 32000,
      description:
        "Optimized for multilingual retrieval and RAG. See blog post for details.",
    },
    {
      name: "voyage-law-2",
      dimensions: 1024,
      contextLength: 16000,
      description:
        "Optimized for legal and long-context retrieval and RAG. Also improved performance across all domains. See blog post for details.",
    },
    {
      name: "voyage-code-2",
      dimensions: 1536,
      contextLength: 16000,
      description:
        "Optimized for code retrieval (17% better than alternatives). See blog post for details.",
    },
  ],
} as const;
