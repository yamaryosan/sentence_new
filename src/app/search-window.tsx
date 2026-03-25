"use client";

import { type SubmitEventHandler, useEffect, useState } from "react";
import { UNSAFE_SEARCH_MODE_STORAGE_KEY } from "@/lib/search-config";
import SentenceCard from "./sentence-card";

type Sentence = {
	id: number;
	content: string;
};

type SortOption = "id-asc" | "content-asc";

export default function SearchWindow() {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<Sentence[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [hasSearched, setHasSearched] = useState(false);
	const [sort, setSort] = useState<SortOption>("id-asc");
	const [isUnsafeSearchModeEnabled, setIsUnsafeSearchModeEnabled] =
		useState(false);

	useEffect(() => {
		const saved = localStorage.getItem(UNSAFE_SEARCH_MODE_STORAGE_KEY);
		setIsUnsafeSearchModeEnabled(saved === "true");
	}, []);

	const fetchResults = async (
		nextQuery: string,
		nextSort: SortOption,
		nextUnsafeMode: boolean,
	) => {
		const params = new URLSearchParams({
			q: nextQuery,
			sort: nextSort,
			unsafeMode: String(nextUnsafeMode),
		});
		const response = await fetch(`/api/search?${params.toString()}`);
		const data = (await response.json()) as
			| { sentences: Sentence[] }
			| { error: string };

		if (!response.ok || "error" in data) {
			throw new Error("error" in data ? data.error : "検索に失敗しました。");
		}

		return data.sentences;
	};

	const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (event) => {
		event.preventDefault();
		const trimmed = query.trim();

		if (trimmed.length === 0) {
			setError("検索キーワードを入力してください。");
			setResults([]);
			setHasSearched(false);
			return;
		}

		setIsLoading(true);
		setError("");

		try {
			const sentences = await fetchResults(
				trimmed,
				sort,
				isUnsafeSearchModeEnabled,
			);
			setResults(sentences);
			setHasSearched(true);
		} catch (caughtError) {
			setError(
				caughtError instanceof Error
					? caughtError.message
					: "通信エラーが発生しました。",
			);
			setResults([]);
			setHasSearched(false);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSortChange = async (nextSort: SortOption) => {
		setSort(nextSort);

		if (!hasSearched) {
			return;
		}

		const trimmed = query.trim();
		if (trimmed.length === 0) {
			return;
		}

		setIsLoading(true);
		setError("");

		try {
			const sentences = await fetchResults(
				trimmed,
				nextSort,
				isUnsafeSearchModeEnabled,
			);
			setResults(sentences);
		} catch (caughtError) {
			setError(
				caughtError instanceof Error
					? caughtError.message
					: "通信エラーが発生しました。",
			);
			setResults([]);
			setHasSearched(false);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<section>
			<h2>検索ウィンドウ</h2>
			<form onSubmit={handleSubmit}>
				<input
					type="text"
					value={query}
					onChange={(event) => setQuery(event.target.value)}
					placeholder="キーワードを入力"
				/>
				<button type="submit" disabled={isLoading}>
					{isLoading ? "Searching..." : "検索"}
				</button>
			</form>
			<label htmlFor="search-sort">ソート</label>
			<select
				id="search-sort"
				value={sort}
				onChange={(event) =>
					void handleSortChange(event.target.value as SortOption)
				}
				disabled={isLoading}
			>
				<option value="id-asc">登録順</option>
				<option value="content-asc">文字列昇順</option>
			</select>

			{error && <p>{error}</p>}

			{!error && !isLoading && results.length > 0 && (
				<ul className="search-results">
					{results.map((sentence) => (
						<SentenceCard key={sentence.id} content={sentence.content} />
					))}
				</ul>
			)}

			{!error && !isLoading && hasSearched && results.length === 0 && (
				<p>一致する文章はありません。</p>
			)}
		</section>
	);
}
