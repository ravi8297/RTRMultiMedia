import { middlewareAuth } from "@/lib/auth-edge";

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};

export default middlewareAuth;