"use client";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
export function SignOut() {
  const router = useRouter();
  return (
    <button
      className="side-signout"
      onClick={async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
      }}
    >
      <LogOut size={16} />
      Sign out
    </button>
  );
}
