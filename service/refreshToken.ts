// Plain fetch — NOT a Server Action ("use server" removed)
// This file is safe to call from middleware (proxy.ts)

export const getNewAccessToken = async (refreshToken: string) => {
  try {
    const res = await fetch(
      `${process.env.BACKEND_API_URL}/api/auth/refresh-token`,
      {
        method: "POST",
        headers: {
          Cookie: `refreshToken=${refreshToken}`,
        },
        cache: "no-store",
      },
    );

    if (!res.ok) {
      return { success: false, message: "Failed to refresh token" };
    }

    const result = await res.json();
    return result;
  } catch {
    return { success: false, message: "Network error during token refresh" };
  }
};
