"use client";

import { type FormEvent, useState } from "react";

export default function UploadForm() {
	const [result, setResult] = useState("");
	const [isUploading, setIsUploading] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
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

		setIsUploading(true);

		try {
			const response = await fetch("/api/upload", {
				method: "POST",
				body: formData,
			});

			const data = (await response.json()) as
				| { count: number }
				| { error: string };

			if (!response.ok || "error" in data) {
				setError("error" in data ? data.error : "アップロードに失敗しました。");
				return;
			}

			setResult(`${data.count}件のレコードを保存しました。`);
		} catch {
			setError("通信エラーが発生しました。");
		} finally {
			setIsUploading(false);
		}
	};

	const handleDeleteAll = async () => {
		setError("");
		setResult("");

		const shouldDelete = window.confirm("本当に削除しますか？");
		if (!shouldDelete) {
			return;
		}

		setIsDeleting(true);

		try {
			const response = await fetch("/api/upload", {
				method: "DELETE",
			});

			const data = (await response.json()) as
				| { count: number }
				| { error: string };

			if (!response.ok || "error" in data) {
				setError("error" in data ? data.error : "削除に失敗しました。");
				return;
			}

			setResult(`${data.count}件のレコードを削除しました。`);
		} catch {
			setError("通信エラーが発生しました。");
		} finally {
			setIsDeleting(false);
		}
	};

	const isBusy = isUploading || isDeleting;

	return (
		<>
			<form onSubmit={handleSubmit} className="upload-form">
				<input type="file" name="file" accept=".txt,text/plain" />
				<div className="upload-actions">
					<button type="submit" disabled={isBusy}>
						{isUploading ? "Uploading..." : "Upload"}
					</button>
					<button type="button" onClick={handleDeleteAll} disabled={isBusy}>
						{isDeleting ? "Deleting..." : "全て削除"}
					</button>
				</div>
			</form>

			{error && <p>{error}</p>}
			{result && <p>{result}</p>}
		</>
	);
}
