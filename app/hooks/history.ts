import { fetchHistories } from "@/lib/state";
import { useQuery } from "@tanstack/react-query";

export const useHistories = () => {
	const { data: histories } = useQuery({
		queryKey: ["histories"],
		queryFn: fetchHistories,
	});
	return histories;
};
