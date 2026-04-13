"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { ApiErrorResponseSchema } from "@/lib/api-schemas/common";
import { UploadCountResponseSchema } from "@/lib/api-schemas/upload";

type UploadResponse = { count: number } | { error: string };

async function readUploadResponse(response: Response): Promise<UploadResponse> {
	const bodyText = await response.text();
	if (bodyText.length === 0) {
		throw new Error(
			"サーバーから空のレスポンスが返されました。時間をおいて再試行してください。",
		);
	}

	try {
		const parsed: unknown = JSON.parse(bodyText);
		const success = UploadCountResponseSchema.safeParse(parsed);
		if (success.success) {
			return success.data;
		}

		const failure = ApiErrorResponseSchema.safeParse(parsed);
		if (failure.success) {
			return failure.data;
		}

		throw new Error("サーバー応答の形式が不正です。");
	} catch (error) {
		if (error instanceof SyntaxError) {
			throw new Error("サーバー応答の解析に失敗しました。");
		}

		if (error instanceof Error) {
			throw error;
		}

		throw new Error("サーバー応答の解析に失敗しました。");
	}
}

async function uploadSentences(formData: FormData): Promise<number> {
	const response = await fetch("/api/upload", {
		method: "POST",
		body: formData,
	});
	const data = await readUploadResponse(response);

	if (!response.ok || "error" in data) {
		throw new Error("error" in data ? data.error : "アップロードに失敗しました。");
	}

	return data.count;
}

async function deleteAllSentences(): Promise<number> {
	const response = await fetch("/api/upload", {
		method: "DELETE",
	});
	const data = await readUploadResponse(response);

	if (!response.ok || "error" in data) {
		throw new Error("error" in data ? data.error : "削除に失敗しました。");
	}

	return data.count;
}

export function useUploadActions() {
	const [result, setResult] = useState("");
	const [error, setError] = useState("");

	const uploadMutation = useMutation<number, Error, FormData>({
		mutationFn: uploadSentences,
		onMutate: () => {
			setError("");
			setResult("");
		},
		onSuccess: (count) => {
			setResult(`${count}件のレコードを保存しました。`);
		},
		onError: (caughtError) => {
			setError(caughtError.message);
		},
	});

	const deleteMutation = useMutation<number, Error, void>({
		mutationFn: deleteAllSentences,
		onMutate: () => {
			setError("");
			setResult("");
		},
		onSuccess: (count) => {
			setResult(`${count}件のレコードを削除しました。`);
		},
		onError: (caughtError) => {
			setError(caughtError.message);
		},
	});

	const uploadFromForm = (form: HTMLFormElement) => {
		const formData = new FormData(form);
		const file = formData.get("file");

		if (!(file instanceof File) || file.size === 0) {
			setError("txtファイルを1つ選択してください。");
			return;
		}

		uploadMutation.mutate(formData);
	};

	const deleteAllRecords = () => {
		deleteMutation.mutate();
	};

	return {
		result,
		error,
		isUploading: uploadMutation.isPending,
		isDeleting: deleteMutation.isPending,
		isBusy: uploadMutation.isPending || deleteMutation.isPending,
		uploadFromForm,
		deleteAllRecords,
	};
}
