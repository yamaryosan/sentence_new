"use client";

import SwaggerUI from "swagger-ui-react";

type SwaggerUiClientProps = {
	url: string;
};

export default function SwaggerUiClient({ url }: SwaggerUiClientProps) {
	return (
		<SwaggerUI
			url={url}
			docExpansion="list"
			defaultModelsExpandDepth={-1}
		/>
	);
}
