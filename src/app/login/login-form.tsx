"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [password, setPassword] = useState("");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [isSubmitting, setIsSubmitting] = useState(false);

	async function handleSubmit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		setIsSubmitting(true);
		setErrorMessage(null);

		const nextPath = searchParams.get("next") ?? "/search";

		try {
			const response = await fetch("/api/auth/login", {
				method: "POST",
				headers: {
					"content-type": "application/json",
				},
				body: JSON.stringify({
					password,
				}),
			});
			const data = (await response.json()) as { error?: string };

			if (!response.ok) {
				setErrorMessage(data.error ?? "ログインに失敗しました。");
				return;
			}

			router.replace(nextPath);
			router.refresh();
		} catch {
			setErrorMessage("ログイン中に通信エラーが発生しました。");
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<form className="mt-6 max-w-md space-y-4" onSubmit={handleSubmit}>
			<label className="block">
				<span className="mb-2 block text-sm font-medium">
					パスワード
				</span>
				<input
					className="w-full rounded border border-[var(--border)] bg-transparent px-3 py-2"
					type="password"
					name="password"
					value={password}
					onChange={(event) => setPassword(event.target.value)}
					autoComplete="current-password"
					required
				/>
			</label>
			<button
				className="rounded border border-[var(--border)] px-4 py-2 disabled:opacity-60"
				type="submit"
				disabled={isSubmitting}
			>
				{isSubmitting ? "送信中..." : "ログイン"}
			</button>
			{errorMessage ? (
				<p className="text-sm text-red-600">{errorMessage}</p>
			) : null}
		</form>
	);
}
