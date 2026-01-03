import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export default async function proxy(request: NextRequest) {
  // 1. Inisialisasi response awal
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // 2. Setup Supabase Client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Sync ke request biar getUser() dapet data terbaru
          request.cookies.set({ name, value, ...options });
          // Sync ke response biar browser dapet cookie terbaru
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({ name, value: "", ...options });
          response = NextResponse.next({
            request: { headers: request.headers },
          });
          response.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  // 3. REFRESH SESSION (Ini kuncinya bray!)
  // Penting banget buat manggil getUser() biar session nggak expired di tengah jalan
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 4. Proteksi Rute Admin
  if (request.nextUrl.pathname.startsWith("/admin")) {
    if (!user) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 5. Proteksi Rute Login
  if (request.nextUrl.pathname.startsWith("/login") && user) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
