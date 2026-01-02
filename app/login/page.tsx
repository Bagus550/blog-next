"use client";
import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Bikin client browser di sini bray
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password.trim(),
    });

    if (error) {
      alert("Gagal login bray: " + error.message);
      setLoading(false);
    } else {
      // REFRESH dulu biar proxy.ts baca cookie terbaru
      router.refresh();

      // Kasih delay dikit biar proses tulis cookie kelar
      setTimeout(() => {
        router.push("/admin");
      }, 150);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-6 font-sans">
      <div className="w-full max-w-md bg-white p-10 rounded-[2.5rem] shadow-2xl border border-gray-100">
        <h1 className="text-3xl font-black mb-6 tracking-tighter text-center">
          LOGIN ADMIN 🔐
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 tracking-widest">
              Email
            </label>
            <input
              type="email"
              value={email}
              placeholder="email kamu"
              className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-black transition-all"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 tracking-widest">
              Password
            </label>
            <input
              type="password"
              value={password}
              placeholder="Password Kamu"
              className="w-full p-4 bg-gray-50 rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-black transition-all"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-4 rounded-2xl font-bold hover:scale-[1.01] active:scale-95 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg"
          >
            {loading ? "PROSES BRAY..." : "MASUK SEKARANG"}
          </button>
        </form>
      </div>
    </main>
  );
}
