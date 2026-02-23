"use client";

import { useEffect, useState } from "react";

type Sentence = {
	id: number;
	content: string;
};

export default function ViewPage() {
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

	return (
		<div>
			<main>
				<h1>文章一覧</h1>

				{isLoading && <p>Loading...</p>}
				{error && <p>{error}</p>}

				{!isLoading && !error && sentences.length === 0 && (
					<p>保存されている文章はありません。</p>
				)}

				{!isLoading && !error && sentences.length > 0 && (
					<ul>
						{sentences.map((sentence) => (
							<li key={sentence.id}>
								<p>{sentence.content}</p>
							</li>
						))}
					</ul>
				)}
			</main>
		</div>
	);
}
