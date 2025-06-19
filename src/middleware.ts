import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher(["/sign-in"]);

export default clerkMiddleware((auth, req) => {
  if (isPublicRoute(req)) {
    return;
  }

  // If not public and not authenticated, Clerk will handle redirect
});

export const config = {
  matcher: ["/((?!_next|.*\\..*).*)"],
};
