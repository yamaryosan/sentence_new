"use client";

import { useState } from "react";

type SentenceCardProps = {
	content: string;
};

export default function SentenceCard({ content }: SentenceCardProps) {
	const [isExpanded, setIsExpanded] = useState(false);
	const isLong = content.length > 200;
	const displayContent =
		isLong && !isExpanded ? `${content.slice(0, 200)}…` : content;

	return (
		<li className="sentence-card">
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
		</li>
	);
}
