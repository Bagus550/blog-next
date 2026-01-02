"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false); // State khusus upload
  const [editId, setEditId] = useState<number | null>(null);
  const router = useRouter();

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `${Date.now()}.${fileExt}`; // Pake Date.now biar lebih unik
    const filePath = `${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("blog-images")
      .upload(filePath, file);

    if (uploadError) {
      alert("Gagal upload: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from("blog-images")
      .getPublicUrl(filePath);
    setImageUrl(data.publicUrl);
    setUploading(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

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
    setContent("");
    setImageUrl("");
    fetchPosts();
  };

  const startEdit = (post: any) => {
    setEditId(post.id);
    setTitle(post.title);
    setContent(post.content);
    setImageUrl(post.image_url || "");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <main className="min-h-screen bg-gray-50 text-gray-900 p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-black tracking-tighter">
            ADMIN PANEL 🛠️
          </h1>
          <button
            onClick={() => router.push("/")}
            className="text-sm font-bold bg-white px-4 py-2 rounded-full border shadow-sm hover:bg-gray-100"
          >
            ← Ke Beranda
          </button>
        </div>

        <div className="grid md:grid-cols-5 gap-10">
          {/* KIRI: FORM INPUT */}
          <div className="md:col-span-2">
            <form
              onSubmit={handleSubmit}
              className="sticky top-10 bg-white p-6 rounded-3xl border border-gray-200 shadow-xl"
            >
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                {editId ? "📝 Mode Edit" : "✍️ Buat Baru"}
              </h2>

              <div className="space-y-5">
                {/* UPLOAD BOX */}
                <div className="relative group">
                  <label className="block text-xs font-black uppercase text-gray-400 mb-2">
                    Cover Image
                  </label>
                  <div className="relative h-40 w-full rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden transition-all group-hover:border-blue-400">
                    {imageUrl ? (
                      <>
                        <img
                          src={imageUrl}
                          className="absolute inset-0 w-full h-full object-cover"
                          alt="preview"
                        />
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <p className="text-white text-xs font-bold">
                            Ganti Foto
                          </p>
                        </div>
                      </>
                    ) : (
                      <p className="text-gray-400 text-xs">
                        {uploading ? "Lagi Upload..." : "Klik buat upload"}
                      </p>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />
                  </div>
                </div>

                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Judul Postingan"
                  className="w-full p-4 bg-gray-100 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold"
                  required
                />
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="Tulis ceritamu..."
                  className="w-full p-4 bg-gray-100 rounded-xl h-40 focus:ring-2 focus:ring-blue-500 outline-none"
                  required
                />

                <button
                  type="submit"
                  disabled={loading || uploading}
                  className="w-full bg-blue-600 text-white py-4 rounded-xl font-black hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 disabled:bg-gray-300"
                >
                  {loading
                    ? "MENYIMPAN..."
                    : editId
                    ? "UPDATE POST"
                    : "PUBLISH SEKARANG"}
                </button>
                {editId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditId(null);
                      setTitle("");
                      setContent("");
                      setImageUrl("");
                    }}
                    className="w-full text-gray-400 text-sm font-bold"
                  >
                    Batal Edit
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* KANAN: LIST POSTINGAN */}
          <div className="md:col-span-3">
            <h2 className="text-xl font-bold mb-6">
              Kelola Konten ({posts.length})
            </h2>
            <div className="space-y-4">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="group bg-white p-4 rounded-2xl border border-gray-200 flex items-center gap-4 hover:shadow-md transition-all"
                >
                  <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden flex-shrink-0">
                    {post.image_url && (
                      <img
                        src={post.image_url}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-800 truncate">
                      {post.title}
                    </h3>
                    <p className="text-xs text-gray-400">
                      Dibuat: {new Date(post.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => startEdit(post)}
                      className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                    >
                      <EditIcon />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Hapus selamanya?"))
                          supabase
                            .from("posts")
                            .delete()
                            .eq("id", post.id)
                            .then(fetchPosts);
                      }}
                      className="p-2 hover:bg-red-50 text-red-500 rounded-lg transition-colors"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

// Icon simpel pake SVG
const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path>
  </svg>
);
const TrashIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
    <line x1="10" y1="11" x2="10" y2="17"></line>
    <line x1="14" y1="11" x2="14" y2="17"></line>
  </svg>
);
