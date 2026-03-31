"use client";

import { type ViewSortOption, useViewSentences } from "@/hooks/use-view-sentences";
import SentenceCard from "../sentence-card";

const PAGE_BUTTONS = 5;

export default function ViewList() {
	const {
		sort,
		page,
		sentences,
		totalCount,
		totalPages,
		pageSize,
		isLoading,
		error,
		changeSort,
		goToPage,
		goToPrevPage,
		goToNextPage,
	} = useViewSentences();

	const pageStart = totalCount === 0 ? 0 : (page - 1) * pageSize + 1;
	const pageEnd = totalCount === 0 ? 0 : Math.min(page * pageSize, totalCount);
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
							changeSort(event.target.value as ViewSortOption);
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
							onClick={goToPrevPage}
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
									onClick={() => goToPage(pageNumber)}
								>
									{pageNumber}
								</button>
							))}
						</div>

						<button
							type="button"
							onClick={goToNextPage}
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
