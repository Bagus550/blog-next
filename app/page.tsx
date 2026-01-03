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
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 text-red-500 font-bold p-10">
        Error: {error.message}
      </div>
    );
  }

  return (
    // Main background dibikin dark-ready
    <main className="min-h-screen bg-gray-50 dark:bg-gray-950 text-black dark:text-white p-4 sm:p-8 md:p-12 font-sans transition-colors duration-500">
      <div className="max-w-3xl mx-auto">
        {/* Header: Judul dibikin lebih 'pop' di mode gelap */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12 md:mb-16">
          <div className="flex flex-col">
            <h1 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tighter">
              BagusBlog
            </h1>
            <p className="text-gray-400 dark:text-gray-500 font-medium mt-1 text-sm md:text-base">
              Tempat berbagi cerita random.
            </p>
          </div>
          <Link
            href="/admin"
            className="bg-black dark:bg-white text-white dark:text-black px-6 py-2.5 rounded-full text-sm font-bold hover:scale-105 transition-all shadow-lg active:scale-95"
          >
            Admin
          </Link>
        </header>

        {/* List Postingan */}
        <div className="flex flex-col gap-10 md:gap-16">
          {posts && posts.length > 0 ? (
            posts.map((post: any) => (
              <article
                key={post.id}
                className="group relative bg-white dark:bg-gray-900 p-5 md:p-8 rounded-4xl md:rounded-[2.5rem] border border-gray-100 dark:border-gray-800 shadow-sm hover:shadow-2xl hover:shadow-blue-500/10 dark:hover:shadow-blue-500/5 transition-all duration-500"
              >
                {post.image_url && (
                  <div className="mb-6 md:mb-8 overflow-hidden rounded-2xl md:rounded-4xl bg-gray-100 dark:bg-gray-800 aspect-video border border-gray-50 dark:border-gray-800">
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                )}

                <div className="px-1 md:px-2">
                  <Link href={`/blog/${post.id}`}>
                    <h2 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-3 md:mb-4 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer leading-tight">
                      {post.title}
                    </h2>
                  </Link>

                  {/* Prose-invert biar teks HTML otomatis putih di dark mode */}
                  <div
                    className="prose prose-sm md:prose-lg dark:prose-invert prose-blue text-gray-600 dark:text-gray-400 leading-relaxed line-clamp-3 mb-6 md:mb-8 max-w-none"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />

                  <div className="flex items-center justify-between pt-5 md:pt-6 border-t border-gray-50 dark:border-gray-800">
                    <div className="flex flex-col">
                      <span className="text-[9px] md:text-[10px] text-gray-300 dark:text-gray-600 font-black uppercase tracking-widest">
                        Post Date
                      </span>
                      <span className="text-xs md:text-sm text-gray-400 dark:text-gray-500 font-bold">
                        {new Date(post.created_at).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <Link
                      href={`/blog/${post.id}`}
                      className="h-10 w-10 flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 rounded-full group-hover:bg-blue-600 dark:group-hover:bg-blue-500 group-hover:text-white transition-all"
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
            // Empty State yang cakep di dua mode
            <div className="text-center p-10 md:p-20 border-4 border-dotted border-gray-200 dark:border-gray-800 rounded-4xl md:rounded-[3rem] bg-white dark:bg-gray-900 shadow-inner">
              <p className="text-gray-400 dark:text-gray-500 text-lg md:text-xl font-medium">
                Belum ada postingan nih. <br />
                <Link
                  href="/admin"
                  className="text-blue-500 dark:text-blue-400 font-black hover:underline mt-4 inline-block"
                >
                  Mulai nulis sekarang!
                </Link>
              </p>
            </div>
          )}
        </div>

        <footer className="mt-16 md:mt-24 pb-12 text-center text-gray-300 dark:text-gray-700 text-[10px] md:text-sm font-bold tracking-widest uppercase">
          © 2026 BagusBlog — Made with Next.js
        </footer>
      </div>
    </main>
  );
}
