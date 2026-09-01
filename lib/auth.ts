import "server-only";
import {redirect} from "next/navigation";
import {hasSupabaseEnv} from "./supabase/env";
import {createClient} from "./supabase/server";
export async function getAdmin(){if(!hasSupabaseEnv)return null;const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)return null;const allowed=(process.env.ADMIN_EMAILS??"").split(",").map(e=>e.trim().toLowerCase()).filter(Boolean);if(allowed.length&&!allowed.includes((user.email??"").toLowerCase()))return null;return user;}
export async function requireAdmin(){const user=await getAdmin();if(!user)redirect("/login");return user;}
