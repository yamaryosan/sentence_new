"use client";

import { useEffect, useState } from "react";
import SentenceCard from "../sentence-card";

type Sentence = {
	id: number;
	content: string;
};

type SortOption = "id-asc" | "content-asc";

type ViewResponse =
	| {
			sentences: Sentence[];
			page: number;
			pageSize: number;
			totalCount: number;
			totalPages: number;
	  }
	| { error: string };

const PAGE_SIZE = 200;
const PAGE_BUTTONS = 5;

export default function ViewList() {
	const [sentences, setSentences] = useState<Sentence[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState("");
	const [sort, setSort] = useState<SortOption>("id-asc");
	const [page, setPage] = useState(1);
	const [totalCount, setTotalCount] = useState(0);
	const [totalPages, setTotalPages] = useState(1);

	useEffect(() => {
		const fetchSentences = async () => {
			setIsLoading(true);
			setError("");

			try {
				const params = new URLSearchParams({
					sort,
					page: String(page),
				});
				const response = await fetch(`/api/view?${params.toString()}`);
				const data = (await response.json()) as ViewResponse;

				if (!response.ok || "error" in data) {
					setError("error" in data ? data.error : "取得に失敗しました。");
					return;
				}

				setSentences(data.sentences);
				setTotalCount(data.totalCount);
				setTotalPages(data.totalPages);

				if (data.page !== page) {
					setPage(data.page);
				}
			} catch {
				setError("通信エラーが発生しました。");
			} finally {
				setIsLoading(false);
			}
		};

		void fetchSentences();
	}, [page, sort]);

	const pageStart = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
	const pageEnd = totalCount === 0 ? 0 : Math.min(page * PAGE_SIZE, totalCount);
	const firstPageButton = Math.max(
		1,
		Math.min(page - Math.floor(PAGE_BUTTONS / 2), totalPages - PAGE_BUTTONS + 1),
	);
	const visiblePageCount = Math.min(PAGE_BUTTONS, totalPages);
	const pageNumbers = Array.from(
		{ length: visiblePageCount },
		(_, index) => firstPageButton + index,
	);

	return (
		<section>
			<div className="view-toolbar">
				<div className="view-toolbar-group">
					<label htmlFor="view-sort">ソート</label>
					<select
						id="view-sort"
						value={sort}
						onChange={(event) => {
							setSort(event.target.value as SortOption);
							setPage(1);
						}}
					>
						<option value="id-asc">登録順</option>
						<option value="content-asc">文字列昇順</option>
					</select>
				</div>

				<p className="view-summary">
					{totalCount === 0
						? "0件"
						: `${pageStart} - ${pageEnd} / ${totalCount}件`}
				</p>
			</div>

			{isLoading && <p>Loading...</p>}

			{!isLoading && error && <p>{error}</p>}

			{!isLoading && !error && sentences.length === 0 && (
				<p>保存されている文章はありません。</p>
			)}

			{!isLoading && !error && sentences.length > 0 && (
				<>
					<ul className="search-results">
						{sentences.map((sentence) => (
							<SentenceCard key={sentence.id} content={sentence.content} />
						))}
					</ul>

					<nav className="pagination" aria-label="文章一覧のページネーション">
						<button
							type="button"
							onClick={() => setPage((currentPage) => currentPage - 1)}
							disabled={page <= 1}
						>
							前へ
						</button>

						<div className="pagination-pages">
							{pageNumbers.map((pageNumber) => (
								<button
									key={pageNumber}
									type="button"
									className={
										pageNumber === page ? "pagination-page is-active" : "pagination-page"
									}
									aria-current={pageNumber === page ? "page" : undefined}
									onClick={() => setPage(pageNumber)}
								>
									{pageNumber}
								</button>
							))}
						</div>

						<button
							type="button"
							onClick={() => setPage((currentPage) => currentPage + 1)}
							disabled={page >= totalPages}
						>
							次へ
						</button>
					</nav>
				</>
			)}
		</section>
	);
}
