import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtUtils } from "./utils/jwt";
import { JwtPayload } from "jsonwebtoken";
import { getNewAccessToken } from "./service/refreshToken";

const AUTH_ROUTES = ["/login", "/register"];
const PUBLIC_ROUTES = ["/", "/news"];

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  let accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;

  let decodedAccessToken = accessToken
    ? jwtUtils.verifyToken(accessToken, process.env.JWT_ACCESS_SECRET as string)
    : null;

  const decodedRefreshToken = refreshToken
    ? jwtUtils.verifyToken(
        refreshToken,
        process.env.JWT_REFRESH_SECRET as string,
      )
    : null;

  // Access token expired but refresh token still valid → get new access token
  let newAccessToken: string | undefined = undefined;

  if (
    !decodedAccessToken?.success &&
    decodedRefreshToken?.success &&
    refreshToken
  ) {
    const result = await getNewAccessToken(refreshToken);

    if (result?.success && result?.data?.accessToken) {
      newAccessToken = result.data.accessToken;
      accessToken = newAccessToken;
      decodedAccessToken = jwtUtils.verifyToken(
        newAccessToken!,
        process.env.JWT_ACCESS_SECRET as string,
      );
    } else {
    }
  } else if (decodedAccessToken?.success) {
  }

  // Extract role from decoded token
  let userRole: string | undefined;

  if (decodedAccessToken?.success && decodedAccessToken.data) {
    userRole = (decodedAccessToken.data as JwtPayload).role;
  }

  // Build the response — we need it ready so we can attach cookies
  let response: NextResponse;

  // Redirect logged-in users away from auth routes
  if (
    accessToken &&
    decodedAccessToken?.success &&
    AUTH_ROUTES.includes(pathname)
  ) {
    if (userRole === "USER") {
      response = NextResponse.redirect(new URL("/dashboard", request.url));
    } else if (userRole === "ADMIN") {
      response = NextResponse.redirect(
        new URL("/admin-dashboard", request.url),
      );
    } else if (userRole === "AUTHOR") {
      response = NextResponse.redirect(
        new URL("/author-dashboard", request.url),
      );
    } else {
      response = NextResponse.redirect(new URL("/", request.url));
    }

    // Set the new access token cookie on the redirect response if refreshed
    if (newAccessToken) {
      response.cookies.set("accessToken", newAccessToken, {
        httpOnly: true,
        maxAge: 60 * 60 * 24,
        sameSite: "lax",
        path: "/",
      });
    }

    return response;
  }

  const isPublicRoute = PUBLIC_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  const isAuthRoute = AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/"),
  );

  // Unauthenticated user trying to access protected route → redirect to login
  if (!accessToken && !isPublicRoute && !isAuthRoute) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Role-based access control
  if (pathname.startsWith("/dashboard") && userRole !== "USER") {
    return NextResponse.redirect(new URL("/not-found", request.url));
  } else if (pathname.startsWith("/admin-dashboard") && userRole !== "ADMIN") {
    return NextResponse.redirect(new URL("/not-found", request.url));
  } else if (
    pathname.startsWith("/author-dashboard") &&
    userRole !== "AUTHOR"
  ) {
    return NextResponse.redirect(new URL("/not-found", request.url));
  }

  response = NextResponse.next();

  // ✅ KEY FIX: Set refreshed access token on the actual response
  // This ensures the browser receives and stores the new cookie
  if (newAccessToken) {
    response.cookies.set("accessToken", newAccessToken, {
      httpOnly: true,
      maxAge: 60 * 60 * 24,
      sameSite: "lax",
      path: "/",
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
