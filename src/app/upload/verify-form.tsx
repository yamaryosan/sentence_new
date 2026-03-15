"use client";

import { type FormEvent, useState } from "react";

export default function VerifyForm() {
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const [isVerifying, setIsVerifying] = useState(false);

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError("");
		setIsVerifying(true);

		try {
			const response = await fetch("/api/verify", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ password }),
			});

			const data = (await response.json()) as { error?: string };

			if (!response.ok) {
				setError(data.error ?? "認証に失敗しました。");
				return;
			}

			window.location.reload();
		} catch {
			setError("通信エラーが発生しました。");
		} finally {
			setIsVerifying(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="upload-form">
			<p>/upload に入るにはパスワードが必要です。</p>
			<input
				type="password"
				name="password"
				value={password}
				onChange={(event) => setPassword(event.target.value)}
				placeholder="Password"
				autoComplete="current-password"
			/>
			<div className="upload-actions">
				<button type="submit" disabled={isVerifying}>
					{isVerifying ? "Verifying..." : "認証"}
				</button>
			</div>
			{error && <p>{error}</p>}
		</form>
	);
}
