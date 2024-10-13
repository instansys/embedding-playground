import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { getEmbeddings } from "@/lib/embedding";
import { Provider, modelsByProvider } from "@/lib/models";
import {
  EmbeddingHistory,
  FormState,
  formStateSchema,
  loadHistories,
  loadState,
  saveState,
} from "@/lib/state";
import { zodResolver } from "@hookform/resolvers/zod";
import { useLocalStorageState } from "ahooks";
import { ChevronDown, ChevronUp, Eye, EyeOff } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";

import { DialogHeader } from "@/components/ui/dialog";
import { SideMenu } from "@/components/ui/sidemenu";
import { VectorsPreviewDialog } from "@/components/VectorsPreviewDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@radix-ui/react-dialog";
import type { MetaFunction } from "@remix-run/node";
import * as _ from "lodash";

export const meta: MetaFunction = () => {
  return [
    { title: "Embedding Playground" },
    {
      name: "description",
      content: "Check the similarity between two texts using embeddings",
    },
  ];
};
// Mock function for cosine similarity calculation
const cosineSimilarity = (vec1: number[], vec2: number[]) => {
  const dotProduct = vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
  const magnitude1 = Math.sqrt(vec1.reduce((sum, val) => sum + val * val, 0));
  const magnitude2 = Math.sqrt(vec2.reduce((sum, val) => sum + val * val, 0));
  return dotProduct / (magnitude1 * magnitude2);
};

const SimilarityGauge = ({ similarity }: { similarity: number | null }) => {
  const percentage = similarity !== null ? similarity * 100 : 0;
  const color =
    similarity !== null
      ? `hsl(${similarity * 120}, 100%, 50%)`
      : "hsl(0, 0%, 80%)";

  return (
    <div className="relative w-full h-8 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="absolute top-0 left-0 h-full transition-all duration-500 ease-out"
        style={{ width: `${percentage}%`, backgroundColor: color }}
      />
      <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center text-sm font-bold text-gray-800">
        {similarity !== null ? `${percentage.toFixed(2)}%` : "N/A"}
      </div>
    </div>
  );
};

