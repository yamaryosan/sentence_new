import "swagger-ui-react/swagger-ui.css";
import SwaggerUiClient from "./swagger-ui-client";

export default function DocsPage() {
	return (
		<section className="grid gap-4">
			<h2 className="m-0">API Docs</h2>
			<SwaggerUiClient url="/api/openapi" />
		</section>
	);
}
