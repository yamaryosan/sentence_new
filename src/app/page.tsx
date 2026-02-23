import Link from "next/link";

export default function Home() {
	return (
		<div>
			<main>
				<p>アップロード画面は以下から開けます。</p>
				<p>
					<Link href="/upload">/upload</Link>
				</p>
			</main>
		</div>
	);
}