export default function Index() {
  const [similarity, setSimilarity] = useState<number | null>(null);
  const [leftVector, setLeftVector] = useState<number[]>([]);
  const [rightVector, setRightVector] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { isValid, errors },
  } = useForm<FormState>({
    resolver: zodResolver(formStateSchema),
    defaultValues: loadState(),
  });

  const provider = watch("provider") as Provider;
  const model = watch("model") as string;

  const onSubmit = handleSubmit(async (data) => {
    saveState(data);
    setIsLoading(true);
    setError(null);
    try {
      const apiKey = data.apiKeys[data.provider];
      if (!apiKey) {
        throw new Error("API key is required");
      }
      const [embedding1, embedding2] = await getEmbeddings(
        data.provider,
        data.model,
        [data.leftText, data.rightText],
        apiKey
      );
      const similarityValue = cosineSimilarity(embedding1, embedding2);
      setSimilarity(similarityValue);
      setLeftVector(embedding1);
      setRightVector(embedding2);
    } catch (error) {
      console.error("Error calculating similarity:", error);
      setSimilarity(null);
      setError(
        "Error calculating similarity. Please check your API key and try again."
      );
    } finally {
      setIsLoading(false);
    }
  });

  const [histories, setHistories] = useState<EmbeddingHistory[]>([]);
  useEffect(() => {
    loadHistories().then(setHistories);
  }, []);
  // const saveHistory = useCallback(
  //   (history: FormState) => {
  //     setHistories([getHistoryFromState(history), ...histories]);
  //     saveState(history);
  //   },
  //   [histories]
  // );

  return (
    <>
      <SideMenu side="right">
        <ul>
          <li className="mb-2">Clear</li>
          {histories.map((history) => (
            <li key={history.id}>{history.leftText}</li>
          ))}
        </ul>
      </SideMenu>
      <div className="container flex items-center justify-center mx-auto">
        <div className="w-full max-w-6xl mx-auto p-16">
          <h1 className="text-3xl font-bold mb-4">Embedding Playground</h1>
          <p className="text-lg text-muted-foreground mb-8">
            Compare texts similarity using various embedding models
          </p>
          <form onSubmit={onSubmit} className="space-y-8">
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <Label htmlFor="provider" className="text-lg">
                  Provider
                </Label>
                <Controller
                  name="provider"
                  control={control}
                  render={({ field }) => (
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger id="provider" className="w-full">
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="voyage">Voyage AI</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.provider && (
                  <p className="text-sm text-red-500">
                    {errors.provider.message}
                  </p>
                )}
              </div>
              <div className="space-y-4">
                <Label htmlFor="apiKey" className="text-lg">
                  API Key
                </Label>
                <div className="relative">
                  <Controller
                    name={`apiKeys.${provider}`}
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id={`apiKey-${provider}`}
                        type={showApiKey ? "text" : "password"}
                        placeholder={`Enter your ${provider} API key`}
                        className="pr-10 w-full"
                      />
                    )}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full"
                    onClick={() => setShowApiKey(!showApiKey)}
                  >
                    {showApiKey ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {errors.apiKeys?.[provider] && (
                  <p className="text-sm text-red-500">
                    {errors.apiKeys?.[provider].message}
                  </p>
                )}
              </div>
            </div>
            <div className="space-y-4">
              <Label htmlFor="model" className="text-lg">
                Select a model
              </Label>
              <Table className="w-full border-collapse">
                <TableHeader>
                  <TableRow>
                    <TableHead>name</TableHead>
                    <TableHead>dimensions</TableHead>
                    <TableHead>contextLength</TableHead>
                    <TableHead>description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {modelsByProvider[provider as Provider].map((m) => (
                    <TableRow
                      key={m.name}
                      className={`${
                        m.name === model
                          ? "bg-black dark:bg-white text-primary"
                          : ""
                      }`}
                      onClick={() => {
                        setValue("model", m.name);
                      }}
                      data-state={m.name === model ? "selected" : "unselected"}
                    >
                      <TableCell>{m.name}</TableCell>
                      <TableCell>{m.dimensions}</TableCell>
                      <TableCell>{m.contextLength}</TableCell>
                      <TableCell>{m.description}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {errors.model && (
                <p className="text-sm text-red-500">{errors.model.message}</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <Label htmlFor="leftText" className="text-lg">
                  Text 1
                </Label>
                <Controller
                  name="leftText"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      id="leftText"
                      placeholder="Enter first text"
                      className="h-48"
                    />
                  )}
                />
                {errors.leftText && (
                  <p className="text-sm text-red-500">
                    {errors.leftText.message}
                  </p>
                )}
              </div>
              <div className="space-y-4">
                <Label htmlFor="rightText" className="text-lg">
                  Text 2
                </Label>
                <Controller
                  name="rightText"
                  control={control}
                  render={({ field }) => (
                    <Textarea
                      {...field}
                      id="rightText"
                      placeholder="Enter second text"
                      className="h-48"
                    />
                  )}
                />
                {errors.rightText && (
                  <p className="text-sm text-red-500">
                    {errors.rightText.message}
                  </p>
                )}
              </div>
            </div>
            <div className="flex justify-center">
              <Button type="submit" size="lg" disabled={isLoading || !isValid}>
                Calculate Similarity
              </Button>
              {/* {similarity !== null && (
                <Button type="button" onClick={saveHistory} variant="outline">
                  Save Result
                </Button>
              )} */}
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-semibold">Similarity Result</h3>
                {isLoading && (
                  <span className="text-sm text-muted-foreground animate-pulse">
                    Calculating...
                  </span>
                )}
              </div>
              <SimilarityGauge similarity={similarity} />
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">
                  {similarity !== null
                    ? `Cosine Similarity: ${similarity.toFixed(4)}`
                    : "Enter text in both fields and provide an API key to calculate similarity"}
                </span>
                <VectorsPreviewDialog
                  leftVector={leftVector}
                  rightVector={rightVector}
                  leftText={watch("leftText")}
                  rightText={watch("rightText")}
                />
              </div>
            </div>
            {error && <div className="text-md text-red-500 mt-4">{error}</div>}
          </form>
        </div>
      </div>
    </>
  );
}
