export default function Loading() {
  return (
    // Tambahin bg-white dark:bg-gray-950 biar ngikut tema
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white dark:bg-gray-950 transition-colors duration-500">
      <div className="relative w-16 h-16">
        {/* Border dasar jadi lebih gelap dikit di mode dark */}
        <div className="absolute inset-0 border-4 border-gray-100 dark:border-gray-800 rounded-full"></div>
        {/* Spinner tetep biru biar cakep */}
        <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
      </div>

      {/* Text judul ganti warna jadi putih pas dark mode */}
      <h2 className="mt-6 text-xl font-black uppercase tracking-tighter animate-pulse text-gray-900 dark:text-white">
        Sabar Cuyy, Lagi OTW... 🚀
      </h2>

      {/* Sub-text abu-abunya kita sesuaikan dikit */}
      <p className="text-gray-400 dark:text-gray-500 text-sm font-bold">
        Lagi ngeracik konten buat lu
      </p>
    </div>
  );
}
