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
    const { data } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setPosts(data);
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
    if (!editor) return;
    setLoading(true);
    const content = editor.getHTML();
    const payload = { title, content, image_url: imageUrl };

    if (editId) {
      const { error } = await supabase
        .from("posts")
        .update(payload)
        .eq("id", editId);
      if (!error) {
        setEditId(null);
        alert("Update Berhasil! ✨");
      }
    } else {
      const { error } = await supabase.from("posts").insert([payload]);
      if (!error) alert("Postingan Rilis! 🚀");
    }

    setLoading(false);
    setTitle("");
    setImageUrl("");
    editor.commands.setContent("");
    fetchPosts();
  };

  const handleDelete = async (id: number) => {
    if (confirm("Yakin mau hapus postingan?")) {
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) alert("Gagal hapus: " + error.message);
      else fetchPosts();
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 p-4 sm:p-6 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto">
        {/* Header: Stack di mobile, row di desktop */}
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 md:mb-10">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase">
              Editor Konten ✍️
            </h1>
            <p className="text-gray-400 font-bold text-xs md:text-sm">
              Welcome back, Admin Kece!
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => router.push("/")}
              className="flex-1 sm:flex-none text-xs md:text-sm font-bold bg-white border border-gray-200 px-4 md:px-6 py-2.5 rounded-full hover:bg-gray-50"
            >
              Home
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 sm:flex-none text-xs md:text-sm font-bold bg-red-500 text-white px-4 md:px-6 py-2.5 rounded-full shadow-lg hover:scale-105 transition-all"
            >
              Logout
            </button>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6 mb-20">
          {/* Card Utama: Padding lebih kecil di mobile */}
          <div className="bg-white p-5 sm:p-8 rounded-4xl md:rounded-[3rem] shadow-2xl border border-gray-100">
            <h2 className="text-xl md:text-2xl font-black mb-6 md:mb-8 text-center sm:text-left">
              {editId ? "📝 Edit Postingan" : "🚀 Buat Postingan Baru"}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-8">
              <div className="md:col-span-2 space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block ml-1">
                    Judul Artikel
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Kasih judul disini"
                    className="w-full p-4 md:p-5 bg-gray-50 rounded-2xl border border-gray-100 focus:ring-4 focus:ring-blue-100 outline-none font-bold text-lg md:text-xl transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block ml-1">
                    Isi Konten
                  </label>
                  {/* Toolbar: Sticky & Custom Scrollbar */}
                  <div className="sticky top-2 z-20 bg-gray-900 rounded-t-2xl md:rounded-t-3xl border border-gray-900 shadow-xl overflow-hidden">
                    <div className="flex items-center gap-1 p-1.5 md:p-2 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap">
                      {/* GROUP 1: HEADINGS */}
                      <div className="flex gap-1 pr-2 border-r border-gray-700 shrink-0">
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
                            className={`px-3 py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black transition-all ${
                              editor?.isActive("heading", { level: l })
                                ? "bg-blue-500 text-white"
                                : "text-gray-400 hover:text-white"
                            }`}
                          >
                            H{l}
                          </button>
                        ))}
                      </div>

                      {/* GROUP 2: FORMATTING */}
                      <div className="flex gap-1 px-2 border-r border-gray-700 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            editor?.chain().focus().toggleBold().run()
                          }
                          className={`px-3 py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold ${
                            editor?.isActive("bold")
                              ? "bg-blue-500 text-white"
                              : "text-gray-400 hover:text-white"
                          }`}
                        >
                          BOLD
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            editor?.chain().focus().toggleItalic().run()
                          }
                          className={`px-3 py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold ${
                            editor?.isActive("italic")
                              ? "bg-blue-500 text-white"
                              : "text-gray-400 hover:text-white"
                          }`}
                        >
                          ITALIC
                        </button>
                      </div>

                      {/* GROUP 3: CODE & IMAGE */}
                      <div className="flex gap-1 px-2 border-r border-gray-700 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            editor?.chain().focus().toggleCodeBlock().run()
                          }
                          className={`px-3 py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black ${
                            editor?.isActive("codeBlock")
                              ? "bg-green-500 text-white"
                              : "text-gray-400 hover:text-white"
                          }`}
                        >
                          {"</>"}
                        </button>
                        <button
                          type="button"
                          onClick={addImageInContent}
                          disabled={uploading}
                          className="px-3 py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-black text-gray-400 hover:text-white disabled:opacity-50"
                        >
                          {uploading ? "⌛" : "🖼️"}
                        </button>
                      </div>

                      {/* GROUP 4: ALIGNMENT */}
                      <div className="flex gap-1 pl-2 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            editor?.chain().focus().setTextAlign("left").run()
                          }
                          className={`p-2 rounded-lg ${
                            editor?.isActive({ textAlign: "left" })
                              ? "bg-blue-500 text-white"
                              : "text-gray-400"
                          }`}
                        >
                          <AlignLeftIcon />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            editor?.chain().focus().setTextAlign("center").run()
                          }
                          className={`p-2 rounded-lg ${
                            editor?.isActive({ textAlign: "center" })
                              ? "bg-blue-500 text-white"
                              : "text-gray-400"
                          }`}
                        >
                          <AlignCenterIcon />
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            editor?.chain().focus().setTextAlign("justify").run()
                          }
                          className={`p-2 rounded-lg ${
                            editor?.isActive({ textAlign: "justify" })
                            ? "bg-blue-500 text-white"
                            : "text-gray-400"
                          }`}
                        >
                          <AlignJustifyIcon/>
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="editor-container">
                    <EditorContent
                      editor={editor}
                      className="min-h-75 border border-gray-100 rounded-b-2xl md:rounded-b-3xl p-4 bg-gray-50/50"
                    />
                  </div>
                </div>
              </div>

              {/* Sidebar Thumbnail & Submit */}
              <div className="space-y-6">
                <label className="text-[10px] font-black uppercase text-gray-400 block ml-1">
                  Thumbnail
                </label>
                <div className="relative aspect-video rounded-3xl md:rounded-4xl border-4 border-dashed border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden group hover:border-blue-200 transition-all cursor-pointer">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      className="absolute inset-0 w-full h-full object-cover"
                      alt="preview"
                    />
                  ) : (
                    <div className="text-center p-4 text-gray-400 font-bold">
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
                  className="w-full bg-blue-600 text-white py-4 md:py-6 rounded-2xl md:rounded-4xl font-black text-base md:text-lg hover:bg-blue-700 disabled:bg-gray-200 transition-all shadow-xl shadow-blue-100"
                >
                  {loading ? "PROSES..." : editId ? "SIMPAN" : "PUBLISH"}
                </button>
                {editId && (
                  <button
                    type="button"
                    onClick={() => {
                      /* reset logic */
                    }}
                    className="w-full text-red-500 font-bold text-xs uppercase tracking-widest"
                  >
                    Batal Edit
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* List Postingan: 1 kolom di mobile, 2 di desktop */}
        <section>
          <h2 className="text-xl md:text-2xl font-black mb-6 flex items-center gap-3">
            <span className="bg-black text-white px-2.5 py-1 rounded-lg text-xs md:text-sm">
              {posts.length}
            </span>
            Daftar Cerita Lu
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white p-4 md:p-5 rounded-4xl border border-gray-100 flex gap-4 items-center shadow-sm"
              >
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gray-100 overflow-hidden shrink-0">
                  {post.image_url && (
                    <img
                      src={post.image_url}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate text-sm md:text-base">
                    {post.title}
                  </h3>
                  <p className="text-[10px] md:text-xs text-gray-400">
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditId(post.id)}
                    className="p-2 md:p-3 hover:bg-blue-50 text-blue-600 rounded-xl"
                  >
                    <EditIcon />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-2 md:p-3 hover:bg-red-50 text-red-500 rounded-xl"
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
