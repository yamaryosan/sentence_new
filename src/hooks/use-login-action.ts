"use client";

import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type LoginResponse = { ok?: boolean; error?: string };

async function login(password: string): Promise<void> {
	const response = await fetch("/api/auth/login", {
		method: "POST",
		headers: {
			"content-type": "application/json",
		},
		body: JSON.stringify({ password }),
	});
	const data = (await response.json()) as LoginResponse;

	if (!response.ok) {
		throw new Error(data.error ?? "ログインに失敗しました。");
	}
}

export function useLoginAction() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [errorMessage, setErrorMessage] = useState<string | null>(null);

	const loginMutation = useMutation<void, Error, string>({
		mutationFn: login,
		onMutate: () => {
			setErrorMessage(null);
		},
		onSuccess: () => {
			const nextPath = searchParams.get("next") ?? "/search";
			router.replace(nextPath);
			router.refresh();
		},
		onError: (error) => {
			setErrorMessage(error.message);
		},
	});

	return {
		errorMessage,
		isSubmitting: loginMutation.isPending,
		submitLogin: (password: string) => loginMutation.mutate(password),
	};
}
