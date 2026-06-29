import { useState } from "react";
import { useNavigate } from "react-router";
import { useAdminAuth } from "@/hooks/useAdminAuth";

export default function LoginPage() {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const { login, isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    navigate("/admin");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!key.trim()) {
      setError("Zəhmət olmasa admin açar sözünü daxil edin");
      return;
    }
    if (await login(key.trim())) navigate("/admin");
    else setError("Yanlış admin açar sözü. Yenidən cəhd edin.");
  };

  return (
    <div dir="ltr" className="min-h-screen flex items-center justify-center px-4" style={{ background: "#14110e" }}>
      <div className="w-full max-w-md">
        <div className="rounded-2xl p-8 border" style={{ background: "#1d1915", borderColor: "#352d24" }}>
          <div className="text-center mb-8">
            <img src="/brand/logo-gold.png" alt="Xurcun" className="h-12 mx-auto mb-5" />
            <h1 className="text-xl tracking-[0.2em] uppercase mb-2" style={{ color: "#C2A05A", fontFamily: "Rufolo, serif", fontWeight: 700 }}>
              Admin Panel
            </h1>
            <p className="text-sm" style={{ color: "#928876" }}>
              İdarə panelinə giriş üçün admin açar sözünü daxil edin
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              autoFocus
              placeholder="Admin açar sözü"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="w-full rounded-lg px-4 py-3 text-sm outline-none transition"
              style={{ background: "#16120e", border: "1px solid #352d24", color: "#ECE6DA" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "#9D7C38")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "#352d24")}
            />
            {error && (
              <p className="text-sm p-3 rounded-lg" style={{ color: "#e0697a", background: "#2c1418" }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              className="w-full rounded-lg py-3 text-sm font-semibold transition"
              style={{ background: "#9D7C38", color: "#1a140a" }}
              onMouseOver={(e) => (e.currentTarget.style.background = "#C2A05A")}
              onMouseOut={(e) => (e.currentTarget.style.background = "#9D7C38")}
            >
              Giriş
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/" className="text-sm transition" style={{ color: "#6c6353" }}>
              ← Sayta qayıt
            </a>
          </div>
        </div>
        <p className="text-center mt-5 text-[11px] tracking-[0.3em] uppercase" style={{ color: "#5a5446" }}>
          Xurcun · Fond of Quality
        </p>
      </div>
    </div>
  );
}
