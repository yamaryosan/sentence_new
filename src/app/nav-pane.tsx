import Link from "next/link";
import ThemeToggle from "./theme-toggle";

const navItems = [
	{ href: "/search", label: "検索" },
	{ href: "/view", label: "閲覧" },
	{ href: "/random", label: "ランダム表示" },
	{ href: "/upload", label: "アップロード" },
];

export default function NavPane() {
	return (
		<aside className="order-1 border-b border-[var(--border)] bg-[var(--surface)] p-4 md:order-2 md:w-[360px] md:flex-shrink-0 md:border-b-0 md:border-l md:p-6">
			<ThemeToggle />
			<h2 className="mb-4 text-lg font-semibold">メニュー</h2>
			<nav aria-label="ページリンク">
				<ul className="m-0 list-disc space-y-2 pl-5 text-base leading-7 md:text-lg">
					{navItems.map((item) => (
						<li key={item.href}>
							<Link href={item.href}>{item.label}</Link>
						</li>
					))}
				</ul>
			</nav>
		</aside>
	);
}
