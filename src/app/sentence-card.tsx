"use client";

type SentenceCardProps = {
	content: string;
};

export default function SentenceCard({ content }: SentenceCardProps) {
	return <li className="sentence-card">{content}</li>;
}
