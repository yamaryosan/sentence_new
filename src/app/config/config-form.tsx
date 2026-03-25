"use client";

import { useEffect, useState } from "react";

const TABOO_SEARCH_MODE_STORAGE_KEY = "taboo-search-mode-enabled";

export default function ConfigForm() {
	const [isReady, setIsReady] = useState(false);
	const [isTabooSearchModeEnabled, setIsTabooSearchModeEnabled] =
		useState(false);

	useEffect(() => {
		try {
			const saved = localStorage.getItem(TABOO_SEARCH_MODE_STORAGE_KEY);
			setIsTabooSearchModeEnabled(saved === "true");
		} finally {
			setIsReady(true);
		}
	}, []);

	const handleToggle = (checked: boolean) => {
		setIsTabooSearchModeEnabled(checked);
		localStorage.setItem(TABOO_SEARCH_MODE_STORAGE_KEY, String(checked));
	};

	return (
		<section className="grid gap-4">
			<h2>検索設定</h2>
			<label className="inline-flex items-center gap-3">
				<input
					type="checkbox"
					role="switch"
					checked={isTabooSearchModeEnabled}
					onChange={(event) => handleToggle(event.target.checked)}
					disabled={!isReady}
				/>
				<span>アンセーフ用語の検索モード</span>
			</label>
			<p className="m-0 text-sm text-[var(--muted)]">
				現在: {isTabooSearchModeEnabled ? "オン" : "オフ"}
			</p>
		</section>
	);
}
