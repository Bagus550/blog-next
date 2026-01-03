export default function Loading() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-white">
      <div className="relative w-16 h-16">
        <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
      </div>
      
      <h2 className="mt-6 text-xl font-black uppercase tracking-tighter animate-pulse">
        Sabar Cuyy, Lagi OTW... 🚀
      </h2>
      <p className="text-gray-400 text-sm font-bold">Lagi ngeracik konten buat lu</p>
    </div>
  );
}