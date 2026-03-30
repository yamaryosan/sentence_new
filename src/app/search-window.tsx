"use client";

import { type SubmitEventHandler, useEffect, useState } from "react";
import { UNSAFE_SEARCH_MODE_STORAGE_KEY } from "@/lib/search-config";
import { type SortOption, useSearchSentences } from "./use-search-sentences";
import SentenceCard from "./sentence-card";

export default function SearchWindow() {
	const [query, setQuery] = useState("");
	const [sort, setSort] = useState<SortOption>("id-asc");
	const [isUnsafeSearchModeEnabled, setIsUnsafeSearchModeEnabled] =
		useState(false);
	const { results, error, hasSearched, isLoading, searchSentences, markEmptyQuery } =
		useSearchSentences();

	useEffect(() => {
		const saved = localStorage.getItem(UNSAFE_SEARCH_MODE_STORAGE_KEY);
		setIsUnsafeSearchModeEnabled(saved === "true");
	}, []);

	const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
		event.preventDefault();
		const trimmed = query.trim();

		if (trimmed.length === 0) {
			markEmptyQuery("検索キーワードを入力してください。");
			return;
		}

		searchSentences({
			query: trimmed,
			sort,
			unsafeMode: isUnsafeSearchModeEnabled,
		});
	};

	const handleSortChange = (nextSort: SortOption) => {
		setSort(nextSort);

		if (!hasSearched) {
			return;
		}

		const trimmed = query.trim();
		if (trimmed.length === 0) {
			return;
		}

		searchSentences({
			query: trimmed,
			sort: nextSort,
			unsafeMode: isUnsafeSearchModeEnabled,
		});
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
					handleSortChange(event.target.value as SortOption)
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
