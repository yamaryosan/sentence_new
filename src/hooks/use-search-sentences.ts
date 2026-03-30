"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

export type Sentence = {
	id: number;
	content: string;
};

export type SortOption = "id-asc" | "content-asc";

type SearchRequest = {
	query: string;
	sort: SortOption;
	unsafeMode: boolean;
};

type SearchResponse = { sentences: Sentence[] } | { error: string };

async function fetchSearchResults({
	query,
	sort,
	unsafeMode,
}: SearchRequest): Promise<Sentence[]> {
	const params = new URLSearchParams({
		q: query,
		sort,
		unsafeMode: String(unsafeMode),
	});
	const response = await fetch(`/api/search?${params.toString()}`);
	const data = (await response.json()) as SearchResponse;

	if (!response.ok || "error" in data) {
		throw new Error("error" in data ? data.error : "検索に失敗しました。");
	}

	return data.sentences;
}

export function useSearchSentences() {
	const [results, setResults] = useState<Sentence[]>([]);
	const [error, setError] = useState("");
	const [hasSearched, setHasSearched] = useState(false);

	const searchMutation = useMutation<Sentence[], Error, SearchRequest>({
		mutationFn: fetchSearchResults,
		onMutate: () => {
			setError("");
		},
		onSuccess: (sentences) => {
			setResults(sentences);
			setHasSearched(true);
		},
		onError: (caughtError) => {
			setError(caughtError.message);
			setResults([]);
			setHasSearched(false);
		},
	});

	const markEmptyQuery = (message: string) => {
		setError(message);
		setResults([]);
		setHasSearched(false);
	};

	return {
		results,
		error,
		hasSearched,
		isLoading: searchMutation.isPending,
		searchSentences: (request: SearchRequest) => searchMutation.mutate(request),
		markEmptyQuery,
	};
}
