"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Image from "@tiptap/extension-image"; // <--- Tambah ini
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight"; // <--- Tambah ini
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
        // WAJIB: matikan codeBlock bawaan biar gak tabrakan sama extension Lowlight
        codeBlock: false,
      }),
      // --- TAMBAHKAN INI BRAY ---
      Image.configure({
        HTMLAttributes: {
          class: "rounded-3xl shadow-lg max-w-full h-auto my-8 mx-auto block",
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      // --------------------------
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
    // 1. Bikin input file siluman
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      setUploading(true); // Pake state loading yang udah lu punya

      try {
        // 2. Upload ke Supabase Storage
        const fileName = `content-${Date.now()}.${file.name.split(".").pop()}`;
        const { error: uploadError } = await supabase.storage
          .from("blog-images")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        // 3. Ambil URL Public-nya
        const { data } = supabase.storage
          .from("blog-images")
          .getPublicUrl(fileName);

        // 4. Masukin ke Editor Tiptap
        editor?.chain().focus().setImage({ src: data.publicUrl }).run();
      } catch (error: any) {
        alert("Gagal upload gambar konten: " + error.message);
      } finally {
        setUploading(false);
      }
    };

    input.click(); // Triger klik inputnya
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
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

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
    if (
      confirm("Yakin mau hapus postingan ini bray? Gak bisa balik lagi loh!")
    ) {
      const { error } = await supabase.from("posts").delete().eq("id", id);
      if (error) alert("Gagal hapus: " + error.message);
      else fetchPosts();
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 p-6 md:p-12 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-black tracking-tighter uppercase">
              Editor Konten ✍️
            </h1>
            <p className="text-gray-400 font-bold text-sm">
              Welcome back, Admin Kece!
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/")}
              className="text-sm font-bold bg-white border border-gray-200 px-6 py-2 rounded-full hover:bg-gray-50"
            >
              Home
            </button>
            <button
              onClick={handleLogout}
              className="text-sm font-bold bg-red-500 text-white px-6 py-2 rounded-full shadow-lg hover:scale-105 transition-all"
            >
              Logout
            </button>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6 mb-20">
          <div className="bg-white p-8 rounded-[3rem] shadow-2xl border border-gray-100">
            <h2 className="text-2xl font-black mb-8">
              {editId ? "📝 Edit Postingan" : "🚀 Buat Postingan Baru"}
            </h2>

            <div className="grid md:grid-cols-3 gap-8 mb-8">
              <div className="md:col-span-2 space-y-6">
                <div>
                  <label className="text-xs font-black uppercase text-gray-400 mb-2 block">
                    Judul Artikel
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Kasih judul yang maut bray..."
                    className="w-full p-5 bg-gray-50 rounded-2xl border border-gray-100 focus:ring-4 focus:ring-blue-100 outline-none font-bold text-xl transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase text-gray-400 mb-2 block">
                    Isi Konten
                  </label>
                  <div className="sticky top-4 z-20 bg-gray-900 rounded-t-3xl border border-gray-900 shadow-xl overflow-hidden">
                    {/* Container Scrollable */}
                    <div className="flex items-center gap-2 p-2 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap">
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
                            className={`px-3 py-2 rounded-xl text-xs font-black transition-all ${
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
                      <div className="flex gap-1 pr-2 border-r border-gray-700 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            editor?.chain().focus().toggleBold().run()
                          }
                          className={`px-4 py-2 rounded-xl text-xs font-bold ${
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
                          className={`px-4 py-2 rounded-xl text-xs font-bold ${
                            editor?.isActive("italic")
                              ? "bg-blue-500 text-white"
                              : "text-gray-400 hover:text-white"
                          }`}
                        >
                          ITALIC
                        </button>
                      </div>

                      {/* GROUP 3: CODE & IMAGE (Sakti!) */}
                      <div className="flex gap-1 pr-2 border-r border-gray-700 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            editor?.chain().focus().toggleCodeBlock().run()
                          }
                          className={`px-3 py-2 rounded-xl text-xs font-black ${
                            editor?.isActive("codeBlock")
                              ? "bg-green-500 text-white"
                              : "text-gray-400 hover:text-white"
                          }`}
                        >
                          {"</> CODE"}
                        </button>
                        <button
                          type="button"
                          onClick={addImageInContent}
                          disabled={uploading}
                          className="px-3 py-2 rounded-xl text-xs font-black text-gray-400 hover:text-white disabled:opacity-50"
                        >
                          {uploading ? "⌛..." : "🖼️ IMAGE"}
                        </button>
                      </div>

                      {/* GROUP 4: ALIGNMENT */}
                      <div className="flex gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() =>
                            editor?.chain().focus().setTextAlign("left").run()
                          }
                          className={`p-2 rounded-xl ${
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
                          className={`p-2 rounded-xl ${
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
                            editor
                              ?.chain()
                              .focus()
                              .setTextAlign("justify")
                              .run()
                          }
                          className={`p-2 rounded-xl ${
                            editor?.isActive({ textAlign: "justify" })
                              ? "bg-blue-500 text-white"
                              : "text-gray-400"
                          }`}
                        >
                          <AlignJustifyIcon />
                        </button>
                      </div>
                    </div>
                  </div>
                  <EditorContent editor={editor} />
                </div>
              </div>

              <div className="space-y-6">
                <label className="text-xs font-black uppercase text-gray-400 block">
                  Thumbnail
                </label>
                <div className="relative aspect-video rounded-4xl border-4 border-dashed border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden group hover:border-blue-200 transition-all cursor-pointer">
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      className="absolute inset-0 w-full h-full object-cover"
                      alt="preview"
                    />
                  ) : (
                    <div className="text-center p-6 text-gray-400 font-bold">
                      <span className="text-3xl mb-2 block">📸</span>
                      <p className="text-xs">
                        {uploading ? "Lagi upload bray..." : "Klik buat upload"}
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
                  className="w-full bg-blue-600 text-white py-6 rounded-4xl font-black text-lg hover:bg-blue-700 disabled:bg-gray-200 transition-all shadow-xl shadow-blue-100"
                >
                  {loading
                    ? "LAGI PROSES..."
                    : editId
                    ? "SIMPAN PERUBAHAN"
                    : "PUBLISH SEKARANG"}
                </button>
                {editId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditId(null);
                      setTitle("");
                      setImageUrl("");
                      editor?.commands.setContent("");
                    }}
                    className="w-full text-red-500 font-bold text-sm"
                  >
                    Batal Edit
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>

        <section>
          <h2 className="text-2xl font-black mb-8 flex items-center gap-3">
            <span className="bg-black text-white px-3 py-1 rounded-lg text-sm">
              {posts.length}
            </span>{" "}
            Daftar Cerita Lu
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <div
                key={post.id}
                className="bg-white p-5 rounded-4xl border border-gray-100 flex gap-4 items-center shadow-sm hover:shadow-md transition-all"
              >
                <div className="w-20 h-20 rounded-2xl bg-gray-100 overflow-hidden shrink-0">
                  {post.image_url && (
                    <img
                      src={post.image_url}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 truncate">
                    {post.title}
                  </h3>
                  <p className="text-xs text-gray-400">
                    {new Date(post.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => setEditId(post.id)}
                    className="p-3 hover:bg-blue-50 text-blue-600 rounded-2xl"
                  >
                    <EditIcon />
                  </button>
                  <button
                    onClick={() => handleDelete(post.id)}
                    className="p-3 hover:bg-red-50 text-red-500 rounded-2xl"
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

// Icons (Simpel aja bray)
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
