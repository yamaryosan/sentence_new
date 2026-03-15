import Link from "next/link";
import ThemeToggle from "./theme-toggle";

export default function NavPane() {
	return (
		<aside className="order-1 border-b border-[var(--border)] bg-[var(--surface)] p-4 md:order-2 md:w-[360px] md:flex-shrink-0 md:border-b-0 md:border-l md:p-6">
			<ThemeToggle />
			<h2 className="mb-4 text-lg font-semibold">メニュー</h2>
			<nav aria-label="ページリンク">
				<ul className="m-0 list-disc pl-5">
					<li>
						<Link href="/search">/search</Link>
					</li>
					<li>
						<Link href="/view">/view</Link>
					</li>
					<li>
						<Link href="/random">/random</Link>
					</li>
					<li>
						<Link href="/upload">/upload</Link>
					</li>
				</ul>
			</nav>
		</aside>
	);
}
