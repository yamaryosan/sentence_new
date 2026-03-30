"use client";

import { type SubmitEventHandler } from "react";
import { useUploadActions } from "./use-upload-actions";

export default function UploadForm() {
	const {
		result,
		error,
		isUploading,
		isDeleting,
		isBusy,
		uploadFromForm,
		deleteAllRecords,
	} = useUploadActions();

	const handleSubmit: SubmitEventHandler<HTMLFormElement> = (event) => {
		event.preventDefault();
		uploadFromForm(event.currentTarget);
	};

	const handleDeleteAll = () => {
		const shouldDelete = window.confirm("本当に削除しますか？");
		if (!shouldDelete) {
			return;
		}

		deleteAllRecords();
	};

	return (
		<>
			<form onSubmit={handleSubmit} className="upload-form">
				<input type="file" name="file" accept=".txt,text/plain" />
				<div className="upload-actions">
					<button type="submit" disabled={isBusy}>
						{isUploading ? "Uploading..." : "Upload"}
					</button>
					<button type="button" onClick={handleDeleteAll} disabled={isBusy}>
						{isDeleting ? "Deleting..." : "全て削除"}
					</button>
				</div>
			</form>

			{error && <p>{error}</p>}
			{result && <p>{result}</p>}
		</>
	);
}
