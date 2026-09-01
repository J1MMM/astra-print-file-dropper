import {NextResponse} from "next/server";
import {getAdmin} from "@/lib/auth";
import {createAdminClient} from "@/lib/supabase/admin";
const allowed=["pending","processing","ready","completed"];
export async function PATCH(request:Request,{params}:{params:Promise<{id:string}>}){if(!await getAdmin())return NextResponse.json({error:"Unauthorized"},{status:401});const {id}=await params;const {status}=await request.json();if(!allowed.includes(status))return NextResponse.json({error:"Invalid status"},{status:400});const supabase=createAdminClient();const {error}=await supabase.from("submissions").update({status,updated_at:new Date().toISOString()}).eq("id",id);if(error)return NextResponse.json({error:error.message},{status:500});return NextResponse.json({ok:true})}
