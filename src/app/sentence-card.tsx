"use client";

import { useState } from "react";

type SentenceCardProps = {
	content: string;
};

type CopyState = "idle" | "success" | "error";

export default function SentenceCard({ content }: SentenceCardProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const [copyState, setCopyState] = useState<CopyState>("idle");
	const isLong = content.length > 200;
	const displayContent =
		isLong && !isExpanded ? `${content.slice(0, 200)}…` : content;
	const copyLabel =
		copyState === "success"
			? "コピー済み"
			: copyState === "error"
				? "コピー失敗"
				: "コピー";
	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(content);
			setCopyState("success");
			window.setTimeout(() => setCopyState("idle"), 1500);
		} catch {
			setCopyState("error");
			window.setTimeout(() => setCopyState("idle"), 1500);
		}
	};

	return (
		<li className="sentence-card-item">
			<div className="sentence-card">
				{isLong && !isExpanded ? (
					<button
						type="button"
						className="sentence-card-trigger"
						onClick={() => setIsExpanded(true)}
					>
						{displayContent}
					</button>
				) : (
					content
				)}
			</div>
			<div className="sentence-card-actions">
				<button
					type="button"
					className="sentence-card-copy"
					aria-label={copyLabel}
					title={copyLabel}
					onClick={() => void handleCopy()}
				>
					{copyState === "success" ? (
						<span aria-hidden="true">✓</span>
					) : copyState === "error" ? (
						<span aria-hidden="true">!</span>
					) : (
						<span aria-hidden="true">⧉</span>
					)}
				</button>
			</div>
		</li>
	);
}
