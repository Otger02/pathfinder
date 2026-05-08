"use client";

import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase-browser";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Surface the "forbidden" message when the middleware redirects an
  // authenticated-but-non-admin user back here.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("error") === "forbidden") {
      setError(
        "Aquest compte no té permisos d'administrador. Si creus que es tracta d'un error, contacta amb la Fundació."
      );
    }
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createBrowserSupabase();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f5f5",
        fontFamily: "system-ui",
      }}
    >
      <div
        style={{
          width: 360,
          padding: 32,
          background: "#fff",
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ margin: "0 0 4px", fontSize: 22 }}>Pathfinder Admin</h1>
        <p style={{ margin: "0 0 24px", color: "#666", fontSize: 14 }}>
          Inicia sessió per accedir al dashboard
        </p>

        <form onSubmit={handleSubmit}>
          <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: 500 }}>
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              width: "100%",
              padding: 8,
              fontSize: 15,
              border: "1px solid #ddd",
              borderRadius: 4,
              marginBottom: 16,
              boxSizing: "border-box",
            }}
          />

          <label style={{ display: "block", marginBottom: 4, fontSize: 14, fontWeight: 500 }}>
            Contrasenya
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              width: "100%",
              padding: 8,
              fontSize: 15,
              border: "1px solid #ddd",
              borderRadius: 4,
              marginBottom: 24,
              boxSizing: "border-box",
            }}
          />

          {error && (
            <p style={{ color: "#d32f2f", fontSize: 14, margin: "0 0 16px" }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: 10,
              fontSize: 15,
              fontWeight: 600,
              background: loading ? "#999" : "#1976d2",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Entrant..." : "Entrar"}
          </button>
        </form>
      </div>
    </div>
  );
}
