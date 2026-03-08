import Link from "next/link";

export default function Home() {
	return (
		<>
			<p>検索画面は以下から開けます。</p>
			<p>
				<Link href="/search">/search</Link>
			</p>
			<p>アップロード画面は以下から開けます。</p>
			<p>
				<Link href="/upload">/upload</Link>
			</p>
			<p>閲覧画面は以下から。</p>
			<Link href="/view">/view</Link>
		</>
	);
}
