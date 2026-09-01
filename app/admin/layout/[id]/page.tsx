import {notFound} from "next/navigation";
import {PrintStudio} from "@/components/print-studio";
import {getSubmission} from "@/lib/data";
import "../studio.css";
export const dynamic="force-dynamic";
export default async function StudioPage({params}:PageProps<"/admin/layout/[id]">){const {id}=await params;if(id==="new")return <PrintStudio initial={[]} />;const entry=await getSubmission(id);if(!entry)notFound();const images=(entry.submission_files??[]).filter(file=>file.mime_type.startsWith("image/")&&file.signed_url).map(file=>({id:file.id,url:file.signed_url!,name:file.file_name}));return <PrintStudio initial={images} title={entry.customer_name?`${entry.customer_name}'s files`:"Customer files"}/>}
