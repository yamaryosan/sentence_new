"use client";

import { useEffect, useSyncExternalStore } from "react";

type Theme = "light" | "dark";

const STORAGE_KEY = "theme";
const THEME_EVENT = "theme-change";

const getStoredTheme = (): Theme =>
	window.localStorage.getItem(STORAGE_KEY) === "dark" ? "dark" : "light";

const subscribe = (onStoreChange: () => void) => {
	const handleStorage = (event: StorageEvent) => {
		if (event.key === STORAGE_KEY) {
			onStoreChange();
		}
	};

	const handleThemeChange = () => {
		onStoreChange();
	};

	window.addEventListener("storage", handleStorage);
	window.addEventListener(THEME_EVENT, handleThemeChange);

	return () => {
		window.removeEventListener("storage", handleStorage);
		window.removeEventListener(THEME_EVENT, handleThemeChange);
	};
};

export default function ThemeToggle() {
	const theme = useSyncExternalStore(subscribe, getStoredTheme, () => "light");
	const isDark = theme === "dark";

	useEffect(() => {
		document.documentElement.dataset.theme = theme;
		document.body.dataset.theme = theme;
		window.localStorage.setItem(STORAGE_KEY, theme);
	}, [theme]);

	return (
		<button
			type="button"
			className="theme-toggle"
			aria-label={isDark ? "ライトモードに切り替え" : "ナイトモードに切り替え"}
			title={isDark ? "ライトモード" : "ナイトモード"}
			onClick={() => {
				const nextTheme = theme === "light" ? "dark" : "light";
				window.localStorage.setItem(STORAGE_KEY, nextTheme);
				window.dispatchEvent(new Event(THEME_EVENT));
			}}
		>
			<span className="theme-toggle-icon" aria-hidden="true">
				{isDark ? (
					<svg viewBox="0 0 24 24" focusable="false">
						<circle cx="12" cy="12" r="4" fill="currentColor" />
						<path
							d="M12 1.5v3M12 19.5v3M4.58 4.58l2.12 2.12M17.3 17.3l2.12 2.12M1.5 12h3M19.5 12h3M4.58 19.42l2.12-2.12M17.3 6.7l2.12-2.12"
							fill="none"
							stroke="currentColor"
							strokeLinecap="round"
							strokeWidth="1.8"
						/>
					</svg>
				) : (
					<svg viewBox="0 0 24 24" focusable="false">
						<path
							d="M20.5 14.2A8.5 8.5 0 0 1 9.8 3.5a8.5 8.5 0 1 0 10.7 10.7Z"
							fill="currentColor"
						/>
					</svg>
				)}
			</span>
		</button>
	);
}
