"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, LoaderCircle, LockKeyhole } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
export function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false),
    [message, setMessage] = useState("");
  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    const data = new FormData(e.currentTarget);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({
        email: String(data.get("email")),
        password: String(data.get("password")),
      });
      if (error) throw error;
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Unable to sign in");
      setLoading(false);
    }
  };
  return (
    <form className="login-card soft-card" onSubmit={submit}>
      <div className="login-icon">
        <LockKeyhole size={23} />
      </div>
      <p className="eyebrow">Private workspace</p>
      <h1 className="display">Welcome back.</h1>
      <p className="subtle">
        Sign in to manage print jobs and prepare layouts.
      </p>
      <div className="field">
        <label htmlFor="email">Email address</label>
        <input
          className="input"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
        />
      </div>
      <div className="field">
        <label htmlFor="password">Password</label>
        <input
          className="input"
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </div>
      {message && <p className="form-error">{message}</p>}
      <button className="pill primary" disabled={loading}>
        {loading ? (
          <LoaderCircle className="spin" size={17} />
        ) : (
          <>
            Sign in <ArrowRight size={17} />
          </>
        )}
      </button>
    </form>
  );
}
