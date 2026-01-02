import { supabase } from "@/lib/supabase";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.log("Error:", error);
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-red-500 font-bold p-10">
        Error: {error.message}
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 text-black p-6 md:p-12 font-sans">
      <div className="max-w-3xl mx-auto">
        {/* Header Kece */}
        <header className="flex justify-between items-center mb-16">
          <div className="flex flex-col">
            <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">
              BagusBlog
            </h1>
            <p className="text-gray-400 font-medium mt-1">
              Tempat berbagi cerita random.
            </p>
          </div>
          <Link
            href="/admin"
            className="bg-black text-white px-5 py-2.5 rounded-full text-sm font-bold hover:scale-105 transition-transform shadow-lg"
          >
            Admin
          </Link>
        </header>

        {/* List Postingan */}
        <div className="flex flex-col gap-16">
          {posts && posts.length > 0 ? (
            posts.map((post: any) => (
              <article
                key={post.id}
                className="group relative bg-white p-6 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                {post.image_url && (
                  <div className="mb-8 overflow-hidden rounded-4xl bg-gray-100 aspect-video border border-gray-50">
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                  </div>
                )}

                <div className="px-2">
                  <Link href={`/blog/${post.id}`}>
                    <h2 className="text-3xl font-black text-gray-900 mb-4 hover:text-blue-600 transition-colors cursor-pointer leading-tight">
                      {post.title}
                    </h2>
                  </Link>

                  {/* INI KUNCI SAKTINYA BRAY: Render HTML + Styling Typography */}
                  <div
                    className="prose prose-blue prose-lg text-gray-600 leading-relaxed line-clamp-3 mb-8 max-w-none"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />

                  <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-gray-300 font-black uppercase tracking-widest">
                        Post Date
                      </span>
                      <span className="text-sm text-gray-400 font-bold">
                        {new Date(post.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <Link
                      href={`/blog/${post.id}`}
                      className="h-10 w-10 flex items-center justify-center bg-gray-100 rounded-full group-hover:bg-blue-600 group-hover:text-white transition-all"
                    >
                      <span className="group-hover:translate-x-0.5 transition-transform">
                        →
                      </span>
                    </Link>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="text-center p-20 border-4 border-dotted border-gray-200 rounded-[3rem] bg-white shadow-inner">
              <p className="text-gray-400 text-xl font-medium">
                Belum ada postingan nih. <br />
                <Link
                  href="/admin"
                  className="text-blue-500 font-black hover:underline mt-4 inline-block"
                >
                  Mulai nulis sekarang!
                </Link>
              </p>
            </div>
          )}
        </div>

        <footer className="mt-24 pb-12 text-center text-gray-300 text-sm font-bold tracking-widest uppercase">
          © 2026 BagusBlog — Made with Next.js
        </footer>
      </div>
    </main>
  );
}
