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
    <main className="min-h-screen bg-white text-black p-6 md:p-20 font-sans">
      <div className="max-w-3xl mx-auto">
        <Link
          href="/"
          className="text-gray-400 hover:text-black font-bold mb-10 block transition-colors"
        >
          ← Kembali ke Beranda
        </Link>

        {post.image_url && (
          <img
            src={post.image_url}
            alt={post.title}
            className="w-full h-auto max-h-125 object-cover rounded-[2.5rem] mb-10 shadow-2xl"
          />
        )}

        <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-6 leading-tight tracking-tighter">
          {post.title}
        </h1>

        <div className="flex items-center gap-4 mb-10 pb-10 border-b border-gray-100">
          <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl">
            {post.title.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-bold text-gray-900">Admin Kece</p>
            <p className="text-sm text-gray-400">
              {new Date(post.created_at).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        <div
          className="prose prose-lg md:prose-xl prose-blue max-w-none 
          prose-headings:font-black prose-headings:tracking-tighter 
          prose-p:leading-relaxed prose-img:rounded-3xl"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>
    </main>
  );
}
