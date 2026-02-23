"use client";

import { type FormEvent, useState } from "react";

export default function Home() {
	const [result, setResult] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState("");

	const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setError("");
		setResult("");

		const formData = new FormData(event.currentTarget);
		const file = formData.get("file");

		if (!(file instanceof File) || file.size === 0) {
			setError("txtファイルを1つ選択してください。");
			return;
		}

		setIsLoading(true);

		try {
			const response = await fetch("/api/upload", {
				method: "POST",
				body: formData,
			});

			const data = (await response.json()) as
				| { preview: string }
				| { error: string };

			if (!response.ok || "error" in data) {
				setError("error" in data ? data.error : "アップロードに失敗しました。");
				return;
			}

			setResult(data.preview);
		} catch {
			setError("通信エラーが発生しました。");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div>
			<main>
				<form onSubmit={handleSubmit}>
					<input type="file" name="file" accept=".txt,text/plain" />
					<button type="submit" disabled={isLoading}>
						{isLoading ? "Uploading..." : "Upload"}
					</button>
				</form>

				{error && <p>{error}</p>}
				{result && <p>先頭100文字: {result}</p>}
			</main>
		</div>
	);
}
