import LoginForm from "./login-form";

export default function LoginPage() {
	return (
		<>
			<h1>ログイン</h1>
			<p>
				トップページ以外を閲覧するにはパスワードが必要です。直近15分で5回まで失敗可能で、6回目以降は時間経過で順次解除されます。
			</p>
			<LoginForm />
		</>
	);
}
