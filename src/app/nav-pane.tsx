import Link from "next/link";
import { cookies } from "next/headers";
import ThemeToggle from "./theme-toggle";
import { AUTH_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

const navItems = [
	{ href: "/search", label: "検索" },
	{ href: "/view", label: "閲覧" },
	{ href: "/random", label: "ランダム表示" },
	{ href: "/upload", label: "アップロード" },
];

export default async function NavPane() {
	const cookieStore = await cookies();
	const token = cookieStore.get(AUTH_COOKIE_NAME)?.value;
	const isAuthenticated = token ? await verifySessionToken(token) : false;

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
			<div className="mt-6">
				{isAuthenticated ? (
					<form action="/api/auth/logout" method="post">
						<button
							type="submit"
							className="rounded border border-[var(--border)] px-3 py-2 text-sm"
						>
							ログアウト
						</button>
					</form>
				) : (
					<Link
						href="/login"
						className="inline-block rounded border border-[var(--border)] px-3 py-2 text-sm"
					>
						ログイン
					</Link>
				)}
			</div>
		</aside>
	);
}
