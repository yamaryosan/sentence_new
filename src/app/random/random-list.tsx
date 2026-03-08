"use client";

import { useEffect, useState } from "react";
import SentenceCard from "../sentence-card";

type Sentence = {
	id: number;
	content: string;
};

type RandomResponse =
	| {
			sentences: Sentence[];
			limit: number;
			count: number;
	  }
	| { error: string };

export default function RandomList() {
	const [sentences, setSentences] = useState<Sentence[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isRefreshing, setIsRefreshing] = useState(false);
	const [error, setError] = useState("");
	const [limit, setLimit] = useState(200);

	const fetchSentences = async (showRefreshing: boolean) => {
		if (showRefreshing) {
			setIsRefreshing(true);
		} else {
			setIsLoading(true);
		}
		setError("");

		try {
			const response = await fetch("/api/random");
			const data = (await response.json()) as RandomResponse;

			if (!response.ok || "error" in data) {
				setError("error" in data ? data.error : "取得に失敗しました。");
				return;
			}

			setSentences(data.sentences);
			setLimit(data.limit);
		} catch {
			setError("通信エラーが発生しました。");
		} finally {
			setIsLoading(false);
			setIsRefreshing(false);
		}
	};

	useEffect(() => {
		void fetchSentences(false);
	}, []);

	return (
		<section>
			<div className="view-toolbar">
				<p className="view-summary">
					{sentences.length === 0 ? "0件" : `${sentences.length} / ${limit}件`}
				</p>
				<button
					type="button"
					onClick={() => void fetchSentences(true)}
					disabled={isLoading || isRefreshing}
				>
					{isRefreshing ? "再取得中..." : "シャッフル"}
				</button>
			</div>

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
