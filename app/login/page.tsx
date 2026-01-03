"use client";
import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
    <main className="min-h-screen flex items-center justify-center bg-gray-50 p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md bg-white p-6 sm:p-10 rounded-4xl sm:rounded-[2.5rem] shadow-2xl border border-gray-100">
        <h1 className="text-2xl sm:text-3xl font-black mb-6 sm:mb-8 tracking-tighter text-center">
          LOGIN ADMIN 🔐
        </h1>

        <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 tracking-widest">
              Email
            </label>
            <input
              type="email"
              value={email}
              placeholder="email kamu"
              className="w-full p-3.5 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-black transition-all text-sm sm:text-base"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 uppercase ml-2 tracking-widest">
              Password
            </label>
            <input
              type="password"
              value={password}
              placeholder="Password Kamu"
              className="w-full p-3.5 sm:p-4 bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-100 outline-none focus:ring-2 focus:ring-black transition-all text-sm sm:text-base"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold hover:scale-[1.01] active:scale-95 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed shadow-lg text-sm sm:text-base mt-2"
          >
            {loading ? "PROSES BRAY..." : "MASUK SEKARANG"}
          </button>
        </form>

        {/* Opsional: Tombol balik ke home biar user gak kejebak */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs font-bold text-gray-300 hover:text-black transition-colors uppercase tracking-widest"
          >
            ← Balik ke Blog
          </Link>
        </div>
      </div>
    </main>
  );
}
