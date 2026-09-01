import Link from "next/link";
import { redirect } from "next/navigation";
import { Brand } from "@/components/brand";
import { LoginForm } from "@/components/login-form";
import { getAdmin } from "@/lib/auth";
import "./login.css";
export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");
  return (
    <main className="login-page">
      <header className="shell topbar">
        <Brand />
        <Link className="nav-link" href="/">
          ← Back to upload
        </Link>
      </header>
      <div className="login-wrap">
        <div className="login-note">
          <p className="display">A quieter way to run your print queue.</p>
          <span>Review. Arrange. Print.</span>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
