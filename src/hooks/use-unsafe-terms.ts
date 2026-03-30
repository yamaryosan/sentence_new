"use client";

import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type UnsafeTerm = {
	id: number;
	term: string;
	createdAt: string;
};

type UnsafeTermsResponse = { terms: UnsafeTerm[] } | { error: string };
type AddUnsafeTermResponse = { term: UnsafeTerm } | { error: string };
type DeleteUnsafeTermResponse = { id: number } | { error: string };

const UNSAFE_TERMS_QUERY_KEY = ["unsafe-terms"] as const;

async function fetchUnsafeTerms(): Promise<UnsafeTerm[]> {
	const response = await fetch("/api/unsafe-terms");
	const data = (await response.json()) as UnsafeTermsResponse;

	if (!response.ok || "error" in data) {
		throw new Error(
			"error" in data
				? data.error
				: "アンセーフ用語一覧の取得に失敗しました。",
		);
	}

	return data.terms;
}

async function addUnsafeTerm(term: string): Promise<UnsafeTerm> {
	const response = await fetch("/api/unsafe-terms", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ term }),
	});
	const data = (await response.json()) as AddUnsafeTermResponse;

	if (!response.ok || "error" in data) {
		throw new Error("error" in data ? data.error : "用語の追加に失敗しました。");
	}

	return data.term;
}

async function deleteUnsafeTerm(id: number): Promise<number> {
	const response = await fetch(`/api/unsafe-terms?id=${id}`, {
		method: "DELETE",
	});
	const data = (await response.json()) as DeleteUnsafeTermResponse;

	if (!response.ok || "error" in data) {
		throw new Error("error" in data ? data.error : "用語の削除に失敗しました。");
	}

	return data.id;
}

export function useUnsafeTerms() {
	const queryClient = useQueryClient();
	const [termError, setTermError] = useState("");

	const {
		data: unsafeTerms = [],
		isLoading: isUnsafeTermsLoading,
		isFetching: isUnsafeTermsFetching,
		refetch,
		error: unsafeTermsQueryError,
	} = useQuery<UnsafeTerm[], Error>({
		queryKey: UNSAFE_TERMS_QUERY_KEY,
		queryFn: fetchUnsafeTerms,
	});

	useEffect(() => {
		if (unsafeTermsQueryError) {
			setTermError(unsafeTermsQueryError.message);
		}
	}, [unsafeTermsQueryError]);

	const addTermMutation = useMutation<UnsafeTerm, Error, string>({
		mutationFn: addUnsafeTerm,
		onMutate: () => {
			setTermError("");
		},
		onSuccess: (addedTerm) => {
			queryClient.setQueryData<UnsafeTerm[]>(
				UNSAFE_TERMS_QUERY_KEY,
				(current = []) => [addedTerm, ...current],
			);
		},
		onError: (error) => {
			setTermError(error.message);
		},
	});

	const deleteTermMutation = useMutation<number, Error, number>({
		mutationFn: deleteUnsafeTerm,
		onMutate: () => {
			setTermError("");
		},
		onSuccess: (deletedId) => {
			queryClient.setQueryData<UnsafeTerm[]>(
				UNSAFE_TERMS_QUERY_KEY,
				(current = []) => current.filter((term) => term.id !== deletedId),
			);
		},
		onError: (error) => {
			setTermError(error.message);
		},
	});

	const isTermLoading =
		isUnsafeTermsLoading ||
		isUnsafeTermsFetching ||
		addTermMutation.isPending ||
		deleteTermMutation.isPending;

	const refetchUnsafeTerms = () => {
		setTermError("");
		void refetch();
	};

	return {
		unsafeTerms,
		termError,
		setTermError,
		isTermLoading,
		addTerm: (term: string) => addTermMutation.mutate(term),
		deleteTerm: (id: number) => deleteTermMutation.mutate(id),
		refetchUnsafeTerms,
	};
}
