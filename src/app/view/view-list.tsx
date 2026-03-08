"use client";

import { useEffect, useState } from "react";
import SentenceCard from "../sentence-card";

type Sentence = {
	id: number;
	content: string;
};

type SortOption = "id-asc" | "content-asc";

export default function ViewList() {
	const [sentences, setSentences] = useState<Sentence[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");
	const [sort, setSort] = useState<SortOption>("id-asc");

	useEffect(() => {
		const fetchSentences = async () => {
			setIsLoading(true);
			setError("");

			try {
				const params = new URLSearchParams({ sort });
				const response = await fetch(`/api/view?${params.toString()}`);
				const data = (await response.json()) as
					| { sentences: Sentence[] }
					| { error: string };

				if (!response.ok || "error" in data) {
					setError("error" in data ? data.error : "取得に失敗しました。");
					return;
				}

				setSentences(data.sentences);
			} catch {
				setError("通信エラーが発生しました。");
			} finally {
				setIsLoading(false);
			}
		};

		void fetchSentences();
	}, [sort]);

	return (
		<section>
			<label htmlFor="view-sort">ソート</label>
			<select
				id="view-sort"
				value={sort}
				onChange={(event) => setSort(event.target.value as SortOption)}
			>
				<option value="id-asc">登録順</option>
				<option value="content-asc">文字列昇順</option>
			</select>

			{isLoading && <p>Loading...</p>}

			{!isLoading && error && <p>{error}</p>}

			{!isLoading && !error && sentences.length === 0 && (
				<p>保存されている文章はありません。</p>
			)}

			{!isLoading && !error && sentences.length > 0 && (
				<ul className="search-results">
					{sentences.map((sentence) => (
						<SentenceCard key={sentence.id} content={sentence.content} />
					))}
				</ul>
			)}
		</section>
	);
}
