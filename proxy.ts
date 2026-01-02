import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// ... (import tetap sama)

export default async function proxy(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          // Update request cookies biar getUser() dapet data terbaru
          request.cookies.set({ name, value, ...options });
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

  // PENTING: getUser() ini yang bakal nge-hit API Supabase beneran
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // LOG BIAR LU TAU DI TERMINAL:
  // console.log("PATH:", request.nextUrl.pathname, "USER ADA?", !!user);

  if (request.nextUrl.pathname.startsWith("/admin") && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (request.nextUrl.pathname.startsWith("/login") && user) {
    return NextResponse.redirect(new URL("/admin", request.url));
  }

  return response;
}

// ... config matcher tetap sama

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
