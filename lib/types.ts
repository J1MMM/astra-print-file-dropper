export type SubmissionStatus = "pending" | "processing" | "ready" | "completed";
export type SubmissionFile = { id:string; submission_id:string; file_name:string; storage_path:string; mime_type:string; byte_size:number; created_at:string; signed_url?:string };
export type Submission = { id:string; customer_name:string|null; customer_email:string|null; notes:string|null; status:SubmissionStatus; created_at:string; updated_at:string; submission_files?:SubmissionFile[] };
