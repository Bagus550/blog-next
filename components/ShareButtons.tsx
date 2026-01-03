"use client"; // Wajib ada biar fitur klik-klik jalan bray!

import { useState } from "react";

export default function ShareButtons({ postTitle, postId }: { postTitle: string, postId: string }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `https://bagusblog.vercel.app/blog/${postId}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Balik lagi setelah 2 detik
    } catch (err) {
      console.error("Gagal salin link bray!", err);
    }
  };

  return (
    <div className="mt-12 p-6 bg-white dark:bg-gray-900 rounded-[2rem] border border-blue-100 dark:border-gray-800 flex flex-col items-center gap-4 shadow-sm">
      <p className="text-slate-500 dark:text-gray-400 font-bold text-sm">
        Suka ceritanya? Bagikan ke temen lu bray!
      </p>
      
      <div className="flex flex-wrap justify-center gap-3">
        {/* Tombol WhatsApp */}
        <a
          href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
            `Cek postingan seru ini di BagusBlog: ${postTitle} \n\nBaca selengkapnya di: ${shareUrl}`
          )}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 bg-[#25D366] hover:bg-[#20ba5a] text-white px-6 py-3 rounded-2xl font-black text-sm transition-all hover:scale-105 active:scale-95"
        >
          Share WA
        </a>

        {/* Tombol Copy Link */}
        <button
          onClick={handleCopy}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all active:scale-95 ${
            copied 
              ? "bg-blue-500 text-white" 
              : "bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200"
          }`}
        >
          {copied ? "Link Tersalin! 🔥" : "Salin Link"}
        </button>
      </div>
    </div>
  );
}