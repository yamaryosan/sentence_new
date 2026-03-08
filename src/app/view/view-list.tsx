"use client";

import { useEffect, useState } from "react";
import SentenceCard from "../sentence-card";

type Sentence = {
	id: number;
	content: string;
};

export default function ViewList() {
	const [sentences, setSentences] = useState<Sentence[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");

	useEffect(() => {
		const fetchSentences = async () => {
			setIsLoading(true);
			setError("");

			try {
				const response = await fetch("/api/view");
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
	}, []);

	if (isLoading) {
		return <p>Loading...</p>;
	}

	if (error) {
		return <p>{error}</p>;
	}

	if (sentences.length === 0) {
		return <p>保存されている文章はありません。</p>;
	}

	return (
		<ul className="search-results">
			{sentences.map((sentence) => (
				<SentenceCard key={sentence.id} content={sentence.content} />
			))}
		</ul>
	);
}
