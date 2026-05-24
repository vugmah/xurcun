import { useState } from "react";
import { useNavigate } from "react-router";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, Shield } from "lucide-react";

export default function LoginPage() {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const { login, isAuthenticated } = useAdminAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    navigate("/admin");
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!key.trim()) {
      setError("Zehmet olmasa admin acar sozunu daxil edin");
      return;
    }
    const success = login(key.trim());
    if (success) {
      navigate("/admin");
    } else {
      setError("Yanlis admin acar sozu. Yeniden cehd edin.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-[#111] border border-[#222] rounded-2xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#C9A96E]/15 mb-4">
              <Shield className="w-8 h-8 text-[#C9A96E]" />
            </div>
            <h1 className="text-[#C9A96E] font-bold text-xl tracking-widest uppercase mb-2">
              Xurcun Admin
            </h1>
            <p className="text-white/50 text-sm">
              Idarə panelinə giriş üçün admin açar sözünü daxil edin
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Admin acar sozu"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="bg-[#0A0A0A] border-[#333] text-white placeholder:text-white/30 focus:border-[#C9A96E] focus:ring-[#C9A96E]/20"
              />
            </div>
            {error && (
              <p className="text-red-400 text-sm bg-red-400/10 p-3 rounded-lg">
                {error}
              </p>
            )}
            <Button
              type="submit"
              className="w-full bg-[#C9A96E] hover:bg-[#B8985E] text-[#0A0A0A] font-semibold"
            >
              Giris
            </Button>
          </form>

          <div className="mt-6 text-center">
            <a href="/" className="text-white/40 text-sm hover:text-[#C9A96E] transition-colors">
              Siteye qayit
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
