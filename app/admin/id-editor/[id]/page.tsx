import {notFound} from "next/navigation";
import {IdPhotoEditor} from "@/components/id-photo-editor";
import {getSubmission} from "@/lib/data";
import "../id-editor.css";

export const dynamic = "force-dynamic";

export default async function IdEditorPage({params}:PageProps<"/admin/id-editor/[id]">) {
  const {id} = await params;
  if (id === "new") return <IdPhotoEditor/>;
  const entry = await getSubmission(id);
  if (!entry) notFound();
  const file = entry.submission_files?.find((item) => item.mime_type.startsWith("image/") && item.signed_url);
  return <IdPhotoEditor initial={file ? {url:file.signed_url!,name:file.file_name} : undefined} title={entry.customer_name ? `${entry.customer_name}'s ID sheet` : "Customer ID sheet"}/>;
}
