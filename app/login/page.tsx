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
      router.refresh();
      setTimeout(() => {
        router.push("/admin");
      }, 150);
    }
  };

  return (
    // Update main background biar gak belang
    <main className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4 sm:p-6 font-sans transition-colors duration-500">
      {/* Update Card: bg-white jadi dark:bg-gray-900. text-gray-900 biar kelihatan di mode terang */}
      <div className="w-full max-w-md bg-white dark:bg-gray-900 p-6 sm:p-10 rounded-4xl sm:rounded-[2.5rem] shadow-2xl border border-gray-100 dark:border-gray-800 text-gray-900 dark:text-white transition-all">
        <h1 className="text-2xl sm:text-3xl font-black mb-6 sm:mb-8 tracking-tighter text-center uppercase">
          Login Admin 🔐
        </h1>

        <form onSubmit={handleLogin} className="space-y-4 sm:space-y-6">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase ml-2 tracking-widest">
              Email
            </label>
            <input
              type="email"
              value={email}
              placeholder="email kamu"
              // Input di dark mode: bg lebih gelap, text putih, ring menyesuaikan
              className="w-full p-3.5 sm:p-4 bg-gray-50 dark:bg-gray-950 dark:text-white rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-800 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all text-sm sm:text-base placeholder:dark:text-gray-700"
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase ml-2 tracking-widest">
              Password
            </label>
            <input
              type="password"
              value={password}
              placeholder="Password Kamu"
              className="w-full p-3.5 sm:p-4 bg-gray-50 dark:bg-gray-950 dark:text-white rounded-xl sm:rounded-2xl border border-gray-100 dark:border-gray-800 outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all text-sm sm:text-base placeholder:dark:text-gray-700"
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            // Tombol dibalik warnanya pas Dark Mode biar tetep kontras
            className="w-full bg-black dark:bg-white text-white dark:text-black py-3.5 sm:py-4 rounded-xl sm:rounded-2xl font-bold hover:scale-[1.01] active:scale-95 transition-all disabled:bg-gray-300 dark:disabled:bg-gray-800 disabled:cursor-not-allowed shadow-lg text-sm sm:text-base mt-2"
          >
            {loading ? "PROSES BRAY..." : "MASUK SEKARANG"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-xs font-bold text-gray-300 dark:text-gray-600 hover:text-black dark:hover:text-white transition-colors uppercase tracking-widest"
          >
            ← Balik ke Blog
          </Link>
        </div>
      </div>
    </main>
  );
}
