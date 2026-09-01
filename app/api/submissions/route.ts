import {NextResponse} from "next/server";
import {createAdminClient} from "@/lib/supabase/admin";

export const runtime="nodejs";
const MAX_FILES=12,MAX_BYTES=20*1024*1024;
const allowed=["image/","application/pdf","application/msword","application/vnd.openxmlformats-officedocument","application/vnd.ms-powerpoint","application/vnd.openxmlformats-officedocument.presentationml"];
const clean=(value:FormDataEntryValue|null,max:number)=>typeof value==="string"?value.trim().slice(0,max):"";
export async function POST(request:Request){
 try{
  const form=await request.formData();const files=form.getAll("files").filter((item):item is File=>item instanceof File&&item.size>0);
  if(!files.length||files.length>MAX_FILES)return NextResponse.json({error:`Choose between 1 and ${MAX_FILES} files.`},{status:400});
  if(files.some(file=>file.size>MAX_BYTES))return NextResponse.json({error:"Each file must be 20 MB or smaller."},{status:400});
  if(files.some(file=>!allowed.some(type=>file.type.startsWith(type))))return NextResponse.json({error:"One or more file types are not supported."},{status:400});
  const supabase=createAdminClient();const id=crypto.randomUUID();const submission={id,customer_name:clean(form.get("name"),80)||null,customer_email:clean(form.get("email"),160)||null,notes:clean(form.get("notes"),800)||null,status:"pending"};
  const {error:submissionError}=await supabase.from("submissions").insert(submission);if(submissionError)throw submissionError;
  const uploaded:string[]=[];
  try{for(const [index,file] of files.entries()){const safeName=file.name.replace(/[^a-zA-Z0-9._-]/g,"-").slice(-140)||`file-${index}`;const path=`${id}/${String(index+1).padStart(2,"0")}-${safeName}`;const bytes=await file.arrayBuffer();const {error:uploadError}=await supabase.storage.from("print-files").upload(path,bytes,{contentType:file.type||"application/octet-stream",upsert:false});if(uploadError)throw uploadError;uploaded.push(path);const {error:fileError}=await supabase.from("submission_files").insert({submission_id:id,file_name:file.name.slice(0,220),storage_path:path,mime_type:file.type||"application/octet-stream",byte_size:file.size});if(fileError)throw fileError;}}
  catch(error){if(uploaded.length)await supabase.storage.from("print-files").remove(uploaded);await supabase.from("submissions").delete().eq("id",id);throw error}
  return NextResponse.json({id},{status:201});
 }catch(error){console.error("Submission upload failed",error);return NextResponse.json({error:"We couldn't upload your files. Check the Supabase setup and try again."},{status:500})}
}
