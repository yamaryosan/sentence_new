"use client";

import { useEffect, useState } from "react";
import { UNSAFE_SEARCH_MODE_STORAGE_KEY } from "@/lib/search-config";
import { useUnsafeTerms } from "@/hooks/use-unsafe-terms";

export default function ConfigForm() {
	const [isReady, setIsReady] = useState(false);
	const [isUnsafeSearchModeEnabled, setIsUnsafeSearchModeEnabled] =
		useState(false);
	const [isUnsafeTermsVisible, setIsUnsafeTermsVisible] = useState(false);
	const [nextTerm, setNextTerm] = useState("");
	const {
		unsafeTerms,
		termError,
		setTermError,
		isTermLoading,
		addTerm,
		deleteTerm,
		refetchUnsafeTerms,
	} = useUnsafeTerms();

	useEffect(() => {
		try {
			const saved = localStorage.getItem(UNSAFE_SEARCH_MODE_STORAGE_KEY);
			setIsUnsafeSearchModeEnabled(saved === "true");
		} finally {
			setIsReady(true);
		}
	}, []);

	const handleToggle = (checked: boolean) => {
		setIsUnsafeSearchModeEnabled(checked);
		localStorage.setItem(UNSAFE_SEARCH_MODE_STORAGE_KEY, String(checked));
	};

	const handleAddTerm = () => {
		const trimmed = nextTerm.trim();
		if (trimmed.length === 0) {
			setTermError("追加する用語を入力してください。");
			return;
		}

		addTerm(trimmed);
		setNextTerm("");
	};

	const handleDeleteTerm = (id: number) => {
		deleteTerm(id);
	};

	const handleRefetch = () => {
		refetchUnsafeTerms();
	};

	return (
		<section className="grid gap-4">
			<h2>検索設定</h2>
			<label className="inline-flex items-center gap-3">
				<input
					type="checkbox"
					role="switch"
					checked={isUnsafeSearchModeEnabled}
					onChange={(event) => handleToggle(event.target.checked)}
					disabled={!isReady}
				/>
				<span>アンセーフ用語の検索モード</span>
			</label>
			<p className="m-0 text-sm text-[var(--muted)]">
				現在: {isUnsafeSearchModeEnabled ? "オン" : "オフ"}
			</p>
			<div className="grid gap-2">
				<h3 className="m-0 text-base font-semibold">アンセーフ用語管理</h3>
				<div className="flex flex-wrap items-center gap-2">
					<input
						type="text"
						value={nextTerm}
						onChange={(event) => setNextTerm(event.target.value)}
						placeholder="追加する用語"
						disabled={isTermLoading}
					/>
					<button type="button" onClick={handleAddTerm} disabled={isTermLoading}>
						追加
					</button>
					<button type="button" onClick={handleRefetch} disabled={isTermLoading}>
						再読込
					</button>
					<button
						type="button"
						onClick={() => setIsUnsafeTermsVisible((current) => !current)}
						disabled={unsafeTerms.length === 0}
					>
						{isUnsafeTermsVisible ? "非表示" : "表示"}
					</button>
				</div>
				{termError && <p className="m-0 text-sm">{termError}</p>}
				{isTermLoading && <p className="m-0 text-sm">処理中...</p>}
				{!isTermLoading && unsafeTerms.length === 0 && (
					<p className="m-0 text-sm text-[var(--muted)]">
						登録されている用語はありません。
					</p>
				)}
				{unsafeTerms.length > 0 && (
					<ul className="m-0 list-disc space-y-1 pl-5">
						{unsafeTerms.map((unsafeTerm) => (
							<li key={unsafeTerm.id} className="flex items-center gap-2">
								<span>
									{isUnsafeTermsVisible
										? unsafeTerm.term
										: "*".repeat(unsafeTerm.term.length)}
								</span>
								<button
									type="button"
									className="px-2 py-1 text-xs"
									onClick={() => handleDeleteTerm(unsafeTerm.id)}
									disabled={isTermLoading}
								>
									削除
								</button>
							</li>
						))}
					</ul>
				)}
			</div>
		</section>
	);
}
