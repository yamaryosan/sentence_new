"use client";

import SentenceCard from "../sentence-card";
import { useRandomSentences } from "@/hooks/use-random-sentences";

export default function RandomList() {
	const { sentences, limit, isLoading, isRefreshing, error, shuffle } =
		useRandomSentences();

	return (
		<section>
			<div className="view-toolbar">
				<p className="view-summary">
					{sentences.length === 0 ? "0件" : `${sentences.length} / ${limit}件`}
				</p>
				<button
					type="button"
					onClick={shuffle}
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
