import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { notFound } from "next/navigation";

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
    <main className="min-h-screen bg-white text-black p-4 sm:p-8 md:p-20 font-sans">
      <div className="max-w-3xl mx-auto">
        {/* Navigasi: Text lebih kecil di mobile biar nggak menu-menuhin layar */}
        <Link
          href="/"
          className="text-gray-400 hover:text-black font-bold mb-6 md:mb-10 block transition-colors text-sm md:text-base"
        >
          ← Kembali ke Beranda
        </Link>

        {post.image_url && (
          <div className="relative w-full mb-8 md:mb-12">
            <img
              src={post.image_url}
              alt={post.title}
              // max-h kita turunin di mobile biar nggak kegedean pas di-scroll
              className="w-full h-auto max-h-75 md:max-h-125 object-cover rounded-4xl md:rounded-[2.5rem] shadow-2xl"
            />
          </div>
        )}

        {/* Judul: Font size beneran kita bedain jauh antara mobile vs desktop */}
        <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-gray-900 mb-6 leading-[1.1] tracking-tighter">
          {post.title}
        </h1>

        {/* Info Penulis: Stack di mobile, row di tablet ke atas */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8 md:mb-10 pb-8 md:pb-10 border-b border-gray-100">
          <div className="flex items-center gap-4">
            <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg md:text-xl shrink-0">
              {post.title.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-gray-900 text-sm md:text-base">
                Admin Kece
              </p>
              <p className="text-xs md:text-sm text-gray-400">
                {new Date(post.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Konten Utama: Prose bakal otomatis handle responsive kalau lu pake plugin typography */}
        <article
          className="prose prose-sm sm:prose-lg md:prose-xl prose-blue max-w-none 
          prose-headings:font-black prose-headings:tracking-tighter 
          prose-p:leading-relaxed prose-img:rounded-2xl md:prose-img:rounded-3xl
        prose-pre:bg-gray-900 prose-pre:rounded-2xl"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>
    </main>
  );
}
