"use client";

import { useEffect, useState } from "react";
import { UNSAFE_SEARCH_MODE_STORAGE_KEY } from "@/lib/search-config";

type UnsafeTerm = {
	id: number;
	term: string;
	createdAt: string;
};

export default function ConfigForm() {
	const [isReady, setIsReady] = useState(false);
	const [isUnsafeSearchModeEnabled, setIsUnsafeSearchModeEnabled] =
		useState(false);
	const [unsafeTerms, setUnsafeTerms] = useState<UnsafeTerm[]>([]);
	const [nextTerm, setNextTerm] = useState("");
	const [isTermLoading, setIsTermLoading] = useState(false);
	const [termError, setTermError] = useState("");

	useEffect(() => {
		try {
			const saved = localStorage.getItem(UNSAFE_SEARCH_MODE_STORAGE_KEY);
			setIsUnsafeSearchModeEnabled(saved === "true");
		} finally {
			setIsReady(true);
		}
	}, []);

	const fetchUnsafeTerms = async () => {
		setIsTermLoading(true);
		setTermError("");

		try {
			const response = await fetch("/api/unsafe-terms");
			const data = (await response.json()) as
				| { terms: UnsafeTerm[] }
				| { error: string };
			if (!response.ok || "error" in data) {
				throw new Error(
					"error" in data
						? data.error
						: "アンセーフ用語一覧の取得に失敗しました。",
				);
			}
			setUnsafeTerms(data.terms);
		} catch (error) {
			setTermError(
				error instanceof Error
					? error.message
					: "アンセーフ用語一覧の取得に失敗しました。",
			);
		} finally {
			setIsTermLoading(false);
		}
	};

	useEffect(() => {
		void fetchUnsafeTerms();
	}, []);

	const handleToggle = (checked: boolean) => {
		setIsUnsafeSearchModeEnabled(checked);
		localStorage.setItem(UNSAFE_SEARCH_MODE_STORAGE_KEY, String(checked));
	};

	const handleAddTerm = async () => {
		const trimmed = nextTerm.trim();
		if (trimmed.length === 0) {
			setTermError("追加する用語を入力してください。");
			return;
		}

		setIsTermLoading(true);
		setTermError("");

		try {
			const response = await fetch("/api/unsafe-terms", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ term: trimmed }),
			});
			const data = (await response.json()) as
				| { term: UnsafeTerm }
				| { error: string };
			if (!response.ok || "error" in data) {
				throw new Error("error" in data ? data.error : "用語の追加に失敗しました。");
			}

			setUnsafeTerms((current) => [data.term, ...current]);
			setNextTerm("");
		} catch (error) {
			setTermError(
				error instanceof Error ? error.message : "用語の追加に失敗しました。",
			);
		} finally {
			setIsTermLoading(false);
		}
	};

	const handleDeleteTerm = async (id: number) => {
		setIsTermLoading(true);
		setTermError("");

		try {
			const response = await fetch(`/api/unsafe-terms?id=${id}`, {
				method: "DELETE",
			});
			const data = (await response.json()) as { id: number } | { error: string };
			if (!response.ok || "error" in data) {
				throw new Error("error" in data ? data.error : "用語の削除に失敗しました。");
			}

			setUnsafeTerms((current) => current.filter((term) => term.id !== id));
		} catch (error) {
			setTermError(
				error instanceof Error ? error.message : "用語の削除に失敗しました。",
			);
		} finally {
			setIsTermLoading(false);
		}
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
					<button type="button" onClick={() => void handleAddTerm()}>
						追加
					</button>
					<button type="button" onClick={() => void fetchUnsafeTerms()}>
						再読込
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
								<span>{unsafeTerm.term}</span>
								<button
									type="button"
									className="px-2 py-1 text-xs"
									onClick={() => void handleDeleteTerm(unsafeTerm.id)}
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
