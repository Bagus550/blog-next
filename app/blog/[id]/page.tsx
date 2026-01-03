import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";
import ShareButtons from "@/components/ShareButtons";

export default async function BlogDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { data: post, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !post) {
    return notFound();
  }

  return (
    // Background pake biru super soft (#F0F7FF) biar senada sama Home
    <main className="min-h-screen bg-[#F0F7FF] dark:bg-gray-950 text-slate-800 dark:text-gray-100 p-4 sm:p-8 md:p-20 font-sans transition-colors duration-500">
      <div className="max-w-3xl mx-auto">
        {/* Navigasi: Warna biru yang lebih kalem */}
        <Link
          href="/"
          className="text-blue-400 dark:text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 font-bold mb-6 md:mb-10 inline-flex items-center gap-2 transition-colors text-sm md:text-base group"
        >
          <span className="group-hover:-translate-x-1 transition-transform">
            ←
          </span>{" "}
          Kembali ke Beranda
        </Link>

        {post.image_url && (
          <div className="relative w-full mb-8 md:mb-12">
            <img
              src={post.image_url}
              alt={post.title}
              // Rounded dibikin curvy biar estetik
              className="w-full h-auto max-h-[500px] object-cover rounded-[2.5rem] shadow-xl shadow-blue-200/50 dark:shadow-none border border-white dark:border-gray-800"
            />
          </div>
        )}

        {/* Judul: Pake Slate biar ga terlalu tajem di mata */}
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 leading-[1.1] tracking-tighter">
          {post.title}
        </h1>

        {/* Info Penulis: Dibuat lebih modern pake aksen biru */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8 md:mb-10 pb-8 md:pb-10 border-b border-blue-100 dark:border-gray-800">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-xl shrink-0 uppercase border border-blue-200/50 dark:border-blue-800/50">
              {(post.author_name || post.title).charAt(0)}
            </div>
            <div>
              <p className="font-black text-slate-800 dark:text-gray-100 text-sm md:text-base">
                {post.author_name || "Admin"}
              </p>
              <p className="text-xs md:text-sm text-blue-400 dark:text-blue-500 font-medium uppercase tracking-wider">
                {new Date(post.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Konten Utama: Prose blue biar link-nya auto biru keren */}
        <article
          className="prose prose-sm sm:prose-lg md:prose-xl prose-blue dark:prose-invert max-w-none 
          prose-headings:text-slate-900 dark:prose-headings:text-white prose-headings:font-black prose-headings:tracking-tighter 
          prose-p:text-slate-600 dark:prose-p:text-gray-300 prose-p:leading-relaxed 
          prose-img:rounded-[2rem] prose-pre:rounded-2xl prose-pre:bg-slate-900
          prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50/50 dark:prose-blockquote:bg-blue-900/10 prose-blockquote:py-1 prose-blockquote:rounded-r-xl"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <ShareButtons postTitle={post.title} postId={post.id} />

        {/* Footer Kecil biar manis */}
        <div className="mt-20 pt-10 border-t border-blue-50 dark:border-gray-900 text-center">
          <p className="text-blue-200 dark:text-gray-800 text-xs font-bold tracking-widest uppercase">
            Terima kasih sudah membaca bray!
          </p>
        </div>
      </div>
    </main>
  );
}
