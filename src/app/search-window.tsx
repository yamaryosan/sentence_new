"use client";

import { type SubmitEventHandler, useState } from "react";
import SentenceCard from "./sentence-card";

type Sentence = {
	id: number;
	content: string;
};

export default function SearchWindow() {
	const [query, setQuery] = useState("");
	const [results, setResults] = useState<Sentence[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");
	const [hasSearched, setHasSearched] = useState(false);

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
			const response = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
			const data = (await response.json()) as
				| { sentences: Sentence[] }
				| { error: string };

			if (!response.ok || "error" in data) {
				setError("error" in data ? data.error : "検索に失敗しました。");
				setResults([]);
				setHasSearched(false);
				return;
			}

			setResults(data.sentences);
			setHasSearched(true);
		} catch {
			setError("通信エラーが発生しました。");
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
