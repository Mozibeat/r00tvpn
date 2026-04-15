import { withAuth } from "next-auth/middleware";

export default withAuth(
  function proxy() {},
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const pathname = req.nextUrl.pathname;
        if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
          return token?.role === "ADMIN";
        }

        if (pathname.startsWith("/dashboard")) {
          return !!token;
        }

        return true;
      },
    },
  },
);

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/api/admin/:path*"],
};
