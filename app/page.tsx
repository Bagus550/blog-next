import { supabase } from "@/lib/supabase";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { data: posts, error } = await supabase
    .from("posts")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-blue-50 text-blue-600 font-bold p-10">
        Error: {error.message}
      </div>
    );
  }

  return (
    // Background ganti ke biru yang super soft (blue-50)
    <main className="min-h-screen bg-[#F0F7FF] dark:bg-gray-950 text-slate-800 dark:text-gray-100 p-4 sm:p-8 md:p-12 font-sans transition-colors duration-500">
      <div className="max-w-3xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-12 md:mb-16">
          <div className="flex flex-col gap-4">
            <Link
              href="/"
              className="group inline-flex items-center gap-4 transition-all"
            >
              {/* Logo Container: Dikasih background subtle biar logo lu "pop out" */}
              <div className="p-2.5 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-blue-50 dark:border-gray-800 group-hover:scale-105 group-hover:rotate-3 transition-all duration-300">
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="h-8 md:h-10 w-auto object-contain block dark:hidden"
                />
                <img
                  src="/logo-dark.png"
                  alt="Logo"
                  className="h-8 md:h-10 w-auto object-contain hidden dark:block"
                />
              </div>

              {/* Text Group: Dibikin vertikal tapi rapi di sebelah logo */}
              <div className="flex flex-col">
                <span className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tighter leading-none">
                  BAGUS<span className="text-blue-500">BLOG.</span>
                </span>
                <p className="text-[10px] md:text-xs font-bold text-blue-400 dark:text-blue-500 uppercase tracking-[0.2em] mt-1">
                  Personal Space
                </p>
              </div>
            </Link>

            {/* Slogan: Dipisah atau dikecilin biar nggak menuh-menuhin tempat */}
            <p className="text-slate-400 dark:text-gray-500 text-sm italic font-medium border-l-2 border-blue-100 dark:border-gray-800 pl-4 py-1">
              "The way to get started is to quit talking and begin doing."<br />
              ~ Walt Disney
            </p>
          </div>

          <Link
            href="/admin"
            className="bg-blue-600 dark:bg-blue-500 text-white px-6 py-2.5 rounded-2xl text-sm font-bold hover:bg-blue-700 transition-all shadow-md shadow-blue-200 dark:shadow-none active:scale-95"
          >
            Admin Panel
          </Link>
        </header>

        {/* List Postingan */}
        <div className="flex flex-col gap-8 md:gap-12">
          {posts && posts.length > 0 ? (
            posts.map((post: any) => (
              <article
                key={post.id}
                className="group relative bg-white dark:bg-gray-900 p-5 md:p-7 rounded-[2rem] border border-blue-100/50 dark:border-gray-800 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgb(59,130,246,0.1)] transition-all duration-500"
              >
                {post.image_url && (
                  <div className="mb-5 md:mb-6 overflow-hidden rounded-[1.5rem] bg-blue-50 dark:bg-gray-800 aspect-video border border-blue-50 dark:border-gray-800">
                    <img
                      src={post.image_url}
                      alt={post.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                )}

                <div className="px-1">
                  <Link href={`/blog/${post.id}`}>
                    <h2 className="text-xl md:text-2xl font-black text-slate-800 dark:text-white mb-2 md:mb-3 hover:text-blue-500 transition-colors cursor-pointer leading-tight">
                      {post.title}
                    </h2>
                  </Link>

                  {/* Deskripsi/Excerpt dengan warna text yang lebih soft */}
                  <div
                    className="prose prose-sm dark:prose-invert text-slate-500 dark:text-gray-400 line-clamp-2 mb-5 text-sm md:text-base"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />

                  <div className="flex items-center justify-between pt-4 border-t border-blue-50 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                      {/* Avatar Inisial Author */}
                      <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold uppercase">
                        {(post.author_name || "A").charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] text-blue-400 font-bold uppercase tracking-tight">
                          {post.author_name || "Admin"}
                        </span>
                        <span className="text-[10px] md:text-xs text-slate-400 dark:text-gray-500">
                          {new Date(post.created_at).toLocaleDateString(
                            "id-ID",
                            {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    </div>

                    <Link
                      href={`/blog/${post.id}`}
                      className="text-xs font-bold text-blue-500 hover:text-blue-700 flex items-center gap-1 group/link"
                    >
                      Baca Selengkapnya
                      <span className="group-hover/link:translate-x-1 transition-transform">
                        →
                      </span>
                    </Link>
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="text-center p-12 border-2 border-dashed border-blue-100 dark:border-gray-800 rounded-[2.5rem] bg-white/50 dark:bg-gray-900">
              <p className="text-slate-400 text-sm md:text-base">
                Belum ada cerita hari ini...
              </p>
            </div>
          )}
        </div>

        <footer className="mt-16 pb-12 text-center text-blue-200 dark:text-gray-800 text-[10px] md:text-xs font-bold tracking-widest uppercase">
          © 2026 BagusBlog — Soft Blue Edition
        </footer>
      </div>
    </main>
  );
}
