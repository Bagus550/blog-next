"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";

const lowlight = createLowlight(common);

export default function AdminPage() {
  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [adminName, setAdminName] = useState("Admin");
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        codeBlock: false,
      }),
      Image.configure({
        HTMLAttributes: {
          class: "rounded-3xl shadow-lg max-w-full h-auto my-8 mx-auto block",
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
        alignments: ["left", "center", "right", "justify"],
      }),
    ],
    content: "",
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class:
          "prose prose-lg focus:outline-none max-w-none min-h-[400px] p-6 bg-white rounded-b-3xl border-x border-b border-gray-200 shadow-inner",
      },
    },
  });

  // Ganti fungsi addImageInContent lama lu sama yang ini bray
  const addImageInContent = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      setUploading(true);

      try {
        const fileName = `content-${Date.now()}.${file.name.split(".").pop()}`;
        const { error: uploadError } = await supabase.storage
          .from("blog-images")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from("blog-images")
          .getPublicUrl(fileName);

        editor?.chain().focus().setImage({ src: data.publicUrl }).run();
      } catch (error: any) {
        alert("Gagal upload gambar konten: " + error.message);
      } finally {
        setUploading(false);
      }
    };

    input.click();
  };

  const fetchPosts = async () => {
    // Ambil data user yang lagi aktif
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      setUserId(user.id);
      setAdminName(user.user_metadata?.full_name || user.email?.split("@")[0]);

      const { data } = await supabase
        .from("posts")
        .select("*")
        .eq("user_id", user.id) // <--- FILTER SAKTI!
        .order("created_at", { ascending: false });

      if (data) setPosts(data);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (editId && editor) {
      const postToEdit = posts.find((p) => p.id === editId);
      if (postToEdit) {
        editor.commands.setContent(postToEdit.content);
        setTitle(postToEdit.title);
        setImageUrl(postToEdit.image_url || "");
      }
    }
  }, [editId, editor, posts]);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      window.location.href = "/";
    } catch (err) {
      console.error("Gagal logout bray", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_OUT") {
        router.push("/login");
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fileName = `${Date.now()}.${file.name.split(".").pop()}`;
    const { error: uploadError } = await supabase.storage
      .from("blog-images")
      .upload(fileName, file);
    if (uploadError) {
      alert("Gagal: " + uploadError.message);
      setUploading(false);
      return;
    }
    const { data } = supabase.storage
      .from("blog-images")
      .getPublicUrl(fileName);
    setImageUrl(data.publicUrl);
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Double check user langsung dari source-nya
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Sesi lu abis bray, coba login lagi!");
        router.push("/login");
        return;
      }

      const currentUserId = user.id; // Pake ini, jangan cuma userId dari state
      const content = editor?.getHTML() || "";

      const payload = {
        title,
        content,
        image_url: imageUrl,
        user_id: currentUserId,
        author_name: adminName, // <--- TAMBAHIN BARIS INI BRAY!
        slug: title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)+/g, ""),
      };

      if (editId) {
        const { error } = await supabase
          .from("posts")
          .update(payload)
          .eq("id", editId)
          .eq("user_id", currentUserId);

        if (error) throw error;
        alert("Update Berhasil! ✨");
      } else {
        const { error } = await supabase.from("posts").insert([payload]);
        if (error) throw error;
        alert("Postingan Rilis! 🚀");
      }

      // Reset form
      setTitle("");
      setImageUrl("");
      editor?.commands.setContent("");
      setEditId(null);
      fetchPosts();
    } catch (error: any) {
      console.error("Detail Error:", error);
      alert("Gagal bray: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Yakin mau hapus postingan?")) {
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) alert("Gagal hapus: " + error.message);
      else fetchPosts();
    }
  };

  return (
    <main className="min-h-screen bg-[#F0F7FF] dark:bg-gray-950 text-slate-800 dark:text-gray-100 p-4 sm:p-6 md:p-12 font-sans transition-colors duration-500">
      <div className="max-w-5xl mx-auto">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 md:mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase text-blue-900 dark:text-white">
              Editor Konten ✍️
            </h1>
            <p className="text-blue-400 dark:text-blue-500 font-bold text-xs md:text-sm">
              Welcome back,{" "}
              <span className="text-blue-600">{adminName || "Admin Kece"}</span>
              ! 🔥
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => router.push("/")}
              className="flex-1 sm:flex-none text-xs md:text-sm font-bold bg-white dark:bg-gray-900 border border-blue-100 dark:border-gray-800 text-blue-600 dark:text-gray-300 px-4 md:px-6 py-2.5 rounded-2xl hover:bg-blue-50 dark:hover:bg-gray-800 transition-all shadow-sm"
            >
              Home
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 sm:flex-none text-xs md:text-sm font-bold bg-red-500 text-white px-4 md:px-6 py-2.5 rounded-2xl shadow-lg shadow-red-200 dark:shadow-none hover:scale-105 transition-all"
            >
              Logout
            </button>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6 mb-20">
          <div className="bg-white dark:bg-gray-900 p-5 sm:p-8 rounded-[2.5rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-blue-50 dark:border-gray-800">
            <h2 className="text-xl md:text-2xl font-black mb-6 md:mb-8 text-center sm:text-left text-slate-800 dark:text-white">
              {editId ? "📝 Edit Postingan" : "🚀 Buat Postingan Baru"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-8">
              <div className="md:col-span-2 space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-blue-300 dark:text-gray-500 mb-2 block ml-1">
                    Judul Artikel
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Kasih judul disini"
                    className="w-full p-4 md:p-5 bg-blue-50/50 dark:bg-gray-950 dark:text-white rounded-2xl border border-blue-100 dark:border-gray-800 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/20 outline-none font-bold text-lg md:text-xl transition-all"
                    required
                  />
                </div>

                <div className="group transition-all duration-300">
                  <label className="text-[11px] font-black uppercase tracking-widest text-blue-300 dark:text-gray-500 mb-3 block ml-1 group-focus-within:text-blue-500 transition-colors">
                    Isi Konten 🖋️
                  </label>

                  <div className="relative border-2 border-blue-50 dark:border-gray-800 rounded-[2rem] overflow-hidden bg-white dark:bg-gray-950 shadow-sm group-focus-within:border-blue-500/30 transition-all duration-500">
                    {/* Toolbar Dark Mode */}
                    <div className="sticky top-0 z-20 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-blue-50 dark:border-gray-800 px-3 py-2">
                      <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
                        {/* GROUP 1: HEADINGS */}
                        <div className="flex bg-blue-50/50 dark:bg-gray-950 p-1 rounded-xl shrink-0">
                          {[1, 2, 3].map((l) => (
                            <button
                              key={l}
                              type="button"
                              onClick={() =>
                                editor
                                  ?.chain()
                                  .focus()
                                  .toggleHeading({ level: l as any })
                                  .run()
                              }
                              className={`w-9 h-9 flex items-center justify-center rounded-lg text-xs font-black transition-all ${
                                editor?.isActive("heading", { level: l })
                                  ? "bg-white dark:bg-gray-800 text-blue-600 shadow-sm"
                                  : "text-blue-300 dark:text-gray-500 hover:text-blue-500"
                              }`}
                            >
                              H{l}
                            </button>
                          ))}
                        </div>

                        <div className="w-px h-6 bg-blue-100 dark:bg-gray-800 mx-1 shrink-0" />

                        {/* GROUP 2: FORMATTING */}
                        <div className="flex gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              editor?.chain().focus().toggleBold().run()
                            }
                            className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${
                              editor?.isActive("bold")
                                ? "bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                                : "text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
                            }`}
                          >
                            <strong className="text-sm">B</strong>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              editor?.chain().focus().toggleItalic().run()
                            }
                            className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${
                              editor?.isActive("italic")
                                ? "bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                                : "text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
                            }`}
                          >
                            <em className="font-serif text-sm italic">I</em>
                          </button>
                        </div>

                        <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 mx-1 shrink-0" />

                        {/* GROUP 3: SPECIALS */}
                        <div className="flex gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() =>
                              editor?.chain().focus().toggleCodeBlock().run()
                            }
                            className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${
                              editor?.isActive("codeBlock")
                                ? "bg-gray-900 dark:bg-white text-white dark:text-black"
                                : "text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
                            }`}
                          >
                            <span className="text-[10px]">{"</>"}</span>
                          </button>
                          <button
                            type="button"
                            onClick={addImageInContent}
                            disabled={uploading}
                            className="w-9 h-9 flex items-center justify-center rounded-xl text-gray-400 dark:text-gray-500 hover:bg-blue-50 dark:hover:bg-gray-800 hover:text-blue-600 transition-all disabled:opacity-30"
                          >
                            {uploading ? (
                              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent animate-spin rounded-full" />
                            ) : (
                              "🖼️"
                            )}
                          </button>
                        </div>

                        <div className="w-px h-6 bg-gray-200 dark:bg-gray-800 mx-1 shrink-0" />

                        {/* GROUP 4: ALIGNMENT */}
                        <div className="flex gap-1 shrink-0">
                          {[
                            { name: "left", icon: <AlignLeftIcon /> },
                            {
                              name: "center",
                              icon: <AlignCenterIcon />,
                            },
                            {
                              name: "justify",
                              icon: <AlignJustifyIcon />,
                            },
                          ].map((align) => (
                            <button
                              key={align.name}
                              type="button"
                              onClick={() =>
                                editor
                                  ?.chain()
                                  .focus()
                                  .setTextAlign(align.name)
                                  .run()
                              }
                              className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all ${
                                editor?.isActive({ textAlign: align.name })
                                  ? "bg-blue-50 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400"
                                  : "text-gray-400 dark:text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800"
                              }`}
                            >
                              {align.icon}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Editor Area */}
                    <div className="editor-container relative bg-white dark:bg-gray-950 transition-colors">
                      <EditorContent
                        editor={editor}
                        className="min-h-[400px] p-6 md:p-10 focus:outline-none bg-transparent dark:text-white prose prose-sm md:prose-lg max-w-none dark:prose-invert"
                      />
                      <div className="absolute bottom-4 right-6 text-[10px] font-bold text-gray-300 dark:text-gray-700 uppercase tracking-widest pointer-events-none">
                        Tiptap Editor v2.0
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar Thumbnail & Submit */}
              <div className="space-y-6">
                <label className="text-[10px] font-black uppercase text-blue-300 dark:text-gray-500 block ml-1">
                  Thumbnail
                </label>
                <div className="relative aspect-video rounded-[2rem] border-4 border-dashed border-blue-100 dark:border-gray-800 bg-blue-50/30 dark:bg-gray-950 flex items-center justify-center overflow-hidden group hover:border-blue-300 transition-all cursor-pointer">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      className="absolute inset-0 w-full h-full object-cover"
                      alt="preview"
                    />
                  ) : (
                    <div className="text-center p-4 text-blue-300 dark:text-gray-500 font-bold">
                      <span className="text-2xl mb-1 block">📸</span>
                      <p className="text-[10px]">
                        {uploading ? "Uploading..." : "Klik upload"}
                      </p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="w-full bg-blue-600 text-white py-4 md:py-6 rounded-2xl md:rounded-[2rem] font-black text-base md:text-lg hover:bg-blue-700 disabled:bg-gray-200 transition-all shadow-xl shadow-blue-100 dark:shadow-none"
                >
                  {loading
                    ? "PROSES..."
                    : editId
                    ? "SIMPAN"
                    : "PUBLISH SEKARANG"}
                </button>
                {editId && (
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm("Yakin batalkan edit?")) {
                        // 1. Reset input judul
                        setTitle("");

                        // 2. RESET TIPTAP (Ini kuncinya biar gak silau & kosong)
                        if (editor) {
                          editor.commands.clearContent(); // Bisa pake clearContent() atau setContent("")
                        }

                        setImageUrl("");

                        setEditId(null);

                        router.push("/admin");
                      }
                    }}
                    className="w-full text-red-500 font-bold text-xs uppercase tracking-widest hover:underline py-2"
                  >
                    Batal Edit
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* List Postingan */}
        <section className="mb-20">
          <h2 className="text-xl md:text-2xl font-black mb-6 flex items-center gap-3 text-slate-800 dark:text-white">
            <span className="bg-blue-600 text-white px-3 py-1 rounded-xl text-xs md:text-sm">
              {posts.length}
            </span>
            Daftar Cerita Lu
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white dark:bg-gray-900 p-4 md:p-5 rounded-[2rem] border border-blue-50 dark:border-gray-800 flex gap-4 items-center shadow-sm hover:shadow-blue-200/20 transition-all"
              >
                {/* Thumbnail Kecil */}
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-blue-50 dark:bg-gray-800 overflow-hidden shrink-0 border border-blue-100 dark:border-gray-700">
                  {post.image_url && (
                    <img
                      src={post.image_url}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 dark:text-white truncate text-sm md:text-base">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-black bg-blue-50 dark:bg-blue-900/40 text-blue-500 px-2 py-0.5 rounded-lg uppercase">
                      {post.author_name || "Admin"}
                    </span>
                    <p className="text-[10px] text-slate-400 dark:text-gray-500 font-medium">
                      {new Date(post.created_at).toLocaleDateString("id-ID")}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditId(post.id)}
                    className="p-2 md:p-3 hover:bg-blue-50 dark:hover:bg-blue-900/40 text-blue-500 rounded-xl transition-colors"
                  >
                    <EditIcon />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-2 md:p-3 hover:bg-red-50 dark:hover:bg-red-900/40 text-red-400 rounded-xl transition-colors"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}

// Icons
const AlignLeftIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="17" y1="10" x2="3" y2="10"></line>
    <line x1="21" y1="6" x2="3" y2="6"></line>
    <line x1="21" y1="14" x2="3" y2="14"></line>
    <line x1="17" y1="18" x2="3" y2="18"></line>
  </svg>
);
const AlignCenterIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="10" x2="6" y2="10"></line>
    <line x1="21" y1="6" x2="3" y2="6"></line>
    <line x1="21" y1="14" x2="3" y2="14"></line>
    <line x1="18" y1="18" x2="6" y2="18"></line>
  </svg>
);
const AlignJustifyIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="21" y1="10" x2="3" y2="10"></line>
    <line x1="21" y1="6" x2="3" y2="6"></line>
    <line x1="21" y1="14" x2="3" y2="14"></line>
    <line x1="21" y1="18" x2="3" y2="18"></line>
  </svg>
);
const EditIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
  </svg>
);
const TrashIcon = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);
