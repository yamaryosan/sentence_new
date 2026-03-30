"use client";

import { type SubmitEventHandler, useState } from "react";
import { useLoginAction } from "./use-login-action";

export default function LoginForm() {
	const [password, setPassword] = useState("");
	const { errorMessage, isSubmitting, submitLogin } = useLoginAction();

	const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
		event.preventDefault();
		submitLogin(password);
	};

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
