"use client";

import { useQuery } from "@tanstack/react-query";

type Sentence = {
	id: number;
	content: string;
};

type RandomSuccessResponse = {
	sentences: Sentence[];
	limit: number;
	count: number;
};

type RandomResponse = RandomSuccessResponse | { error: string };

const RANDOM_SENTENCES_QUERY_KEY = ["random-sentences"] as const;
const FALLBACK_LIMIT = 200;
const RANDOM_SENTENCES_STALE_TIME_MS = 1000 * 60 * 5;
const RANDOM_SENTENCES_GC_TIME_MS = 1000 * 60 * 30;

async function fetchRandomSentences(): Promise<RandomSuccessResponse> {
	const response = await fetch("/api/random");
	const data = (await response.json()) as RandomResponse;

	if (!response.ok || "error" in data) {
		throw new Error("error" in data ? data.error : "取得に失敗しました。");
	}

	return data;
}

export function useRandomSentences() {
	const query = useQuery<RandomSuccessResponse, Error>({
		queryKey: RANDOM_SENTENCES_QUERY_KEY,
		queryFn: fetchRandomSentences,
		staleTime: RANDOM_SENTENCES_STALE_TIME_MS,
		gcTime: RANDOM_SENTENCES_GC_TIME_MS,
		refetchOnMount: false,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
	});

	return {
		sentences: query.data?.sentences ?? [],
		limit: query.data?.limit ?? FALLBACK_LIMIT,
		isLoading: query.isLoading,
		isRefreshing: query.isFetching && !query.isLoading,
		error: query.isFetching ? "" : (query.error?.message ?? ""),
		shuffle: () => void query.refetch(),
	};
}
