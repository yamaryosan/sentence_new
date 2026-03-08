"use client";

export default function ScrollToTopButton() {
	return (
		<button
			type="button"
			className="scroll-to-top"
			aria-label="ページのトップへ戻る"
			title="ページのトップへ戻る"
			onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
		>
			<span className="scroll-to-top-icon" aria-hidden="true">
				<svg viewBox="0 0 24 24" focusable="false">
					<path
						d="M12 19V5M5.5 11.5 12 5l6.5 6.5"
						fill="none"
						stroke="currentColor"
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth="1.8"
					/>
				</svg>
			</span>
		</button>
	);
}
