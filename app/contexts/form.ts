import { FormState } from "@/lib/state";
import { createContext } from "react";
import { type UseFormReturn } from "react-hook-form";

export const FormContext = createContext<UseFormReturn<FormState>>(
	{} as unknown as UseFormReturn<FormState>,
);
