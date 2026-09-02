import { NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request) {
  const { response, user } =
    await updateSession(request);

  const pathname = request.nextUrl.pathname;

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/signup";

  if (!user) {
    if (!isAuthPage) {
      const url =
        request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set(
        "next",
        pathname
      );
      return NextResponse.redirect(url);
    }

    return response;
  }

  if (isAuthPage) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Run on all routes except static assets and API routes.
     * API routes enforce their own 401s.
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
