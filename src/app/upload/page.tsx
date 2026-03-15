import { cookies } from "next/headers";
import UploadForm from "./upload-form";
import VerifyForm from "./verify-form";

const VERIFY_COOKIE_NAME = "upload_verified";

export default async function UploadPage() {
	const cookieStore = await cookies();
	const isVerified = cookieStore.get(VERIFY_COOKIE_NAME)?.value === "true";

	return isVerified ? <UploadForm /> : <VerifyForm />;
}
