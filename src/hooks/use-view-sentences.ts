"use client";

import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";

type Sentence = {
	id: number;
	content: string;
};

export type ViewSortOption = "id-asc" | "content-asc";

type ViewSuccessResponse = {
	sentences: Sentence[];
	page: number;
	pageSize: number;
	totalCount: number;
	totalPages: number;
};

type ViewResponse = ViewSuccessResponse | { error: string };

const FALLBACK_PAGE_SIZE = 200;

async function fetchViewSentences(
	sort: ViewSortOption,
	page: number,
): Promise<ViewSuccessResponse> {
	const params = new URLSearchParams({
		sort,
		page: String(page),
	});
	const response = await fetch(`/api/view?${params.toString()}`);
	const data = (await response.json()) as ViewResponse;

	if (!response.ok || "error" in data) {
		throw new Error("error" in data ? data.error : "取得に失敗しました。");
	}

	return data;
}

export function useViewSentences() {
	const [sort, setSort] = useState<ViewSortOption>("id-asc");
	const [page, setPage] = useState(1);

	const query = useQuery<ViewSuccessResponse, Error>({
		queryKey: ["view-sentences", sort, page],
		queryFn: () => fetchViewSentences(sort, page),
	});

	useEffect(() => {
		if (!query.data) {
			return;
		}

		if (query.data.page !== page) {
			setPage(query.data.page);
		}
	}, [page, query.data]);

	return {
		sort,
		page,
		sentences: query.data?.sentences ?? [],
		totalCount: query.data?.totalCount ?? 0,
		totalPages: query.data?.totalPages ?? 1,
		pageSize: query.data?.pageSize ?? FALLBACK_PAGE_SIZE,
		isLoading: query.isLoading,
		error: query.isFetching ? "" : (query.error?.message ?? ""),
		changeSort: (nextSort: ViewSortOption) => {
			setSort(nextSort);
			setPage(1);
		},
		goToPage: (nextPage: number) => setPage(nextPage),
		goToPrevPage: () => setPage((currentPage) => currentPage - 1),
		goToNextPage: () => setPage((currentPage) => currentPage + 1),
	};
}
